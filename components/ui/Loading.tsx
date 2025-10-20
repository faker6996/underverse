"use client";

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'foreground' | 'muted';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'text-primary',
    foreground: 'text-foreground',
    muted: 'text-muted-foreground'
  };

  return (
    <Activity 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
    />
  );
};

interface LoadingDotsProps {
  className?: string;
  color?: 'primary' | 'foreground' | 'muted';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-primary',
    foreground: 'bg-foreground',
    muted: 'bg-muted-foreground'
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full animate-pulse',
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
};

interface LoadingBarProps {
  progress?: number; // 0-100
  className?: string;
  animated?: boolean;
  label?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ 
  progress,
  className,
  animated = true,
  label
}) => {
  const pct = progress ? Math.min(Math.max(progress, 0), 100) : undefined;
  return (
    <div
      className={cn('w-full bg-muted rounded-full h-2', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={pct === undefined ? undefined : 100}
      aria-valuenow={pct === undefined ? undefined : Math.round(pct)}
      aria-label={label || 'Loading'}
    >
      <div
        className={cn(
          'bg-primary h-2 rounded-full transition-all duration-300',
          animated && !progress && 'animate-pulse'
        )}
        style={{
          width: pct !== undefined ? `${pct}%` : '30%'
        }}
      />
    </div>
  );
};

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = '',
  size = 'md',
  variant = 'spinner',
  className
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {variant === 'spinner' ? (
        <LoadingSpinner size={size} />
      ) : (
        <LoadingDots />
      )}
      {message && message.trim() && (
        <span className="text-sm text-muted-foreground">
          {message}
        </span>
      )}
    </div>
  );
};
