import React, { useState, useEffect } from 'react';
import Globe from '@/components/Globe';
import NewsPanel from '@/components/NewsPanel';
import FilterControl from '@/components/FilterControl';
import TimelineControl from '@/components/TimelineControl';
import { useNewsData } from '@/hooks/useNewsData';
import { FilterOptions, EventType } from '@/lib/types';
import { Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, Globe as GlobeIcon, Info, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

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

  // Legend items for event types
  const legendItems = [
    { type: 'war', label: 'War/Conflict' },
    { type: 'terrorism', label: 'Terrorism' },
    { type: 'natural', label: 'Natural Disaster' },
    { type: 'civil', label: 'Civil Unrest' },
    { type: 'political', label: 'Political Crisis' },
    { type: 'other', label: 'Other Incidents' }
  ];
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden relative">
      {/* Background with deep space effect */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0f172a] to-background -z-10">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071')] bg-cover bg-center mix-blend-soft-light"></div>
      </div>
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-primary/5 animate-pulse-glow"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <header className="neo-glass border-b border-white/5 py-3 px-6 animate-fade-in z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/90 to-primary/20 opacity-90 blur-[2px] animate-pulse-glow"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GlobeIcon size={20} className="text-primary" />
              </div>
            </div>
            <h1 className="ml-3 text-xl font-medium tracking-tight text-shadow flex items-center">
              GlobalAlert
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">LIVE</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-8 h-8 glass-dark">
                    <HelpCircle size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="neo-glass border-white/10 max-w-sm">
                  <div className="text-xs">
                    <p className="font-medium mb-1">How to use:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Drag to rotate the globe</li>
                      <li>Scroll to zoom in/out</li>
                      <li>Click markers to view incident details</li>
                      <li>Use timeline controls to explore past events</li>
                      <li>Filter incidents by type and severity</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

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
        <div className="w-full md:w-2/3 h-[500px] md:h-[700px] neo-glass rounded-lg border border-white/5 overflow-hidden shadow-xl animate-fade-in relative" style={{animationDelay: '100ms'}}>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center animate-float">
                <div className="w-16 h-16 border-4 border-primary/50 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground text-sm">Loading Earth...</p>
              </div>
            </div>
          }>
            <Globe 
              events={events} 
              selectedEvent={selectedEvent} 
              onSelectEvent={setSelectedEvent} 
            />
          </Suspense>
          
          {/* Legend */}
          <div className="absolute top-4 left-4 glass-dark rounded-lg p-2 text-xs">
            <div className="mb-1 font-medium text-white/90">Event Types</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {legendItems.map(item => (
                <div key={item.type} className="flex items-center space-x-1.5">
                  <div className={`w-2 h-2 rounded-full event-${item.type}`}></div>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
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
      <footer className="neo-glass border-t border-white/5 py-3 px-6 text-xs text-muted-foreground animate-fade-in z-10" style={{animationDelay: '300ms'}}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>© {new Date().getFullYear()} GlobalAlert</div>
          <div className="flex items-center">
            <span className="mr-2">Real-time global incident tracking</span>
            <Sparkles size={12} className="text-primary/50" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
