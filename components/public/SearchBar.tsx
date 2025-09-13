'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  initialValues: {
    city?: string;
    from?: string;
    to?: string;
    capacity?: string;
  };
}

export function SearchBar({ initialValues }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(initialValues.city || '');
  const [fromDate, setFromDate] = useState<Date | undefined>(
    initialValues.from ? new Date(initialValues.from) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    initialValues.to ? new Date(initialValues.to) : undefined
  );
  const [capacity, setCapacity] = useState(initialValues.capacity || '');

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (city) params.set('city', city);
    if (fromDate) params.set('from', fromDate.toISOString());
    if (toDate) params.set('to', toDate.toISOString());
    if (capacity) params.set('capacity', capacity);
    
    router.push(`/venues?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* City Input */}
        <div className="space-y-2">
          <Label htmlFor="city">Where?</Label>
          <Input
            id="city"
            placeholder="City or location"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* From Date */}
        <div className="space-y-2">
          <Label>Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <Label>Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                disabled={(date) => date < new Date() || (fromDate && date <= fromDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="capacity">Guests</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="Number of guests"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            onKeyPress={handleKeyPress}
            min="1"
          />
        </div>
      </div>

      <div className="mt-4">
        <Button onClick={handleSearch} className="w-full">
          <Search className="mr-2 h-4 w-4" />
          Search Spaces
        </Button>
      </div>
    </div>
  );
}
