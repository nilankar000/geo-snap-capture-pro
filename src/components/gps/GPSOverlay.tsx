import React from 'react';
import { cn } from '@/lib/utils';
import { GPSCoordinates, GPSOverlayTemplate } from '@/types/gps';
import { MapPin, Clock } from 'lucide-react';

interface GPSOverlayProps {
  gpsData: GPSCoordinates | null;
  template: GPSOverlayTemplate;
  customData?: Record<string, string>;
  className?: string;
  style?: React.CSSProperties;
}

export const GPSOverlay: React.FC<GPSOverlayProps> = ({
  gpsData,
  template,
  customData = {},
  className,
  style
}) => {
  const renderField = (field: typeof template.fields[0]) => {
    if (!field.visible) return null;

    let value = '';
    switch (field.type) {
      case 'coordinate':
        if (!gpsData) return null;
        if (field.id === 'lat') value = gpsData.latitude.toFixed(6);
        else if (field.id === 'lng') value = gpsData.longitude.toFixed(6);
        else if (field.id === 'alt') value = gpsData.altitude?.toFixed(1) || 'N/A';
        break;
      case 'datetime':
        value = gpsData ? gpsData.timestamp.toLocaleString() : new Date().toLocaleString();
        break;
      case 'custom':
        value = customData[field.id] || field.value || '';
        break;
      default:
        value = field.value || '';
    }

    if (!value) return null;

    return (
      <div key={field.id} className="flex items-center gap-1 text-sm">
        {field.type === 'coordinate' && <MapPin className="w-3 h-3" />}
        {field.type === 'datetime' && <Clock className="w-3 h-3" />}
        <span className="font-medium">{field.label}:</span>
        <span>{value}</span>
      </div>
    );
  };

  const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);

  const layoutClass = {
    horizontal: 'flex flex-wrap items-center gap-4',
    vertical: 'flex flex-col gap-1',
    grid: 'grid grid-cols-2 gap-2'
  }[template.layout];

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 p-4 backdrop-blur-sm',
        className
      )}
      style={{
        backgroundColor: template.backgroundColor,
        color: template.textColor,
        fontSize: `${template.fontSize}px`,
        ...style
      }}
    >
      <div className={cn('w-full', layoutClass)}>
        <div className={cn(
          template.layout === 'horizontal' ? 'flex flex-wrap items-center gap-4' :
          template.layout === 'vertical' ? 'flex flex-col gap-1' :
          'grid grid-cols-2 gap-2'
        )}>
          {sortedFields.map(renderField)}
        </div>
        
        {template.showLogo && (
          <div className={cn(
            'flex items-center',
            template.logoPosition === 'left' && 'order-first',
            template.logoPosition === 'right' && 'order-last ml-auto',
            template.logoPosition === 'center' && 'order-last mx-auto'
          )}>
            <div 
              className="font-bold opacity-80"
              style={{ fontSize: `${template.fontSize - 2}px` }}
            >
              GPS CAM
            </div>
          </div>
        )}
      </div>
    </div>
  );
};