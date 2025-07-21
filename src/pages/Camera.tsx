import React, { useState, useCallback, useEffect } from 'react';
import { CameraPreview } from '@/components/camera/CameraPreview';
import { CaptureButton } from '@/components/camera/CaptureButton';
import { AspectRatioSelector } from '@/components/camera/AspectRatioSelector';
import { GPSOverlay } from '@/components/gps/GPSOverlay';
import { GPSModeSelector } from '@/components/gps/GPSModeSelector';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCamera } from '@/hooks/useCamera';
import { useGPS } from '@/hooks/useGPS';
import { useCapture } from '@/hooks/useCapture';
import { useDatabase } from '@/hooks/useDatabase';
import { Settings, Menu, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CameraSettings } from '@/types/camera';

export const Camera: React.FC = () => {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showGPSSelector, setShowGPSSelector] = useState(false);
  const [customData, setCustomData] = useState<Record<string, string>>({});

  // Initialize hooks
  const {
    state: cameraState,
    settings: cameraSettings,
    videoRef,
    requestPermissions: requestCameraPermissions,
    capturePhoto,
    switchCamera,
    updateSettings: updateCameraSettings,
  } = useCamera({
    aspectRatio: '16:9',
    quality: 0.8,
    facingMode: 'environment',
    captureMode: 'photo'
  });

  const {
    state: gpsState,
    requestPermissions: requestGPSPermissions,
    startTracking,
    setMode: setGPSMode,
    setManualData,
  } = useGPS();

  const {
    isCapturing,
    captureWithOverlay,
    lastCapture
  } = useCapture();

  const {
    isInitialized: dbInitialized,
    manualGPSData,
    overlayTemplates
  } = useDatabase();

  // Get current template (using first available for now)
  const currentTemplate = overlayTemplates[0] || {
    id: 'default',
    name: 'Default',
    fields: [
      { id: 'lat', label: 'Lat', value: '', type: 'coordinate' as const, visible: true, order: 1 },
      { id: 'lng', label: 'Lng', value: '', type: 'coordinate' as const, visible: true, order: 2 },
      { id: 'timestamp', label: 'Time', value: '', type: 'datetime' as const, visible: true, order: 3 },
    ],
    layout: 'horizontal' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    textColor: '#ffffff',
    fontSize: 14,
    showLogo: true,
    logoPosition: 'right' as const
  };

  // Initialize permissions and services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [cameraGranted, gpsGranted] = await Promise.all([
          requestCameraPermissions(),
          requestGPSPermissions()
        ]);

        if (!cameraGranted) {
          toast({
            title: "Camera Permission Required",
            description: "Please grant camera access to use this app.",
            variant: "destructive"
          });
        }

        if (!gpsGranted) {
          toast({
            title: "Location Permission Required", 
            description: "GPS functionality will be limited without location access.",
            variant: "destructive"
          });
        }

        if (gpsGranted && gpsState.mode === 'real') {
          startTracking();
        }
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();
  }, []);

  const handleCapture = useCallback(async () => {
    try {
      if (cameraSettings.captureMode === 'photo') {
        // Capture photo
        const rawImage = await capturePhoto();
        
        // Create processed image with GPS overlay
        const result = await captureWithOverlay(
          rawImage,
          gpsState.currentLocation,
          currentTemplate,
          customData
        );

        toast({
          title: "Photo Captured",
          description: "Raw and processed images saved successfully."
        });

        console.log('Capture result:', result);
      } else {
        // Video recording logic would go here
        toast({
          title: "Video Recording",
          description: "Video recording functionality coming soon."
        });
      }
    } catch (error) {
      console.error('Capture failed:', error);
      toast({
        title: "Capture Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  }, [capturePhoto, captureWithOverlay, gpsState.currentLocation, currentTemplate, customData, cameraSettings.captureMode, toast]);

  const handleModeChange = useCallback((mode: 'photo' | 'video') => {
    updateCameraSettings({ captureMode: mode });
  }, [updateCameraSettings]);

  const handleCameraSettingsChange = useCallback((settings: Partial<CameraSettings>) => {
    updateCameraSettings(settings);
  }, [updateCameraSettings]);

  if (!dbInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing GPS Camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white bg-black/20 hover:bg-black/40">
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Camera Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <AspectRatioSelector
                  settings={cameraSettings}
                  onSettingsChange={handleCameraSettingsChange}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showGPSSelector} onOpenChange={setShowGPSSelector}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white bg-black/20 hover:bg-black/40">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>GPS Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <GPSModeSelector
                  gpsState={gpsState}
                  manualGPSData={manualGPSData}
                  onModeChange={setGPSMode}
                  onManualDataSelect={setManualData}
                  onManageData={() => {
                    // Navigate to manual GPS management page
                    console.log('Navigate to manual GPS page');
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Camera Preview */}
      <div className="absolute inset-0">
        <CameraPreview
          settings={cameraSettings}
          onStreamReady={(video) => {
            videoRef.current = video;
          }}
          className="w-full h-full"
        />
      </div>

      {/* GPS Overlay */}
      <GPSOverlay
        gpsData={gpsState.currentLocation}
        template={currentTemplate}
        customData={customData}
        className="z-10"
      />

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Aspect Ratio Selector - Mobile */}
          <div className="md:hidden">
            <AspectRatioSelector
              settings={cameraSettings}
              onSettingsChange={handleCameraSettingsChange}
              className="bg-black/20 backdrop-blur-sm rounded-lg p-2"
            />
          </div>

          {/* Capture Controls */}
          <CaptureButton
            settings={cameraSettings}
            onCapture={handleCapture}
            onSwitchCamera={switchCamera}
            onModeChange={handleModeChange}
            isCapturing={isCapturing || cameraState.isCapturing}
          />
        </div>
      </div>

      {/* Last Capture Preview */}
      {lastCapture && (
        <div className="absolute top-4 right-4 z-30">
          <div className="relative">
            <img
              src={lastCapture.processedImage}
              alt="Last capture"
              className="w-16 h-16 rounded-lg object-cover border-2 border-white/30"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-black/50 text-white hover:bg-black/70"
              onClick={() => {
                // Clear last capture or navigate to gallery
                console.log('Handle last capture');
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(cameraState.error || gpsState.error) && (
        <div className="absolute bottom-20 left-4 right-4 z-30">
          <div className="bg-destructive/90 text-destructive-foreground p-3 rounded-lg text-sm">
            {cameraState.error || gpsState.error}
          </div>
        </div>
      )}
    </div>
  );
};