import React, { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onRegister: (name: string) => void;
  onLoginClick: () => void;
  onBack: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onLoginClick, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onRegister(name);
    }, 1000);
  };

  const handleGoogleSignup = () => {
      setGoogleLoading(true);
      setTimeout(() => {
          setGoogleLoading(false);
          onRegister("Google User");
      }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
       <button onClick={onBack} className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2">
            <ArrowLeft size={18} /> Back
        </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
            <Logo className="justify-center mb-6 text-2xl" />
            <h2 className="text-2xl font-bold text-white">Create an account</h2>
            <p className="text-zinc-400 mt-2">Get started with smart attendance management.</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="Full Name" 
                type="text" 
                placeholder="John Doe" 
                icon={<UserIcon size={16} />} 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="name@university.edu" 
              icon={<Mail size={16} />} 
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              icon={<Lock size={16} />} 
              required
            />
            
            <p className="text-xs text-zinc-500">
                By clicking "Create Account", you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>

            <Button type="submit" className="w-full" size="lg" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-zinc-800 flex-1"></div>
              <span className="text-xs text-zinc-500 uppercase">Or sign up with</span>
              <div className="h-px bg-zinc-800 flex-1"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full bg-white text-black font-medium h-12 rounded-lg flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors disabled:opacity-70"
          >
            {googleLoading ? (
                 <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            ) : (
                <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </>
            )}
          </button>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <button onClick={onLoginClick} className="text-primary font-medium hover:underline">
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};