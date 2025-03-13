
import React, { useState, useEffect } from 'react';
import { NewsEvent } from '@/lib/types';

interface EventMarkerProps {
  event: NewsEvent;
  selected: boolean;
  onClick: () => void;
}

const EventMarker: React.FC<EventMarkerProps> = ({ event, selected, onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (selected) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  // Define colors based on event type
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'war': return 'bg-red-500';
      case 'terrorism': return 'bg-orange-500';
      case 'natural': return 'bg-emerald-500';
      case 'civil': return 'bg-yellow-500';
      case 'political': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  // Define size based on severity
  const getMarkerSize = (severity: number) => {
    switch (severity) {
      case 3: return 'w-4 h-4 md:w-5 md:h-5';
      case 2: return 'w-3 h-3 md:w-4 md:h-4';
      case 1: return 'w-2 h-2 md:w-3 md:h-3';
      default: return 'w-3 h-3';
    }
  };

  return (
    <div 
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10
                 transition-all duration-300 ease-out ${selected ? 'z-20' : ''}`}
      onClick={onClick}
    >
      {/* Pulse ring (only visible when selected or animating) */}
      {(selected || isAnimating) && (
        <div className={`absolute rounded-full -inset-4 
                        ${getMarkerColor(event.type).replace('bg-', 'bg-opacity-20 bg-')} 
                        animate-pulse-glow`}>
        </div>
      )}
      
      {/* Main marker dot */}
      <div 
        className={`rounded-full ${getMarkerColor(event.type)} ${getMarkerSize(event.severity)}
                   ${selected ? 'ring-2 ring-white shadow-glow' : ''}
                   transition-all duration-300`}
      />
    </div>
  );
};

export default EventMarker;
