
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TimelineControlProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
  progress: number;
  onProgressChange: (value: number) => void;
  currentTime: Date;
}

const TimelineControl: React.FC<TimelineControlProps> = ({
  isPlaying,
  onPlayToggle,
  onReset,
  progress,
  onProgressChange,
  currentTime
}) => {
  return (
    <div className="glass w-full rounded-lg p-3 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <Clock size={14} className="text-primary" />
          <span className="text-xs font-medium">Timeline</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(currentTime, { addSuffix: true })}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 glass hover:bg-white/10"
          onClick={onReset}
        >
          <SkipBack size={14} />
        </Button>
        
        <Button
          variant={isPlaying ? "secondary" : "outline"}
          size="icon"
          className="h-7 w-7 glass hover:bg-white/10"
          onClick={onPlayToggle}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => onProgressChange(values[0])}
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineControl;
