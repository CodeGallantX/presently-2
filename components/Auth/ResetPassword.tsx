import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { Input } from '../Input';
import { Logo } from '../Logo';
import { resetPassword, getCurrentSession } from '../../services/supabase/auth';

interface ResetPasswordProps {
  onBack?: () => void;
}

type PageState = 'form' | 'success' | 'error' | 'loading' | 'invalid-link';

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pageState, setPageState] = useState<PageState>('loading');

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Check if user has a valid reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        
        // Check if there's a recovery token in the URL (Supabase adds it)
        const hash = window.location.hash;
        const hasRecoveryToken = hash.includes('type=recovery') && hash.includes('access_token');
        
        if (!session && !hasRecoveryToken) {
          setPageState('invalid-link');
        } else {
          setPageState('form');
        }
      } catch (err) {
        setPageState('invalid-link');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Validate password
  const validatePassword = (pwd: string) => {
    setPassword(pwd);
    setPasswordValidation({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*]/.test(pwd),
    });
  };

  const isPasswordValid =
    Object.values(passwordValidation).every(v => v) && 
    password === confirmPassword && 
    password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('Please ensure passwords match and meet all requirements');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await resetPassword(password);

      if (result.success) {
        setPageState('success');
      } else {
        setError(result.error || 'Failed to reset password');
        setPageState('error');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setPageState('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid Link State
  if (pageState === 'invalid-link') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full">
                <AlertCircle size={48} className="text-red-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Invalid or Expired Link</h2>
            <p className="text-zinc-400 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-3">
              <Button onClick={() => navigate('/forgot-password')} className="w-full">
                Request New Reset Link
              </Button>
              <button
                onClick={handleBackToLogin}
                className="w-full px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors border border-zinc-800"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      {onBack && (
        <button 
          onClick={onBack} 
          className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
      )}

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6 text-2xl" />
          <h2 className="text-2xl font-bold text-white">Create new password</h2>
          <p className="text-zinc-400 mt-2">
            {pageState === 'form' && "Enter a strong password to secure your account"}
            {pageState === 'success' && "Password reset successful"}
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

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <Lock size={16} className="absolute left-3 top-3 text-zinc-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-zinc-400">Password must contain:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-500' : 'text-zinc-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-500' : 'text-zinc-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${passwordValidation.uppercase ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                      One uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-500' : 'text-zinc-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${passwordValidation.lowercase ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                      One lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-500' : 'text-zinc-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${passwordValidation.number ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                      One number (0-9)
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-500' : 'text-zinc-500'}`}>
                      <div className={`w-3 h-3 rounded-full ${passwordValidation.special ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                      One special character (!@#$%^&*)
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2 pl-10 bg-zinc-900 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-zinc-800 focus:ring-primary'
                    }`}
                  />
                  <Lock size={16} className="absolute left-3 top-3 text-zinc-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isPasswordValid || submitting}
                className="w-full mt-6"
              >
                {submitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Success State */}
          {pageState === 'success' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Password reset successfully!</h3>
                <p className="text-zinc-400 text-sm">
                  Your password has been updated. You can now log in with your new password.
                </p>
              </div>

              <Button onClick={handleBackToLogin} className="w-full">
                Return to Sign In
              </Button>
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
                <h3 className="text-lg font-semibold text-white">Password reset failed</h3>
                <p className="text-zinc-400 text-sm">
                  {error || 'We encountered an error while resetting your password.'}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setPageState('form');
                    setPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors border border-zinc-800"
                >
                  Request New Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Help */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>Having trouble? <a href="mailto:support@presently.com" className="text-primary hover:underline">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
