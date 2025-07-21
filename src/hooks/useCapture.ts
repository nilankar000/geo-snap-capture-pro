import { useState, useCallback, useRef } from 'react';
import { storageService } from '@/services/storageService';
import { CaptureResult } from '@/types/camera';
import { GPSCoordinates, GPSOverlayTemplate } from '@/types/gps';
import html2canvas from 'html2canvas';

export const useCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<CaptureResult | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const createOverlayImage = useCallback(async (
    rawImage: string,
    gpsData: GPSCoordinates | null,
    template: GPSOverlayTemplate,
    customData?: Record<string, string>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Create overlay
        const overlayHeight = 120;
        const overlayY = canvas.height - overlayHeight;
        
        // Draw semi-transparent background
        ctx.fillStyle = template.backgroundColor;
        ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
        
        // Set text style
        ctx.fillStyle = template.textColor;
        ctx.font = `${template.fontSize}px Arial`;
        ctx.textBaseline = 'middle';
        
        // Draw GPS data
        if (gpsData) {
          const lines = [];
          
          template.fields.forEach(field => {
            if (!field.visible) return;
            
            let value = '';
            switch (field.type) {
              case 'coordinate':
                if (field.id === 'lat') value = gpsData.latitude.toFixed(6);
                else if (field.id === 'lng') value = gpsData.longitude.toFixed(6);
                break;
              case 'datetime':
                value = gpsData.timestamp.toLocaleString();
                break;
              case 'custom':
                value = customData?.[field.id] || field.value || '';
                break;
              default:
                value = field.value || '';
            }
            
            if (value) {
              lines.push(`${field.label}: ${value}`);
            }
          });
          
          // Draw text lines
          const lineHeight = template.fontSize + 4;
          const startY = overlayY + (overlayHeight - (lines.length * lineHeight)) / 2;
          
          lines.forEach((line, index) => {
            const y = startY + (index * lineHeight) + lineHeight / 2;
            ctx.fillText(line, 20, y);
          });
        }
        
        // Draw logo if enabled (placeholder for now)
        if (template.showLogo && template.logoPosition) {
          ctx.fillStyle = template.textColor;
          ctx.font = `${template.fontSize - 2}px Arial`;
          
          const logoText = 'GPS CAM';
          const logoWidth = ctx.measureText(logoText).width;
          
          let logoX = 20;
          if (template.logoPosition === 'right') {
            logoX = canvas.width - logoWidth - 20;
          } else if (template.logoPosition === 'center') {
            logoX = (canvas.width - logoWidth) / 2;
          }
          
          ctx.fillText(logoText, logoX, overlayY + overlayHeight - 20);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = rawImage;
    });
  }, []);

  const captureWithOverlay = useCallback(async (
    rawImageData: string,
    gpsData: GPSCoordinates | null,
    template: GPSOverlayTemplate,
    customData?: Record<string, string>
  ): Promise<CaptureResult> => {
    setIsCapturing(true);
    
    try {
      // Create processed image with overlay
      const processedImage = await createOverlayImage(rawImageData, gpsData, template, customData);
      
      // Save both images
      const timestamp = new Date();
      const baseFilename = `photo_${timestamp.getTime()}`;
      
      const metadata = {
        gpsData,
        template,
        customData,
        timestamp: timestamp.toISOString()
      };
      
      const { raw, processed } = await storageService.saveRawAndProcessed(
        rawImageData,
        processedImage,
        baseFilename,
        metadata
      );
      
      const result: CaptureResult = {
        rawImage: rawImageData,
        processedImage,
        timestamp,
        metadata: {
          width: 0, // Will be set by the canvas
          height: 0, // Will be set by the canvas
          format: 'jpeg',
          size: raw.size + processed.size
        }
      };
      
      setLastCapture(result);
      return result;
      
    } catch (error) {
      console.error('Capture failed:', error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  }, [createOverlayImage]);

  const captureFromElement = useCallback(async (
    element: HTMLElement,
    gpsData: GPSCoordinates | null,
    template: GPSOverlayTemplate,
    customData?: Record<string, string>
  ): Promise<CaptureResult> => {
    setIsCapturing(true);
    
    try {
      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 1
      });
      
      const rawImageData = canvas.toDataURL('image/jpeg', 0.8);
      
      return await captureWithOverlay(rawImageData, gpsData, template, customData);
      
    } catch (error) {
      console.error('Element capture failed:', error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  }, [captureWithOverlay]);

  const saveToGallery = useCallback(async (imageData: string, filename?: string) => {
    try {
      if (storageService.isSupported()) {
        const file = await storageService.saveFile(
          imageData,
          filename || `photo_${Date.now()}.jpg`,
          'processed'
        );
        return file;
      } else {
        // Fallback to download
        await storageService.saveToDownloads(imageData, filename || `photo_${Date.now()}.jpg`);
        return null;
      }
    } catch (error) {
      console.error('Save to gallery failed:', error);
      throw error;
    }
  }, []);

  const clearLastCapture = useCallback(() => {
    setLastCapture(null);
  }, []);

  return {
    isCapturing,
    lastCapture,
    overlayRef,
    captureWithOverlay,
    captureFromElement,
    saveToGallery,
    clearLastCapture
  };
};