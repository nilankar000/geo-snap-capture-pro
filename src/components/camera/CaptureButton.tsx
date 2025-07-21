import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, Square, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CameraSettings } from '@/types/camera';

interface CaptureButtonProps {
  settings: CameraSettings;
  onCapture: () => Promise<void>;
  onSwitchCamera: () => void;
  onModeChange: (mode: 'photo' | 'video') => void;
  isCapturing: boolean;
  isRecording?: boolean;
  className?: string;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({
  settings,
  onCapture,
  onSwitchCamera,
  onModeChange,
  isCapturing,
  isRecording = false,
  className
}) => {
  const [recordingTime, setRecordingTime] = useState(0);

  const handleCapture = async () => {
    if (settings.captureMode === 'video' && isRecording) {
      // Stop recording
      await onCapture();
      setRecordingTime(0);
    } else {
      // Start capture/recording
      await onCapture();
    }
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {/* Mode Selector */}
      <div className="flex rounded-full bg-background/20 p-1">
        <Button
          variant={settings.captureMode === 'photo' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('photo')}
          className="rounded-full"
        >
          <Camera className="w-4 h-4" />
        </Button>
        <Button
          variant={settings.captureMode === 'video' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('video')}
          className="rounded-full"
        >
          <Video className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Capture Button */}
      <div className="relative">
        {isRecording && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-mono">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}
        
        <Button
          size="lg"
          onClick={handleCapture}
          disabled={isCapturing && !isRecording}
          className={cn(
            'w-16 h-16 rounded-full border-4 border-white/30 transition-all duration-200',
            settings.captureMode === 'video' && isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-white hover:bg-white/90',
            isCapturing && !isRecording && 'opacity-50 cursor-not-allowed'
          )}
        >
          {settings.captureMode === 'video' && isRecording ? (
            <Square className="w-6 h-6 text-white" />
          ) : settings.captureMode === 'video' ? (
            <div className="w-6 h-6 bg-red-500 rounded-full" />
          ) : (
            <Camera className="w-6 h-6 text-black" />
          )}
        </Button>
      </div>

      {/* Camera Switch Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSwitchCamera}
        className="rounded-full bg-background/20 text-white hover:bg-background/30"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};