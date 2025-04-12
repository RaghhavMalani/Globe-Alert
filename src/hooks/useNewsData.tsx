
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NewsEvent, FilterOptions } from '@/lib/types';
import { fetchNewsEvents } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export const useNewsData = (filters: FilterOptions) => {
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const { toast } = useToast();
  
  // Use React Query for data fetching
  const { 
    data: events = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['newsEvents', filters],
    queryFn: () => fetchNewsEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news data';
      // Show error toast
      toast({
        title: "Error loading data",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
  
  return {
    events,
    loading,
    error,
    selectedEvent,
    setSelectedEvent
  };
};
