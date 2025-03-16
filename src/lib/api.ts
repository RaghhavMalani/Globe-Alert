import { NewsEvent, FilterOptions } from './types';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API endpoint

/**
 * Fetches news events from the API based on the provided filters
 */
export async function fetchNewsEvents(filters: FilterOptions): Promise<NewsEvent[]> {
  try {
    // For now, we'll continue using mock data while the actual API is set up
    // In a real application, we would make the API call here
    // const response = await fetch(`${API_BASE_URL}/events?${new URLSearchParams({
    //   types: filters.types.join(','),
    //   timeRange: filters.timeRange,
    //   severity: filters.severity.join(','),
    // })}`);
    // 
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    // 
    // return await response.json();

    // Using mock data for now
    return generateMockEvents();
  } catch (error) {
    console.error('Error fetching news events:', error);
    throw error;
  }
}

// Mock data for development - this will be replaced by API data later
function generateMockEvents(): NewsEvent[] {
  const events: NewsEvent[] = [
    {
      id: '1',
      title: 'Major conflict in Eastern Europe',
      description: 'Heavy fighting reported along border regions with significant casualties and displacement of civilians.',
      location: {
        name: 'Ukraine',
        lat: 49.0,
        lng: 31.0
      },
      type: 'war',
      severity: 3,
      source: 'Global News Network',
      url: 'https://example.com/news/1',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Earthquake devastates coastal regions',
      description: 'A 7.2 magnitude earthquake has caused significant damage to infrastructure and resulted in hundreds of casualties.',
      location: {
        name: 'Japan',
        lat: 36.2048,
        lng: 138.2529
      },
      type: 'natural',
      severity: 3,
      source: 'Disaster Relief Monitor',
      url: 'https://example.com/news/2',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Protests spread across capital city',
      description: 'Thousands gather to protest new government policies, with clashes reported between protesters and security forces.',
      location: {
        name: 'France',
        lat: 46.2276,
        lng: 2.2137
      },
      type: 'civil',
      severity: 2,
      source: 'European News Daily',
      url: 'https://example.com/news/3',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'Terror attack at public venue',
      description: 'Explosion reported at crowded marketplace with multiple casualties and ongoing security operation.',
      location: {
        name: 'Syria',
        lat: 34.8021,
        lng: 38.9968
      },
      type: 'terrorism',
      severity: 3,
      source: 'Middle East Reports',
      url: 'https://example.com/news/4',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      title: 'Political coup attempt fails',
      description: 'Military faction attempted to seize control but was quickly suppressed by loyal government forces.',
      location: {
        name: 'Brazil',
        lat: -14.2350,
        lng: -51.9253
      },
      type: 'political',
      severity: 2,
      source: 'South American Press',
      url: 'https://example.com/news/5',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      title: 'Tropical storm causes flooding',
      description: 'Heavy rainfall and strong winds have led to severe flooding and displacement of coastal communities.',
      location: {
        name: 'Philippines',
        lat: 12.8797,
        lng: 121.7740
      },
      type: 'natural',
      severity: 2,
      source: 'Pacific Weather Watch',
      url: 'https://example.com/news/6',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '7',
      title: 'Border skirmish escalates tension',
      description: 'Exchange of fire along disputed border raises concerns about potential wider conflict in the region.',
      location: {
        name: 'India',
        lat: 20.5937,
        lng: 78.9629
      },
      type: 'war',
      severity: 1,
      source: 'Asian Affairs Journal',
      url: 'https://example.com/news/7',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '8',
      title: 'Cyber attack disrupts critical infrastructure',
      description: 'Major systems affected by sophisticated cyber attack, affecting power and communication networks.',
      location: {
        name: 'United States',
        lat: 37.0902,
        lng: -95.7129
      },
      type: 'other',
      severity: 2,
      source: 'Tech Security News',
      url: 'https://example.com/news/8',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return events;
}
