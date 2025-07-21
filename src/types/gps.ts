export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
}

export interface ManualGPSData {
  id: string;
  name: string;
  coordinates: GPSCoordinates;
  address?: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GPSOverlayTemplate {
  id: string;
  name: string;
  fields: GPSOverlayField[];
  layout: 'horizontal' | 'vertical' | 'grid';
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  logoPosition?: 'left' | 'right' | 'center';
  showLogo: boolean;
}

export interface GPSOverlayField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'coordinate' | 'datetime' | 'custom';
  visible: boolean;
  order: number;
}

export interface GPSState {
  currentLocation?: GPSCoordinates;
  isTracking: boolean;
  hasPermission: boolean;
  error?: string;
  mode: 'real' | 'manual';
  selectedManualData?: ManualGPSData;
}