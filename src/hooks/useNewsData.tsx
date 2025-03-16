
import { useState, useEffect } from 'react';
import { NewsEvent, FilterOptions } from '@/lib/types';
import { fetchNewsEvents } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export const useNewsData = (filters: FilterOptions) => {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const getNewsData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const newsEvents = await fetchNewsEvents(filters);
        
        setEvents(newsEvents);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news data';
        setError(err instanceof Error ? err : new Error(errorMessage));
        setLoading(false);
        
        // Show error toast
        toast({
          title: "Error loading data",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };
    
    getNewsData();
  }, [filters, toast]);
  
  return {
    events,
    loading,
    error,
    selectedEvent,
    setSelectedEvent
  };
};
