import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
import { requestPasswordReset } from '../../services/supabase/auth';

interface ForgotPasswordProps {
  onBack: () => void;
  onLoginClick: () => void;
}

type PageState = 'form' | 'sent' | 'error';

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const result = await requestPasswordReset(email);

      if (result.success) {
        setPageState('sent');
      } else {
        setError(result.error || 'Failed to send reset email');
        setPageState('error');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setPageState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setError('');
    setPageState('form');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <button 
        onClick={onBack} 
        className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6 text-2xl" />
          <h2 className="text-2xl font-bold text-white">Reset your password</h2>
          <p className="text-zinc-400 mt-2">
            {pageState === 'form' && "Enter your email to receive a password reset link"}
            {pageState === 'sent' && "Check your email for the reset link"}
            {pageState === 'error' && "Something went wrong"}
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl">
          {/* Form State */}
          {pageState === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@university.edu"
                icon={<Mail size={16} />}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full mt-6"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="mt-4 text-center text-sm">
                <p className="text-zinc-400">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Success State */}
          {pageState === 'sent' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Email sent!</h3>
                <p className="text-zinc-400 text-sm">
                  We've sent a password reset link to <span className="font-medium text-white">{email}</span>
                </p>
                <p className="text-zinc-400 text-sm">
                  Please check your email and follow the link to reset your password.
                </p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-left">
                <p className="text-xs text-zinc-400 font-medium mb-2">TIPS:</p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• Check your spam/junk folder if you don't see the email</li>
                  <li>• The reset link expires in 24 hours</li>
                  <li>• If you don't receive it, try requesting another link</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors border border-zinc-800"
                >
                  Try Another Email
                </button>
                <button
                  onClick={onLoginClick}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {pageState === 'error' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full">
                  <AlertCircle size={48} className="text-red-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
                <p className="text-zinc-400 text-sm">
                  {error || 'We encountered an error while sending the reset email.'}
                </p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-left">
                <p className="text-xs text-zinc-400 font-medium mb-2">WHAT YOU CAN DO:</p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• Double-check your email address</li>
                  <li>• Make sure the email is registered with us</li>
                  <li>• Try again in a few moments</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onLoginClick}
                  className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors border border-zinc-800"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Help */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>Need help? <a href="mailto:support@presently.com" className="text-primary hover:underline">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
