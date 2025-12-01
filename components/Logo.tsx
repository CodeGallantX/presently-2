import React from 'react';
import { ScanLine } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${className}`}>
    <div className="bg-primary text-black p-1.5 rounded-lg">
      <ScanLine size={20} strokeWidth={2.5} />
    </div>
    <span className="text-white">Presently</span>
  </div>
);