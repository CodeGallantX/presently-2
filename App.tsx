import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Onboarding } from './components/Auth/Onboarding';
import { EmailVerificationSent } from './components/Auth/EmailVerificationSent';
import { VerifyEmail } from './components/Auth/VerifyEmail';
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

// Auth context wrapper component
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const handleLogin = (role: UserRole, name: string, uid?: string, email?: string) => {
    setUserRole(role);
    setUserName(name);
    if (uid) setUserId(uid);
    if (email) setUserEmail(email);
    navigate('/dashboard');
    setDashboardPage('dashboard');
  };

  const handleRegisterSuccess = (name: string, email: string, requiresVerification: boolean) => {
    setUserName(name);
    setUserEmail(email);
    if (requiresVerification) {
      navigate('/email-verification');
    } else {
      navigate('/onboarding');
    }
  };

  const handleOnboardingComplete = (role: UserRole) => {
    setUserRole(role);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    setUserRole(null);
    setUserName('User');
    setUserId(null);
    setUserEmail('');
    navigate('/');
    setDashboardPage('dashboard');
  };
  
  // Handle sub-navigation change from Sidebar
  const handleDashboardNavChange = (page: string) => {
      setDashboardPage(page);
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

  return (
    <Routes>
      <Route path="/" element={<LandingPage onGetStarted={() => navigate('/register')} onLogin={() => navigate('/login')} />} />
      
      <Route path="/login" element={<Login onLogin={handleLogin} onRegisterClick={() => navigate('/register')} onBack={() => navigate('/')} userId={userId} />} />
      
      <Route path="/register" element={<Register onRegister={handleRegisterSuccess} onLoginClick={() => navigate('/login')} onBack={() => navigate('/')} />} />
      
      <Route path="/email-verification" element={<EmailVerificationSent email={userEmail} onBack={() => navigate('/login')} />} />
      
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      <Route path="/onboarding" element={
        userId ? (
          <Onboarding onComplete={handleOnboardingComplete} userId={userId} userName={userName} />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/dashboard" element={
        userRole ? (
          <Layout 
            userRole={userRole}
            userName={userName}
            onLogout={handleLogout}
            currentPage={dashboardPage}
            setCurrentPage={handleDashboardNavChange}
          >
            {dashboardPage === 'profile' && (
                 <ProfilePage userRole={userRole} userName={userName} />
            )}
            {dashboardPage === 'notifications' && (
                 <NotificationsPage />
            )}
            
            {/* Dashboard Role Routing */}
            {dashboardPage !== 'profile' && dashboardPage !== 'notifications' && dashboardPage !== 'settings' && (
                <>
                    {userRole === UserRole.STUDENT && <StudentDashboard userName={userName} view={dashboardPage} />}
                    {userRole === UserRole.LECTURER && <LecturerDashboard userName={userName} view={dashboardPage} />}
                    {userRole === UserRole.ADMIN && <AdminDashboard userName={userName} view={dashboardPage} />}
                    {userRole === UserRole.CLASS_REP && <ClassRepDashboard userName={userName} view={dashboardPage} />}
                </>
            )}

            {dashboardPage === 'settings' && (
                <SettingsPage userRole={userRole} onLogout={handleLogout} />
            )}
            <AiAssistant />
          </Layout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="*" element={<NotFound onBack={() => navigate('/')} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;