import { useState, useEffect, useRef, useCallback } from 'react';
import { cameraService } from '@/services/cameraService';
import { CameraSettings, CameraState } from '@/types/camera';

export const useCamera = (initialSettings: CameraSettings) => {
  const [state, setState] = useState<CameraState>({
    isInitialized: false,
    hasPermission: false,
    isCapturing: false
  });
  const [settings, setSettings] = useState<CameraSettings>(initialSettings);
  const videoRef = useRef<HTMLVideoElement>(null);

  const requestPermissions = useCallback(async () => {
    const hasPermission = await cameraService.requestPermissions();
    setState(prev => ({ ...prev, hasPermission }));
    return hasPermission;
  }, []);

  const initializeCamera = useCallback(async () => {
    if (!videoRef.current) return;

    setState(prev => ({ ...prev, isCapturing: true }));
    
    try {
      const cameraState = await cameraService.initializeCamera(videoRef.current, settings);
      setState(prev => ({ ...prev, ...cameraState, isCapturing: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isCapturing: false, 
        error: error instanceof Error ? error.message : 'Camera initialization failed' 
      }));
    }
  }, [settings]);

  const capturePhoto = useCallback(async (): Promise<string> => {
    setState(prev => ({ ...prev, isCapturing: true }));
    
    try {
      const dataUrl = await cameraService.capturePhoto();
      setState(prev => ({ ...prev, isCapturing: false }));
      return dataUrl;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isCapturing: false, 
        error: error instanceof Error ? error.message : 'Capture failed' 
      }));
      throw error;
    }
  }, []);

  const switchCamera = useCallback(() => {
    const newSettings = {
      ...settings,
      facingMode: settings.facingMode === 'user' ? 'environment' as const : 'user' as const
    };
    setSettings(newSettings);
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<CameraSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const stopCamera = useCallback(() => {
    cameraService.stopCamera();
    setState(prev => ({ ...prev, isInitialized: false }));
  }, []);

  useEffect(() => {
    if (state.hasPermission && videoRef.current && !state.isInitialized) {
      initializeCamera();
    }
  }, [state.hasPermission, initializeCamera, state.isInitialized]);

  useEffect(() => {
    if (state.isInitialized && videoRef.current) {
      initializeCamera();
    }
  }, [settings.facingMode, settings.aspectRatio]);

  return {
    state,
    settings,
    videoRef,
    requestPermissions,
    initializeCamera,
    capturePhoto,
    switchCamera,
    updateSettings,
    stopCamera,
    isSupported: cameraService.isSupported()
  };
};