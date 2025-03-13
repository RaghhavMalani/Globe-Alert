
export interface NewsEvent {
  id: string;
  title: string;
  description: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  type: EventType;
  severity: 1 | 2 | 3; // 1: low, 2: medium, 3: high
  source: string;
  url: string;
  timestamp: string;
}

export type EventType = 'war' | 'terrorism' | 'natural' | 'civil' | 'political' | 'other';

export interface FilterOptions {
  types: EventType[];
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  severity: number[];
}
