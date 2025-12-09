import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

interface LocationState {
  message?: string;
  requiredRole?: UserRole[];
}

/**
 * Unauthorized Page Component
 * Displays when a user tries to access a page they don't have permission for
 */
export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-full inline-flex items-center justify-center w-20 h-20">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 0H8m4 0h4m-12-3a9 9 0 1118 0 9 9 0 01-18 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>

        {/* Message */}
        <p className="text-zinc-400 mb-6">
          {state?.message ||
            'You do not have permission to access this page. Your current role does not grant you access.'}
        </p>

        {/* Required Role Info */}
        {state?.requiredRole && state.requiredRole.length > 0 && (
          <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-400 mb-2">Required role:</p>
            <p className="text-sm font-medium text-amber-500">
              {state.requiredRole.join(' or ')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-foreground rounded-lg font-medium transition-colors border border-zinc-800"
          >
            Go Back
          </button>
        </div>

        {/* Contact Support */}
        <p className="mt-8 text-xs text-zinc-500">
          If you believe this is an error, please{' '}
          <a href="mailto:support@presently.com" className="text-primary hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
