"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, GripVertical, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

interface SortableImageProps {
  url: string;
  index: number;
  isCover: boolean;
  onRemove: (url: string) => void;
}

function SortableImage({ url, index, isCover, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      data-testid="image-thumb"
    >
      <Card className="p-2 w-24 h-24 flex items-center justify-center overflow-hidden">
        <img
          src={url}
          alt={`Upload ${index + 1}`}
          className="w-full h-full object-cover rounded"
        />
        {isCover && (
          <Badge 
            variant="secondary" 
            className="absolute top-1 left-1 text-xs px-1 py-0"
          >
            Cover
          </Badge>
        )}
      </Card>
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </div>
      
      {/* Remove button */}
      <Button
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(url)}
        data-testid="btn-remove-image"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function ImageUploader({ 
  value = [], 
  onChange, 
  maxFiles = 10, 
  maxSize = 5 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    if (value.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { urls } = await response.json();
      onChange([...value, ...urls]);
      
      toast({
        title: "Upload successful",
        description: `${urls.length} image(s) uploaded`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif']
    },
    maxSize: maxSize * 1024 * 1024,
    disabled: uploading || value.length >= maxFiles,
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = value.indexOf(active.id);
      const newIndex = value.indexOf(over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const handleRemove = (url: string) => {
    onChange(value.filter(u => u !== url));
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploading || value.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
        data-testid="images-uploader"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop images here' : 'Click or drag images here'}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP, AVIF up to {maxSize}MB each. Max {maxFiles} files.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image grid */}
      {value.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            Images ({value.length}/{maxFiles})
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={value} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-4 gap-4">
                {value.map((url, index) => (
                  <SortableImage
                    key={url}
                    url={url}
                    index={index}
                    isCover={index === 0}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <p className="text-xs text-muted-foreground mt-2">
            First image becomes the cover. Drag to reorder.
          </p>
        </div>
      )}
    </div>
  );
}

