import React from 'react';
import { Logo } from '../Logo';
import { Mail, ArrowLeft } from 'lucide-react';

interface EmailVerificationSentProps {
  email: string;
  onBack: () => void;
}

export const EmailVerificationSent: React.FC<EmailVerificationSentProps> = ({ email, onBack }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <button onClick={onBack} className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-6 text-2xl" />
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="text-zinc-400 mt-2">
            We've sent a verification link to
          </p>
          <p className="text-white font-medium mt-1">{email}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl">
          <div className="space-y-4 text-sm text-zinc-400">
            <p>Click the link in the email to verify your account and complete your registration.</p>
            
            <div className="bg-zinc-900 rounded-lg p-4 space-y-2">
              <p className="font-medium text-white">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                <li>Click the verification link in your email</li>
                <li>You'll be redirected to complete onboarding</li>
                <li>Select your role and preferences</li>
                <li>Start using Presently!</li>
              </ol>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs">
                Didn't receive the email? Check your spam folder or{' '}
                <button className="text-primary hover:underline">
                  resend verification email
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Already verified?{' '}
          <button onClick={onBack} className="text-primary font-medium hover:underline">
            Go to login
          </button>
        </div>
      </div>
    </div>
  );
};
