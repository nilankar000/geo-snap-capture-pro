export const createImageFromVideo = (video: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Canvas context not available');
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.8);
};

export const resizeImage = (
  imageData: string, 
  maxWidth: number, 
  maxHeight: number, 
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

export const cropToAspectRatio = (
  imageData: string,
  aspectRatio: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const { width: imgWidth, height: imgHeight } = img;
      let targetWidth = imgWidth;
      let targetHeight = imgHeight;
      
      // Calculate target dimensions based on aspect ratio
      switch (aspectRatio) {
        case '1:1':
          targetWidth = targetHeight = Math.min(imgWidth, imgHeight);
          break;
        case '4:3':
          if (imgWidth / imgHeight > 4/3) {
            targetWidth = imgHeight * (4/3);
          } else {
            targetHeight = imgWidth * (3/4);
          }
          break;
        case '16:9':
          if (imgWidth / imgHeight > 16/9) {
            targetWidth = imgHeight * (16/9);
          } else {
            targetHeight = imgWidth * (9/16);
          }
          break;
        case '3:4':
          if (imgWidth / imgHeight > 3/4) {
            targetWidth = imgHeight * (3/4);
          } else {
            targetHeight = imgWidth * (4/3);
          }
          break;
        default:
          // Keep original dimensions
          break;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Calculate crop position (center crop)
      const startX = (imgWidth - targetWidth) / 2;
      const startY = (imgHeight - targetHeight) / 2;
      
      ctx.drawImage(
        img,
        startX, startY, targetWidth, targetHeight,
        0, 0, targetWidth, targetHeight
      );
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

export const addWatermark = (
  imageData: string,
  watermarkText: string,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Set watermark style
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '16px Arial';
      ctx.textBaseline = 'top';
      
      const textMetrics = ctx.measureText(watermarkText);
      const textWidth = textMetrics.width;
      const textHeight = 20; // Approximate height
      
      let x = 10;
      let y = 10;
      
      switch (position) {
        case 'top-right':
          x = canvas.width - textWidth - 10;
          break;
        case 'bottom-left':
          y = canvas.height - textHeight - 10;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - 10;
          y = canvas.height - textHeight - 10;
          break;
      }
      
      // Draw background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x - 5, y - 2, textWidth + 10, textHeight + 4);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.fillText(watermarkText, x, y);
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};
