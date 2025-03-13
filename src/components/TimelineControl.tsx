
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, Clock, Calendar, SkipForward, Rewind, FastForward } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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
  // Function to handle speed change buttons
  const handleFastForward = () => {
    const newProgress = Math.min(progress + 10, 100);
    onProgressChange(newProgress);
  };
  
  const handleRewind = () => {
    const newProgress = Math.max(progress - 10, 0);
    onProgressChange(newProgress);
  };
  
  const handleSkipToEnd = () => {
    onProgressChange(100);
  };

  return (
    <div className="neo-glass w-full rounded-lg p-4 border border-white/10 animate-scale-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock size={12} className="text-primary" />
          </div>
          <span className="text-xs font-medium">Timeline Explorer</span>
        </div>
        <div className="flex items-center space-x-2 text-xs glass-dark px-2 py-1 rounded-full">
          <Calendar size={10} className="text-primary/70" />
          <span className="text-muted-foreground">{format(currentTime, 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 glass hover:bg-white/10"
          onClick={onReset}
          title="Reset to beginning"
        >
          <SkipBack size={14} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 glass hover:bg-white/10"
          onClick={handleRewind}
          title="Rewind"
        >
          <Rewind size={14} />
        </Button>
        
        <Button
          variant={isPlaying ? "secondary" : "outline"}
          size="icon"
          className={`h-8 w-8 ${isPlaying ? 'bg-primary/20 border-primary/30' : 'glass hover:bg-white/10'}`}
          onClick={onPlayToggle}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 glass hover:bg-white/10"
          onClick={handleFastForward}
          title="Fast forward"
        >
          <FastForward size={14} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 glass hover:bg-white/10"
          onClick={handleSkipToEnd}
          title="Skip to present"
        >
          <SkipForward size={14} />
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => onProgressChange(values[0])}
            className="cursor-pointer"
          />
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] text-muted-foreground px-2">
        <span>Past</span>
        <span className="glass-dark px-2 py-0.5 rounded-full text-primary/80">
          {formatDistanceToNow(currentTime, { addSuffix: true })}
        </span>
        <span>Now</span>
      </div>
    </div>
  );
};

export default TimelineControl;
