import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("animate-pulse bg-gray-200/80 rounded-md", className)} {...props} />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-6 w-full rounded" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  </div>
);

export const BoardSkeleton: React.FC = () => (
  <div className="flex gap-4 overflow-x-auto pb-4 h-[600px]">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex-shrink-0 w-80 bg-gray-50/50 rounded-lg border border-gray-200 p-3 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    <div className="bg-gray-50 p-4 border-b flex justify-between">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/6" />
    </div>
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
          <div className="flex space-x-3 items-center flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20 rounded-full ml-4" />
        </div>
      ))}
    </div>
  </div>
);
