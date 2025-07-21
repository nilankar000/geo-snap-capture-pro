import { useState, useEffect, useCallback } from 'react';
import { gpsService } from '@/services/gpsService';
import { GPSCoordinates, GPSState, ManualGPSData } from '@/types/gps';

export const useGPS = () => {
  const [state, setState] = useState<GPSState>({
    isTracking: false,
    hasPermission: false,
    mode: 'real'
  });

  const requestPermissions = useCallback(async () => {
    const hasPermission = await gpsService.requestPermissions();
    setState(prev => ({ ...prev, hasPermission }));
    return hasPermission;
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<GPSCoordinates | null> => {
    try {
      const position = await gpsService.getCurrentPosition();
      setState(prev => ({ ...prev, currentLocation: position }));
      return position;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to get location' 
      }));
      return null;
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!state.hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setState(prev => ({ ...prev, isTracking: true }));

    try {
      await gpsService.startWatching((position) => {
        setState(prev => ({ ...prev, currentLocation: position }));
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isTracking: false,
        error: error instanceof Error ? error.message : 'Failed to start tracking' 
      }));
    }
  }, [state.hasPermission, requestPermissions]);

  const stopTracking = useCallback(async () => {
    await gpsService.stopWatching();
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  const setMode = useCallback((mode: 'real' | 'manual') => {
    setState(prev => ({ ...prev, mode }));
    
    if (mode === 'real' && !state.isTracking) {
      startTracking();
    } else if (mode === 'manual' && state.isTracking) {
      stopTracking();
    }
  }, [state.isTracking, startTracking, stopTracking]);

  const setManualData = useCallback((data: ManualGPSData | undefined) => {
    setState(prev => ({ 
      ...prev, 
      selectedManualData: data,
      currentLocation: data ? data.coordinates : prev.currentLocation
    }));
  }, []);

  const formatCoordinates = useCallback((coords: GPSCoordinates): string => {
    return gpsService.formatCoordinates(coords);
  }, []);

  const formatDMS = useCallback((decimal: number, isLatitude: boolean): string => {
    return gpsService.formatDMS(decimal, isLatitude);
  }, []);

  useEffect(() => {
    return () => {
      if (state.isTracking) {
        stopTracking();
      }
    };
  }, []);

  return {
    state,
    requestPermissions,
    getCurrentPosition,
    startTracking,
    stopTracking,
    setMode,
    setManualData,
    formatCoordinates,
    formatDMS,
    isSupported: gpsService.isSupported()
  };
};