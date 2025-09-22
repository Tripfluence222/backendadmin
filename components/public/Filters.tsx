'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FiltersProps {
  searchParams: {
    priceMin?: string;
    priceMax?: string;
    capacity?: string;
    amenities?: string;
    sort?: string;
  };
}

const AMENITIES = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'parking', label: 'Parking' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'audio', label: 'Audio System' },
  { id: 'projector', label: 'Projector' },
  { id: 'mirrors', label: 'Mirrors' },
  { id: 'natural-light', label: 'Natural Light' },
  { id: 'air-conditioning', label: 'Air Conditioning' },
];

export function Filters({ searchParams }: FiltersProps) {
  const router = useRouter();
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.priceMin || '0'),
    parseInt(searchParams.priceMax || '200'),
  ]);
  const [capacity, setCapacity] = useState(parseInt(searchParams.capacity || '1'));
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.amenities?.split(',') || []
  );
  const [sort, setSort] = useState(searchParams.sort || 'relevance');

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (priceRange[0] > 0) params.set('priceMin', priceRange[0].toString());
    if (priceRange[1] < 200) params.set('priceMax', priceRange[1].toString());
    if (capacity > 1) params.set('capacity', capacity.toString());
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    if (sort !== 'relevance') params.set('sort', sort);
    
    router.push(`/venues?${params.toString()}`);
  };

  const clearFilters = () => {
    setPriceRange([0, 200]);
    setCapacity(1);
    setSelectedAmenities([]);
    setSort('relevance');
    router.push('/venues');
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label>Price Range (per hour)</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={200}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div className="space-y-3">
        <Label htmlFor="capacity">Minimum Capacity</Label>
        <input
          id="capacity"
          type="range"
          min="1"
          max="100"
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-muted-foreground">
          {capacity} guests
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="space-y-2">
          {AMENITIES.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-2">
              <Checkbox
                id={amenity.id}
                checked={selectedAmenities.includes(amenity.id)}
                onCheckedChange={() => toggleAmenity(amenity.id)}
              />
              <Label
                htmlFor={amenity.id}
                className="text-sm font-normal cursor-pointer"
              >
                {amenity.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-3">
        <Label>Sort by</Label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="capacity">Capacity</option>
        </select>
      </div>

      {/* Selected Filters */}
      {selectedAmenities.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Amenities</Label>
          <div className="flex flex-wrap gap-2">
            {selectedAmenities.map((amenityId) => {
              const amenity = AMENITIES.find(a => a.id === amenityId);
              return (
                <Badge
                  key={amenityId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenityId)}
                >
                  {amenity?.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <Button onClick={applyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
