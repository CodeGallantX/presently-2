import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail, WifiOff } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'generic' | 'network' | 'server';
  onRetry?: () => void;
  onHome?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong", 
  message = "We encountered an unexpected error while processing your request. Please try again or contact support if the issue persists.",
  type = 'generic',
  onRetry,
  onHome
}) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 bg-zinc-950 border border-zinc-800 p-8 md:p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl"
        >
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                {type === 'network' ? (
                     <WifiOff size={32} className="text-red-500" />
                ) : (
                     <AlertTriangle size={32} className="text-red-500" />
                )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
                {message}
            </p>

            <div className="space-y-3">
                {onRetry && (
                    <Button onClick={onRetry} className="w-full h-12 text-base shadow-lg shadow-primary/10">
                        <RefreshCw size={18} className="mr-2" />
                        Try Again
                    </Button>
                )}
                
                <div className="flex gap-3">
                    {onHome && (
                        <Button variant="secondary" onClick={onHome} className="flex-1">
                            <Home size={18} className="mr-2" />
                            Dashboard
                        </Button>
                    )}
                    <Button variant="secondary" className="flex-1" onClick={() => window.location.href = 'mailto:support@presently.app'}>
                        <Mail size={18} className="mr-2" />
                        Support
                    </Button>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900">
                 <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Technical Details</p>
                    <p className="text-xs text-zinc-500 font-mono bg-zinc-900/50 p-2 rounded border border-zinc-800 break-all">
                        Session: {Math.random().toString(36).substr(2, 9).toUpperCase()} | Type: {type.toUpperCase()}
                    </p>
                 </div>
            </div>
        </motion.div>
    </div>
  );
};