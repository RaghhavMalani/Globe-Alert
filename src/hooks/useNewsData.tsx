
import { useState, useEffect } from 'react';
import { NewsEvent, FilterOptions, EventType } from '@/lib/types';

// Mock data for demonstration
const MOCK_NEWS_EVENTS: NewsEvent[] = [
  {
    id: '1',
    title: 'Ongoing Conflict Intensifies',
    description: 'Military operations have escalated in the eastern regions as peace talks stall.',
    location: {
      name: 'Eastern Ukraine',
      lat: 48.379433,
      lng: 31.165581,
    },
    type: 'war',
    severity: 3,
    source: 'Global News Network',
    url: '#',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    title: 'Terrorist Attack in City Center',
    description: 'A coordinated attack has left dozens injured. Security forces have secured the area.',
    location: {
      name: 'Paris, France',
      lat: 48.856614,
      lng: 2.352222,
    },
    type: 'terrorism',
    severity: 3,
    source: 'European Press Agency',
    url: '#',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    title: 'Civil Unrest Following Election Results',
    description: 'Protests have erupted in the capital after disputed election results were announced.',
    location: {
      name: 'Nairobi, Kenya',
      lat: -1.286389,
      lng: 36.817223,
    },
    type: 'civil',
    severity: 2,
    source: 'African News Today',
    url: '#',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
  },
  {
    id: '4',
    title: 'Missile Strike Reported',
    description: 'Multiple explosions were reported near military installations.',
    location: {
      name: 'Damascus, Syria',
      lat: 33.513807,
      lng: 36.276528,
    },
    type: 'war',
    severity: 3,
    source: 'Middle East Observer',
    url: '#',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
  },
  {
    id: '5',
    title: 'Political Assassination Attempt',
    description: 'A prominent political figure survived an assassination attempt during a public rally.',
    location: {
      name: 'Islamabad, Pakistan',
      lat: 33.684422,
      lng: 73.047882,
    },
    type: 'political',
    severity: 2,
    source: 'South Asia Times',
    url: '#',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: '6',
    title: 'Border Skirmish Escalates',
    description: 'Armed forces exchanged fire across the disputed border region.',
    location: {
      name: 'Kashmir Region',
      lat: 34.083656,
      lng: 74.797371,
    },
    type: 'war',
    severity: 2,
    source: 'International Herald',
    url: '#',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
  },
  {
    id: '7',
    title: 'Bombing at Government Building',
    description: 'An explosion damaged a government facility. No group has claimed responsibility.',
    location: {
      name: 'Baghdad, Iraq',
      lat: 33.315241,
      lng: 44.366167,
    },
    type: 'terrorism',
    severity: 3,
    source: 'World Press',
    url: '#',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  }
];

export function useNewsData(filterOptions: FilterOptions) {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real application, this would be fetched from a server
        // Filter the mock data based on filterOptions
        let filteredEvents = [...MOCK_NEWS_EVENTS];
        
        // Filter by event type
        if (filterOptions.types.length > 0) {
          filteredEvents = filteredEvents.filter(event => 
            filterOptions.types.includes(event.type)
          );
        }
        
        // Filter by severity
        if (filterOptions.severity.length > 0) {
          filteredEvents = filteredEvents.filter(event => 
            filterOptions.severity.includes(event.severity)
          );
        }
        
        // Filter by time range
        const now = new Date();
        const timeRangeMap = {
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000,
          all: Number.MAX_SAFE_INTEGER
        };
        
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.timestamp);
          const timeDiff = now.getTime() - eventDate.getTime();
          return timeDiff <= timeRangeMap[filterOptions.timeRange];
        });
        
        // Sort by timestamp (most recent first)
        filteredEvents.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setEvents(filteredEvents);
      } catch (err) {
        setError('Failed to fetch news data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterOptions]);

  return { 
    events, 
    loading, 
    error, 
    selectedEvent, 
    setSelectedEvent 
  };
}
