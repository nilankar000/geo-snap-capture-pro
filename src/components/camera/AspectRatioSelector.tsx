import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CameraSettings } from '@/types/camera';

interface AspectRatioSelectorProps {
  settings: CameraSettings;
  onSettingsChange: (settings: Partial<CameraSettings>) => void;
  className?: string;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  settings,
  onSettingsChange,
  className
}) => {
  const ratios = [
    { value: '1:1', label: '1:1', icon: '⬜' },
    { value: '4:3', label: '4:3', icon: '▬' },
    { value: '16:9', label: '16:9', icon: '▭' },
    { value: '3:4', label: '3:4', icon: '▯' },
    { value: 'full', label: 'Full', icon: '⬛' }
  ] as const;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {ratios.map((ratio) => (
        <Button
          key={ratio.value}
          variant={settings.aspectRatio === ratio.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSettingsChange({ aspectRatio: ratio.value })}
          className="flex flex-col items-center gap-1 h-12 px-3"
        >
          <span className="text-lg">{ratio.icon}</span>
          <span className="text-xs">{ratio.label}</span>
        </Button>
      ))}
    </div>
  );
};