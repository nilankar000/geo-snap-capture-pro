import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { CameraSettings, CameraState } from '@/types/camera';

class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  async initializeCamera(
    videoElement: HTMLVideoElement, 
    settings: CameraSettings
  ): Promise<CameraState> {
    try {
      this.videoElement = videoElement;

      // Stop existing stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: settings.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;

      return {
        isInitialized: true,
        hasPermission: true,
        isCapturing: false,
        stream: this.stream
      };
    } catch (error) {
      console.error('Camera initialization failed:', error);
      return {
        isInitialized: false,
        hasPermission: false,
        isCapturing: false,
        error: error instanceof Error ? error.message : 'Camera initialization failed'
      };
    }
  }

  async capturePhoto(): Promise<string> {
    if (!this.videoElement || !this.stream) {
      throw new Error('Camera not initialized');
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas context not available');
    }

    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    context.drawImage(this.videoElement, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  async captureWithCapacitor(settings: CameraSettings): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: settings.quality,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: settings.facingMode === 'user' ? CameraDirection.Front : CameraDirection.Rear
      });

      return image.dataUrl || '';
    } catch (error) {
      console.error('Capacitor camera capture failed:', error);
      throw error;
    }
  }

  switchCamera(settings: CameraSettings): void {
    if (this.videoElement) {
      this.initializeCamera(this.videoElement, {
        ...settings,
        facingMode: settings.facingMode === 'user' ? 'environment' : 'user'
      });
    }
  }

  getAspectRatio(aspectRatio: string): { width: number; height: number } {
    switch (aspectRatio) {
      case '1:1': return { width: 1, height: 1 };
      case '4:3': return { width: 4, height: 3 };
      case '16:9': return { width: 16, height: 9 };
      case '3:4': return { width: 3, height: 4 };
      default: return { width: 16, height: 9 };
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

export const cameraService = new CameraService();