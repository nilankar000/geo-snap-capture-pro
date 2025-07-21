export const formatCoordinates = (
  latitude: number, 
  longitude: number, 
  format: 'decimal' | 'dms' = 'decimal'
): string => {
  if (format === 'dms') {
    return `${formatDMS(latitude, true)}, ${formatDMS(longitude, false)}`;
  }
  
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lngDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lngDir}`;
};

export const formatDMS = (decimal: number, isLatitude: boolean): string => {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(2);
  
  const direction = isLatitude 
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  
  return `${degrees}°${minutes}'${seconds}"${direction}`;
};

export const formatTimestamp = (date: Date, format: 'short' | 'long' | 'iso' = 'short'): string => {
  switch (format) {
    case 'long':
      return date.toLocaleString();
    case 'iso':
      return date.toISOString();
    default:
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(0)}m`;
  }
  
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatAccuracy = (accuracy: number): string => {
  if (accuracy < 1) {
    return `±${(accuracy * 100).toFixed(0)}cm`;
  }
  
  return `±${accuracy.toFixed(0)}m`;
};

export const generateFilename = (
  prefix: string = 'photo',
  timestamp: Date = new Date(),
  extension: string = 'jpg'
): string => {
  const dateStr = timestamp.toISOString()
    .replace(/[:.]/g, '-')
    .split('T')[0];
  const timeStr = timestamp.toISOString()
    .replace(/[:.]/g, '-')
    .split('T')[1]
    .split('.')[0];
  
  return `${prefix}_${dateStr}_${timeStr}.${extension}`;
};

export const parseCoordinates = (input: string): { latitude?: number; longitude?: number } => {
  // Try to parse various coordinate formats
  const patterns = [
    // Decimal degrees: "40.7128, -74.0060"
    /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/,
    // DMS: "40°42'46"N, 74°0'22"W"
    /^(\d+)°(\d+)'([\d.]+)"([NS]),\s*(\d+)°(\d+)'([\d.]+)"([EW])$/i,
    // Simple decimal: "40.7128 -74.0060"
    /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      if (pattern === patterns[1]) {
        // DMS format
        const latDeg = parseInt(match[1]);
        const latMin = parseInt(match[2]);
        const latSec = parseFloat(match[3]);
        const latDir = match[4].toLowerCase();
        
        const lngDeg = parseInt(match[5]);
        const lngMin = parseInt(match[6]);
        const lngSec = parseFloat(match[7]);
        const lngDir = match[8].toLowerCase();
        
        const latitude = (latDeg + latMin/60 + latSec/3600) * (latDir === 's' ? -1 : 1);
        const longitude = (lngDeg + lngMin/60 + lngSec/3600) * (lngDir === 'w' ? -1 : 1);
        
        return { latitude, longitude };
      } else {
        // Decimal formats
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
          return { latitude, longitude };
        }
      }
    }
  }
  
  return {};
};