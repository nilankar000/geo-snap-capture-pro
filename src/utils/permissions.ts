export interface PermissionResult {
  granted: boolean;
  message: string;
}

export const checkCameraPermission = async (): Promise<PermissionResult> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { 
        granted: false, 
        message: 'Camera not supported on this device' 
      };
    }

    // Try to access camera to check permission
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' },
      audio: false 
    });
    
    // Stop the stream immediately as we were just checking permission
    stream.getTracks().forEach(track => track.stop());
    
    return { 
      granted: true, 
      message: 'Camera permission granted' 
    };
  } catch (error) {
    console.error('Camera permission check failed:', error);
    return { 
      granted: false, 
      message: 'Camera permission denied or not available' 
    };
  }
};

export const checkLocationPermission = async (): Promise<PermissionResult> => {
  try {
    if (!navigator.geolocation) {
      return { 
        granted: false, 
        message: 'Geolocation not supported on this device' 
      };
    }

    // Check permission using the Permissions API if available
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      if (permission.state === 'granted') {
        return { 
          granted: true, 
          message: 'Location permission granted' 
        };
      } else if (permission.state === 'denied') {
        return { 
          granted: false, 
          message: 'Location permission denied' 
        };
      }
    }

    // Fallback: try to get current position
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve({ 
          granted: true, 
          message: 'Location permission granted' 
        }),
        (error) => resolve({ 
          granted: false, 
          message: `Location permission error: ${error.message}` 
        }),
        { timeout: 5000 }
      );
    });
  } catch (error) {
    console.error('Location permission check failed:', error);
    return { 
      granted: false, 
      message: 'Location permission check failed' 
    };
  }
};

export const requestAllPermissions = async (): Promise<{
  camera: PermissionResult;
  location: PermissionResult;
}> => {
  const [camera, location] = await Promise.all([
    checkCameraPermission(),
    checkLocationPermission()
  ]);

  return { camera, location };
};