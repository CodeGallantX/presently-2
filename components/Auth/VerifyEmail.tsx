import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../Logo';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase/client';
import { Button } from '../Button';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      if (!supabase) {
        setStatus('error');
        setMessage('Authentication service is not configured.');
        return;
      }

      // Get the token from URL hash
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (!accessToken) {
        setStatus('error');
        setMessage('Invalid verification link. Please try again or request a new verification email.');
        return;
      }

      // If this is an email verification
      if (type === 'signup' || type === 'email') {
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setMessage('Failed to verify email. Please try again.');
          return;
        }

        if (session?.user) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to onboarding...');
          
          // Wait a moment to show success message, then redirect
          setTimeout(() => {
            navigate('/onboarding', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Verification failed. Please try logging in.');
        }
      } else {
        setStatus('error');
        setMessage('Invalid verification type.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-8 text-2xl" />
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            {status === 'loading' && (
              <>
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="text-primary animate-spin" size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verifying Email</h2>
                  <p className="text-zinc-400">{message}</p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircle className="text-green-500" size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                  <p className="text-zinc-400">{message}</p>
                </div>
                <div className="w-full bg-zinc-900 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-zinc-400">What's next?</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-zinc-300 text-left">
                    <li>Complete your onboarding profile</li>
                    <li>Set your role and preferences</li>
                    <li>Start using Presently!</li>
                  </ol>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <XCircle className="text-red-500" size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                  <p className="text-zinc-400">{message}</p>
                </div>
                <div className="w-full flex flex-col gap-3 mt-4">
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')} 
                    variant="secondary"
                    className="w-full"
                  >
                    Register Again
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
