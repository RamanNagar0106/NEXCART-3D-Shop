import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, count, size = 16, className = '' }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-accent text-accent" />
        ))}
        {hasHalfStar && (
          <div className="relative">
             <Star size={size} className="text-muted-foreground opacity-30" />
             <div className="absolute inset-0 overflow-hidden w-[50%]">
               <Star size={size} className="fill-accent text-accent" />
             </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-muted-foreground opacity-30" />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">({count})</span>
      )}
    </div>
  );
}
