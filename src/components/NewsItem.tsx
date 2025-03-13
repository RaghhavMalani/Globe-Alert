
import React from 'react';
import { NewsEvent } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, AlertTriangle, Info } from 'lucide-react';

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
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400'
        };
      case 2:
        return {
          label: 'Moderate',
          bgColor: 'bg-orange-500/20',
          textColor: 'text-orange-400'
        };
      case 1:
        return {
          label: 'Low',
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-400'
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400'
        };
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
                  ? 'glass border-primary/50 shadow-md' 
                  : 'glass-dark hover:glass border-transparent'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${severityDetails.bgColor}`}></span>
          <span className={`text-xs font-medium ${severityDetails.textColor}`}>
            {severityDetails.label}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{timeAgo}</div>
      </div>
      
      <h3 className="font-medium text-sm mb-1 line-clamp-2">{event.title}</h3>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <div className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
            {getTypeLabel(event.type)}
          </div>
          <div className="text-xs text-muted-foreground">{event.location.name}</div>
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
