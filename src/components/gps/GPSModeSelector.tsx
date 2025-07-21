import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GPSState, ManualGPSData } from '@/types/gps';

interface GPSModeSelectorProps {
  gpsState: GPSState;
  manualGPSData: ManualGPSData[];
  onModeChange: (mode: 'real' | 'manual') => void;
  onManualDataSelect: (data: ManualGPSData | undefined) => void;
  onManageData: () => void;
  className?: string;
}

export const GPSModeSelector: React.FC<GPSModeSelectorProps> = ({
  gpsState,
  manualGPSData,
  onModeChange,
  onManualDataSelect,
  onManageData,
  className
}) => {
  const getStatusBadge = () => {
    if (gpsState.mode === 'real') {
      if (!gpsState.hasPermission) {
        return <Badge variant="destructive">No Permission</Badge>;
      }
      if (gpsState.isTracking) {
        return <Badge variant="default">Live GPS</Badge>;
      }
      return <Badge variant="secondary">GPS Ready</Badge>;
    } else {
      if (gpsState.selectedManualData) {
        return <Badge variant="outline">Manual Data</Badge>;
      }
      return <Badge variant="secondary">No Data Selected</Badge>;
    }
  };

  return (
    <div className={cn('flex flex-col gap-3 p-4 bg-background/95 rounded-lg', className)}>
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-md bg-muted p-1">
          <Button
            variant={gpsState.mode === 'real' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('real')}
            className="flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Real GPS
          </Button>
          <Button
            variant={gpsState.mode === 'manual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('manual')}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Manual
          </Button>
        </div>
        {getStatusBadge()}
      </div>

      {/* Manual GPS Data Selector */}
      {gpsState.mode === 'manual' && (
        <div className="flex items-center gap-2">
          <Select
            value={gpsState.selectedManualData?.id || ''}
            onValueChange={(value) => {
              const data = manualGPSData.find(d => d.id === value);
              onManualDataSelect(data);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select GPS location..." />
            </SelectTrigger>
            <SelectContent>
              {manualGPSData.map((data) => (
                <SelectItem key={data.id} value={data.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{data.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {data.coordinates.latitude.toFixed(4)}, {data.coordinates.longitude.toFixed(4)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onManageData}
            className="flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Manage
          </Button>
        </div>
      )}

      {/* Current Location Display */}
      {gpsState.currentLocation && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>
              {gpsState.currentLocation.latitude.toFixed(6)}, {gpsState.currentLocation.longitude.toFixed(6)}
            </span>
          </div>
          {gpsState.currentLocation.accuracy && (
            <div className="mt-1 text-xs">
              Accuracy: ±{gpsState.currentLocation.accuracy.toFixed(0)}m
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {gpsState.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {gpsState.error}
        </div>
      )}
    </div>
  );
};