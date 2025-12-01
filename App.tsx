import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Onboarding } from './components/Auth/Onboarding';
import { EmailVerificationSent } from './components/Auth/EmailVerificationSent';
import { Layout } from './components/Layout';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { LecturerDashboard } from './components/Dashboard/LecturerDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { ClassRepDashboard } from './components/Dashboard/ClassRepDashboard';
import { ProfilePage } from './components/Profile/ProfilePage';
import { NotificationsPage } from './components/Notifications/NotificationsPage';
import { AiAssistant } from './components/Dashboard/AiAssistant';
import { SettingsPage } from './components/Settings/SettingsPage';
import { NotFound } from './components/NotFound';
import { UserRole } from './types';
import { supabase } from './services/supabase/client';
import { getCurrentUserProfile } from './services/supabase/auth';

// Page state type
type PageState = 'landing' | 'login' | 'register' | 'email-verification' | 'onboarding' | 'dashboard' | 'settings' | '404';

const App: React.FC = () => {
  const [currentPage, setPage] = useState<PageState>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [dashboardPage, setDashboardPage] = useState('dashboard'); // Sub-navigation within Layout
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();

    // Listen for auth changes only if Supabase is configured
    if (!supabase) {
      return () => {}; // Return empty cleanup function
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        handleLogout();
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (uid: string) => {
    const profile = await getCurrentUserProfile();
    if (profile) {
      setUserId(uid);
      setUserEmail(profile.email);
      setUserName(profile.name);
      setUserRole(profile.role);
      
      if (!profile.onboardingComplete) {
        setPage('onboarding');
      } else {
        setPage('dashboard');
      }
    }
  };

  const handleLogin = (role: UserRole, name: string, uid?: string, email?: string) => {
    setUserRole(role);
    setUserName(name);
    if (uid) setUserId(uid);
    if (email) setUserEmail(email);
    setPage('dashboard');
    setDashboardPage('dashboard');
  };

  const handleRegisterSuccess = (name: string, email: string, requiresVerification: boolean) => {
    setUserName(name);
    setUserEmail(email);
    if (requiresVerification) {
      setPage('email-verification');
    } else {
      setPage('onboarding');
    }
  };

  const handleOnboardingComplete = (role: UserRole) => {
    setUserRole(role);
    setPage('dashboard');
  };

  const handleLogout = async () => {
    setUserRole(null);
    setUserName('User');
    setUserId(null);
    setUserEmail('');
    setPage('landing');
    setDashboardPage('dashboard');
  };
  
  // Handle sub-navigation change from Sidebar
  const handleDashboardNavChange = (page: string) => {
      if (page === 'settings') {
          setPage('settings'); // Settings is a top-level page state in this specific architecture choice to keep Layout consistent
          setDashboardPage('settings');
      } else if (page === 'profile') {
          setPage('dashboard');
          setDashboardPage('profile');
      } else if (page === 'notifications') {
          setPage('dashboard');
          setDashboardPage('notifications');
      } else {
          setDashboardPage(page);
          setPage('dashboard'); // Stay in dashboard layout context
      }
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render logic based on state
  const renderContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setPage('register')} onLogin={() => setPage('login')} />;
      
      case 'login':
        return <Login onLogin={handleLogin} onRegisterClick={() => setPage('register')} onBack={() => setPage('landing')} userId={userId} />;
      
      case 'register':
        return <Register onRegister={handleRegisterSuccess} onLoginClick={() => setPage('login')} onBack={() => setPage('landing')} />;
      
      case 'email-verification':
        return <EmailVerificationSent email={userEmail} onBack={() => setPage('login')} />;
      
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} userId={userId} userName={userName} />;
      
      case 'dashboard':
      case 'settings':
        return (
          <Layout 
            userRole={userRole!}
            userName={userName}
            onLogout={handleLogout}
            currentPage={dashboardPage}
            setCurrentPage={handleDashboardNavChange}
          >
            {dashboardPage === 'profile' && (
                 <ProfilePage userRole={userRole!} userName={userName} />
            )}
            {dashboardPage === 'notifications' && (
                 <NotificationsPage />
            )}
            
            {/* Dashboard Role Routing */}
            {currentPage === 'dashboard' && dashboardPage !== 'profile' && dashboardPage !== 'notifications' && (
                <>
                    {userRole === UserRole.STUDENT && <StudentDashboard userName={userName} view={dashboardPage} />}
                    {userRole === UserRole.LECTURER && <LecturerDashboard userName={userName} view={dashboardPage} />}
                    {userRole === UserRole.ADMIN && <AdminDashboard userName={userName} view={dashboardPage} />}
                    {userRole === UserRole.CLASS_REP && <ClassRepDashboard userName={userName} view={dashboardPage} />}
                </>
            )}

            {currentPage === 'settings' && (
                <SettingsPage userRole={userRole!} onLogout={handleLogout} />
            )}
            <AiAssistant />
          </Layout>
        );
        
      case '404':
        return <NotFound onBack={() => setPage('landing')} />;
      
      default:
         // Fallback to 404 for unknown states
        return <NotFound onBack={() => setPage('landing')} />;
    }
  };

  return (
    <BrowserRouter>
        <AnimatePresence mode="wait">
            <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;