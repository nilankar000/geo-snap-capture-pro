export interface StorageConfig {
  rawFolder: string;
  processedFolder: string;
  format: 'jpeg' | 'png';
  quality: number;
}

export interface StoredFile {
  id: string;
  filename: string;
  path: string;
  type: 'raw' | 'processed';
  size: number;
  createdAt: Date;
  metadata?: {
    gpsData?: any;
    cameraSettings?: any;
    overlayTemplate?: any;
  };
}

export interface StorageState {
  isAvailable: boolean;
  usedSpace: number;
  totalSpace: number;
  files: StoredFile[];
}