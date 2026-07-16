import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
