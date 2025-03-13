
import React from 'react';
import { NewsEvent } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, AlertTriangle, Shield, Wind, Users, Landmark, Webhook } from 'lucide-react';

interface NewsItemProps {
  event: NewsEvent;
  isSelected: boolean;
  onClick: () => void;
}

const NewsItem: React.FC<NewsItemProps> = ({ event, isSelected, onClick }) => {
  // Helper function to get severity label and styles
  const getSeverityDetails = (severity: number) => {
    switch(severity) {
      case 3:
        return {
          label: 'Critical',
          bgClass: 'bg-[hsl(var(--color-war))]',
          textClass: 'text-[hsl(var(--color-war))]'
        };
      case 2:
        return {
          label: 'Moderate',
          bgClass: 'bg-[hsl(var(--color-terrorism))]',
          textClass: 'text-[hsl(var(--color-terrorism))]'
        };
      case 1:
        return {
          label: 'Low',
          bgClass: 'bg-[hsl(var(--color-natural))]',
          textClass: 'text-[hsl(var(--color-natural))]'
        };
      default:
        return {
          label: 'Unknown',
          bgClass: 'bg-gray-500',
          textClass: 'text-gray-400'
        };
    }
  };

  // Get event icon based on type
  const getEventIcon = (type: string) => {
    switch(type) {
      case 'war':
        return <Shield className="text-[hsl(var(--color-war))]" size={14} />;
      case 'terrorism':
        return <AlertTriangle className="text-[hsl(var(--color-terrorism))]" size={14} />;
      case 'natural':
        return <Wind className="text-[hsl(var(--color-natural))]" size={14} />;
      case 'civil':
        return <Users className="text-[hsl(var(--color-civil))]" size={14} />;
      case 'political':
        return <Landmark className="text-[hsl(var(--color-political))]" size={14} />;
      default:
        return <Webhook className="text-[hsl(var(--color-other))]" size={14} />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const severityDetails = getSeverityDetails(event.severity);
  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });

  return (
    <div
      className={`rounded-lg px-4 py-3 transition-all duration-300 ease-out cursor-pointer
                ${isSelected 
                  ? 'neo-glass shadow-lg border-primary/30' 
                  : 'glass-dark hover:neo-glass border-transparent'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${severityDetails.bgClass} ${isSelected ? 'animate-pulse' : ''}`}></span>
          <span className={`text-xs font-medium ${severityDetails.textClass}`}>
            {severityDetails.label}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{timeAgo}</div>
      </div>
      
      <h3 className="font-medium text-sm mb-1 line-clamp-2">{event.title}</h3>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 glass px-2 py-0.5 rounded-full">
            {getEventIcon(event.type)}
            <div className="text-xs">{getTypeLabel(event.type)}</div>
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[100px]">{event.location.name}</div>
        </div>
        
        {isSelected && (
          <a 
            href={event.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:text-primary/80 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
};

export default NewsItem;
