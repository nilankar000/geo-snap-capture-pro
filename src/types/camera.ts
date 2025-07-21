export interface CameraSettings {
  aspectRatio: '1:1' | '4:3' | '16:9' | '3:4' | 'full';
  quality: number;
  facingMode: 'user' | 'environment';
  captureMode: 'photo' | 'video';
}

export interface CaptureResult {
  rawImage: string;
  processedImage: string;
  timestamp: Date;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface VideoRecording {
  isRecording: boolean;
  duration: number;
  blob?: Blob;
}

export interface CameraState {
  isInitialized: boolean;
  hasPermission: boolean;
  isCapturing: boolean;
  error?: string;
  stream?: MediaStream;
}