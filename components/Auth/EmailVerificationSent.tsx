import React, { useState } from 'react';
import { Logo } from '../Logo';
import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../Button';

interface EmailVerificationSentProps {
  email: string;
  onBack: () => void;
}

export const EmailVerificationSent: React.FC<EmailVerificationSentProps> = ({ email, onBack }) => {
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleResend = async () => {
    setResendStatus('sending');
    // Simulate resend (you can add actual resend logic here)
    setTimeout(() => {
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-4 relative">
      <button onClick={onBack} className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-8 text-2xl" />
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="text-primary" size={36} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-zinc-950 animate-in zoom-in duration-300 delay-300">
              <CheckCircle size={16} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Check your inbox</h2>
          <p className="text-zinc-400 text-sm">
            We've sent a verification link to
          </p>
          <p className="text-white font-medium mt-2 text-lg">{email}</p>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-5 border border-primary/10">
              <p className="font-semibold text-white mb-3 flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                What happens next?
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-zinc-300 pt-0.5">Check your email inbox for our verification link</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-zinc-300 pt-0.5">Click the link to verify your email address</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-zinc-300 pt-0.5">Complete your onboarding profile setup</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span className="text-zinc-300 pt-0.5">Access your personalized dashboard</span>
                </li>
              </ol>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-3">
                <span className="font-semibold text-zinc-400">Can't find the email?</span> Check your spam or junk folder. 
                Make sure to add noreply@presently.app to your contacts.
              </p>
              
              <Button 
                onClick={handleResend}
                variant="secondary"
                className="w-full"
                size="sm"
                disabled={resendStatus !== 'idle'}
                isLoading={resendStatus === 'sending'}
              >
                {resendStatus === 'idle' && (
                  <>
                    <RefreshCw size={14} className="mr-2" />
                    Resend Verification Email
                  </>
                )}
                {resendStatus === 'sent' && (
                  <>
                    <CheckCircle size={14} className="mr-2" />
                    Email Sent!
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500">Already verified? </span>
          <button onClick={onBack} className="text-primary font-medium hover:underline transition-colors">
            Continue to login
          </button>
        </div>
      </div>
    </div>
  );
};
