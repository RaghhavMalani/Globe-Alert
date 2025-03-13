
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal, Filter, CheckCircle } from 'lucide-react';
import { FilterOptions, EventType } from '@/lib/types';

interface FilterControlProps {
  filterOptions: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
}

const FilterControl: React.FC<FilterControlProps> = ({ 
  filterOptions, 
  onFilterChange 
}) => {
  // Toggle event type filter
  const toggleEventType = (type: EventType) => {
    const types = filterOptions.types.includes(type)
      ? filterOptions.types.filter(t => t !== type)
      : [...filterOptions.types, type];
    
    onFilterChange({ ...filterOptions, types });
  };

  // Toggle severity filter
  const toggleSeverity = (level: 1 | 2 | 3) => {
    const severity = filterOptions.severity.includes(level)
      ? filterOptions.severity.filter(s => s !== level)
      : [...filterOptions.severity, level];
    
    onFilterChange({ ...filterOptions, severity });
  };

  // Set time range
  const setTimeRange = (range: FilterOptions['timeRange']) => {
    onFilterChange({ ...filterOptions, timeRange: range });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 px-3 glass border-white/10 hover:bg-white/10"
        >
          <Filter size={14} className="mr-2" />
          <span className="text-xs">Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 glass border-white/10 p-0 animate-scale-in" align="end">
        <Tabs defaultValue="type">
          <div className="p-3 border-b border-white/10">
            <TabsList className="w-full glass">
              <TabsTrigger value="type" className="text-xs flex-1">Event Type</TabsTrigger>
              <TabsTrigger value="severity" className="text-xs flex-1">Severity</TabsTrigger>
              <TabsTrigger value="time" className="text-xs flex-1">Time Range</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="type" className="p-4">
            <div className="space-y-3">
              {[
                { value: 'war', label: 'War & Conflict' },
                { value: 'terrorism', label: 'Terrorism' },
                { value: 'natural', label: 'Natural Disasters' },
                { value: 'civil', label: 'Civil Unrest' },
                { value: 'political', label: 'Political Events' },
                { value: 'other', label: 'Other Incidents' }
              ].map(type => (
                <div key={type.value} className="flex items-center justify-between">
                  <Label htmlFor={`type-${type.value}`} className="text-xs cursor-pointer">
                    {type.label}
                  </Label>
                  <Switch
                    id={`type-${type.value}`}
                    checked={filterOptions.types.includes(type.value as EventType)}
                    onCheckedChange={() => toggleEventType(type.value as EventType)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="severity" className="p-4">
            <div className="space-y-3">
              {[
                { value: 3, label: 'Critical Incidents' },
                { value: 2, label: 'Moderate Incidents' },
                { value: 1, label: 'Low Severity Incidents' }
              ].map(severity => (
                <div key={severity.value} className="flex items-center justify-between">
                  <Label htmlFor={`severity-${severity.value}`} className="text-xs cursor-pointer">
                    {severity.label}
                  </Label>
                  <Switch
                    id={`severity-${severity.value}`}
                    checked={filterOptions.severity.includes(severity.value as 1 | 2 | 3)}
                    onCheckedChange={() => toggleSeverity(severity.value as 1 | 2 | 3)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="time" className="p-4">
            <div className="space-y-2">
              {[
                { value: 'day', label: 'Last 24 Hours' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'year', label: 'Last Year' },
                { value: 'all', label: 'All Time' }
              ].map(timeRange => (
                <Button
                  key={timeRange.value}
                  variant={filterOptions.timeRange === timeRange.value ? "default" : "outline"}
                  className="w-full justify-between text-xs h-8 mb-1"
                  onClick={() => setTimeRange(timeRange.value as FilterOptions['timeRange'])}
                >
                  <span>{timeRange.label}</span>
                  {filterOptions.timeRange === timeRange.value && (
                    <CheckCircle size={14} className="ml-2" />
                  )}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default FilterControl;
