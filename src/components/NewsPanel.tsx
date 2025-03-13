
import React from 'react';
import { NewsEvent } from '@/lib/types';
import NewsItem from './NewsItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';

interface NewsPanelProps {
  events: NewsEvent[];
  loading: boolean;
  selectedEvent: NewsEvent | null;
  onSelectEvent: (event: NewsEvent | null) => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ 
  events, 
  loading, 
  selectedEvent, 
  onSelectEvent 
}) => {
  // Helper function to get event icon based on type
  const getEventIcon = (type: string) => {
    switch(type) {
      case 'war':
        return <AlertTriangle className="text-red-400" size={16} />;
      case 'terrorism':
        return <AlertTriangle className="text-orange-400" size={16} />;
      case 'natural':
        return <Info className="text-emerald-400" size={16} />;
      case 'civil':
        return <AlertTriangle className="text-yellow-400" size={16} />;
      case 'political':
        return <Info className="text-purple-400" size={16} />;
      default:
        return <Info className="text-blue-400" size={16} />;
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* News Header */}
      <div className="glass p-4 rounded-t-lg border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Global Incidents</h2>
          <div className="flex items-center space-x-1">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Live Updates</span>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="flex-1 glass-dark rounded-b-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="glass p-4 rounded-lg animate-pulse-glow">
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="glass p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">No incidents match your filters</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-[400px]">
            <div className="p-4 space-y-3">
              {events.map(event => (
                <NewsItem 
                  key={event.id}
                  event={event}
                  isSelected={selectedEvent?.id === event.id}
                  onClick={() => onSelectEvent(event)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Selected Event Detail Panel */}
      {selectedEvent && (
        <div className="glass mt-4 rounded-lg border border-border/50 animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center space-x-2">
              {getEventIcon(selectedEvent.type)}
              <h3 className="font-medium">{selectedEvent.title}</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onSelectEvent(null)}
            >
              <X size={16} />
            </Button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">{selectedEvent.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Location</p>
                <p>{selectedEvent.location.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Reported</p>
                <p>{formatDistanceToNow(new Date(selectedEvent.timestamp), { addSuffix: true })}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Source</p>
                <p>{selectedEvent.source}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Date</p>
                <p>{format(new Date(selectedEvent.timestamp), 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            <Button
              className="w-full mt-4 text-xs h-8"
              variant="outline"
              asChild
            >
              <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer">
                View Full Report
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPanel;
