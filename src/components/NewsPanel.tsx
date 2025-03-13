
import React from 'react';
import { NewsEvent } from '@/lib/types';
import NewsItem from './NewsItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, AlertTriangle, Info, X, Globe, Shield, Wind, Users, Landmark, Webhook } from 'lucide-react';
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
        return <Shield className="text-[hsl(var(--color-war))]" size={16} />;
      case 'terrorism':
        return <AlertTriangle className="text-[hsl(var(--color-terrorism))]" size={16} />;
      case 'natural':
        return <Wind className="text-[hsl(var(--color-natural))]" size={16} />;
      case 'civil':
        return <Users className="text-[hsl(var(--color-civil))]" size={16} />;
      case 'political':
        return <Landmark className="text-[hsl(var(--color-political))]" size={16} />;
      default:
        return <Webhook className="text-[hsl(var(--color-other))]" size={16} />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* News Header */}
      <div className="neo-glass p-4 rounded-t-lg border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center">
            <Globe size={16} className="mr-2 text-primary/80" />
            Global Incidents
          </h2>
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
            <span className="inline-block w-2 h-2 rounded-full bg-primary/60 mr-2 animate-pulse"></span>
            <span className="text-xs text-primary/80">Live Updates</span>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="flex-1 neo-glass rounded-b-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="glass p-6 rounded-lg animate-pulse-glow">
              <div className="w-8 h-8 border-3 border-primary/50 border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading incidents...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="glass p-6 rounded-lg text-center">
              <Info size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No incidents match your filters</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filter criteria</p>
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
        <div className="neo-glass mt-4 rounded-lg border border-white/10 animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
            <div className="flex items-center space-x-3">
              {getEventIcon(selectedEvent.type)}
              <div>
                <div className="text-xs text-muted-foreground">
                  {getTypeLabel(selectedEvent.type)} Incident
                </div>
                <h3 className="font-medium">{selectedEvent.title}</h3>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-white/10"
              onClick={() => onSelectEvent(null)}
            >
              <X size={16} />
            </Button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{selectedEvent.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-2 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="text-sm">{selectedEvent.location.name}</p>
              </div>
              <div className="glass p-2 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Reported</p>
                <p className="text-sm">{formatDistanceToNow(new Date(selectedEvent.timestamp), { addSuffix: true })}</p>
              </div>
              <div className="glass p-2 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Source</p>
                <p className="text-sm">{selectedEvent.source}</p>
              </div>
              <div className="glass p-2 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="text-sm">{format(new Date(selectedEvent.timestamp), 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            <Button
              className="w-full mt-4 text-xs h-9 neo-glass bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
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
