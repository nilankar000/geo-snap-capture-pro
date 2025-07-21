import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { CameraSettings } from '@/types/camera';
import { cameraService } from '@/services/cameraService';

interface CameraPreviewProps {
  settings: CameraSettings;
  onStreamReady?: (video: HTMLVideoElement) => void;
  className?: string;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  settings,
  onStreamReady,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getAspectRatioClass = (aspectRatio: string) => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '16:9': return 'aspect-video';
      case '3:4': return 'aspect-[3/4]';
      default: return 'aspect-video';
    }
  };

  const getContainerClass = (aspectRatio: string) => {
    if (aspectRatio === 'full') {
      return 'w-full h-full';
    }
    return `w-full max-w-lg mx-auto ${getAspectRatioClass(aspectRatio)}`;
  };

  useEffect(() => {
    if (videoRef.current && onStreamReady) {
      onStreamReady(videoRef.current);
    }
  }, [onStreamReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        video.play().catch(console.error);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-black',
        getContainerClass(settings.aspectRatio),
        className
      )}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
      
      {/* Camera overlay grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>
      </div>
      
      {/* Center focus point */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 border-2 border-white rounded-full opacity-50" />
      </div>
    </div>
  );
};