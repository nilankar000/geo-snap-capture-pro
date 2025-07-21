import { Geolocation, Position } from '@capacitor/geolocation';
import { GPSCoordinates, GPSState } from '@/types/gps';

class GPSService {
  private watchId: string | null = null;
  private currentPosition: GPSCoordinates | null = null;

  async requestPermissions(): Promise<boolean> {
    // Check if we're on web platform first
    if (this.isWeb()) {
      return this.requestWebPermissions();
    }

    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('GPS permission request failed:', error);
      return this.requestWebPermissions();
    }
  }

  private isWeb(): boolean {
    return !(window as any).Capacitor || (window as any).Capacitor.platform === 'web';
  }

  private async requestWebPermissions(): Promise<boolean> {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  async getCurrentPosition(): Promise<GPSCoordinates> {
    if (this.isWeb()) {
      return this.getWebPosition();
    }

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });

      return this.convertPosition(position);
    } catch (error) {
      console.error('Failed to get current position:', error);
      return this.getWebPosition();
    }
  }

  private async getWebPosition(): Promise<GPSCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    });
  }

  async startWatching(callback: (position: GPSCoordinates) => void): Promise<string> {
    if (this.isWeb()) {
      return this.startWebWatching(callback);
    }

    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        },
        (position) => {
          if (position) {
            const coords = this.convertPosition(position);
            this.currentPosition = coords;
            callback(coords);
          }
        }
      );

      return this.watchId;
    } catch (error) {
      console.error('Failed to start GPS watching:', error);
      return this.startWebWatching(callback);
    }
  }

  private async startWebWatching(callback: (position: GPSCoordinates) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };
          this.currentPosition = coords;
          callback(coords);
        },
        (error) => console.error('GPS watch error:', error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );

      this.watchId = id.toString();
      resolve(id.toString());
    });
  }

  async stopWatching(): Promise<void> {
    if (this.watchId) {
      if (this.isWeb()) {
        if (navigator.geolocation) {
          navigator.geolocation.clearWatch(parseInt(this.watchId));
        }
      } else {
        try {
          await Geolocation.clearWatch({ id: this.watchId });
        } catch (error) {
          // Fallback to browser geolocation
          if (typeof this.watchId === 'string' && navigator.geolocation) {
            navigator.geolocation.clearWatch(parseInt(this.watchId));
          }
        }
      }
      this.watchId = null;
    }
  }

  getCurrentCoordinates(): GPSCoordinates | null {
    return this.currentPosition;
  }

  private convertPosition(position: Position): GPSCoordinates {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude || undefined,
      accuracy: position.coords.accuracy,
      timestamp: new Date(position.timestamp)
    };
  }

  formatCoordinates(coords: GPSCoordinates): string {
    const latDir = coords.latitude >= 0 ? 'N' : 'S';
    const lngDir = coords.longitude >= 0 ? 'E' : 'W';
    
    const lat = Math.abs(coords.latitude).toFixed(6);
    const lng = Math.abs(coords.longitude).toFixed(6);
    
    return `${lat}°${latDir}, ${lng}°${lngDir}`;
  }

  formatDMS(decimal: number, isLatitude: boolean): string {
    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutes = Math.floor((abs - degrees) * 60);
    const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(2);
    
    const direction = isLatitude 
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');
    
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  }

  isSupported(): boolean {
    return !!(navigator.geolocation || (window as any).Geolocation);
  }
}

export const gpsService = new GPSService();