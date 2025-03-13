
import React, { useState, useEffect } from 'react';
import Globe from '@/components/Globe';
import NewsPanel from '@/components/NewsPanel';
import FilterControl from '@/components/FilterControl';
import TimelineControl from '@/components/TimelineControl';
import { useNewsData } from '@/hooks/useNewsData';
import { FilterOptions, EventType } from '@/lib/types';
import { Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  // Initialize filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: ['war', 'terrorism', 'natural', 'civil', 'political', 'other'],
    timeRange: 'month', 
    severity: [1, 2, 3]
  });
  
  // Fetch news data
  const { 
    events, 
    loading, 
    error, 
    selectedEvent, 
    setSelectedEvent 
  } = useNewsData(filterOptions);
  
  // Timeline playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeProgress, setTimeProgress] = useState(100); // 100 = current time, 0 = oldest
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Handle timeline controls
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);
  
  // Update current time based on progress
  useEffect(() => {
    // Calculate current time based on timeProgress
    // 100 = now, 0 = 30 days ago (or based on timeRange)
    const now = new Date();
    const timeRangeMap = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: 5 * 365 * 24 * 60 * 60 * 1000 // 5 years for "all"
    };
    
    const rangeMs = timeRangeMap[filterOptions.timeRange];
    const targetTime = new Date(now.getTime() - (rangeMs * (1 - timeProgress / 100)));
    
    setCurrentTime(targetTime);
  }, [timeProgress, filterOptions.timeRange]);
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-background to-black -z-10"></div>
      
      {/* Header */}
      <header className="glass-dark border-b border-white/5 py-3 px-6 animate-fade-in">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-primary/40 opacity-80 blur-[2px]"></div>
              <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-primary to-primary/40"></div>
            </div>
            <h1 className="ml-3 text-xl font-medium tracking-tight">GlobalAlert</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <FilterControl 
              filterOptions={filterOptions}
              onFilterChange={setFilterOptions}
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-6 gap-6">
        {/* Earth view */}
        <div className="w-full md:w-2/3 h-[500px] md:h-[700px] glass-dark rounded-lg border border-white/5 overflow-hidden shadow-xl animate-fade-in" style={{animationDelay: '100ms'}}>
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
            <Globe 
              events={events} 
              selectedEvent={selectedEvent} 
              onSelectEvent={setSelectedEvent} 
            />
          </Suspense>
        </div>
        
        {/* News panel */}
        <div className="w-full md:w-1/3 flex flex-col space-y-4 animate-fade-in" style={{animationDelay: '200ms'}}>
          <NewsPanel 
            events={events}
            loading={loading}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
          />
          
          <TimelineControl
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            onReset={() => {
              setTimeProgress(0);
              setIsPlaying(true);
            }}
            progress={timeProgress}
            onProgressChange={setTimeProgress}
            currentTime={currentTime}
          />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="glass-dark border-t border-white/5 py-3 px-6 text-xs text-muted-foreground animate-fade-in" style={{animationDelay: '300ms'}}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>© {new Date().getFullYear()} GlobalAlert</div>
          <div>Real-time global incident tracking</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
