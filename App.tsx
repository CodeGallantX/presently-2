import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Onboarding } from './components/Auth/Onboarding';
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
import { useAuth } from './services/useAuth';
import { signOut } from './services/authService';
import { navigationGuard, getDefaultPageForRole } from './services/rbac';

// Page state type
type PageState = 'landing' | 'login' | 'register' | 'onboarding' | 'dashboard' | 'settings' | '404';

const App: React.FC = () => {
  const { user, isAuthenticated, isLoading, navigate: rbacNavigate } = useAuth();
  const [currentPage, setPage] = useState<PageState>('landing');
  const [dashboardPage, setDashboardPage] = useState('dashboard');

  // Initialize page based on auth state
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Not authenticated - stay on public pages
      if (currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'register') {
        setPage('landing');
      }
    } else if (user) {
      // Authenticated - check onboarding status
      if (!user.onboardingComplete) {
        setPage('onboarding');
      } else if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register' || currentPage === 'onboarding') {
        // Redirect to dashboard if on public pages or onboarding is complete
        setPage('dashboard');
        setDashboardPage(getDefaultPageForRole(user.role));
      }
    }
  }, [isAuthenticated, user, isLoading]);

  // Navigation callback for RBAC
  const handleNavigate = (page: string) => {
    if (page === 'dashboard' || page === 'profile' || page === 'notifications' || page === 'settings') {
      if (page === 'settings') {
        setPage('settings');
        setDashboardPage('settings');
      } else if (page === 'profile' || page === 'notifications') {
        setPage('dashboard');
        setDashboardPage(page);
      } else {
        setPage('dashboard');
        setDashboardPage('dashboard');
      }
    } else {
      setPage(page as PageState);
    }
  };

  const handleLogin = (role: UserRole, name: string) => {
    // Check if onboarding is complete
    if (user && !user.onboardingComplete) {
      handleNavigate('onboarding');
    } else {
      rbacNavigate('dashboard', handleNavigate);
    }
  };

  const handleRegisterSuccess = (name: string) => {
    handleNavigate('onboarding');
  };

  const handleOnboardingComplete = (role: UserRole) => {
    rbacNavigate('dashboard', handleNavigate);
  };

  const handleLogout = async () => {
    await signOut();
    setPage('landing');
    setDashboardPage('dashboard');
  };
  
  // Handle sub-navigation change from Sidebar with RBAC
  const handleDashboardNavChange = (page: string) => {
    if (!user) {
      handleNavigate('login');
      return;
    }

    // Use RBAC navigation guard
    const result = navigationGuard(user.role, user.onboardingComplete, page);
    
    if (result.allowed) {
      if (page === 'settings') {
        setPage('settings');
        setDashboardPage('settings');
      } else if (page === 'profile' || page === 'notifications') {
        setPage('dashboard');
        setDashboardPage(page);
      } else {
        setDashboardPage(page);
        setPage('dashboard');
      }
    } else if (result.redirectTo) {
      // Access denied - redirect to default page
      console.log(`Access denied to ${page}: ${result.reason}`);
      handleNavigate(result.redirectTo);
    }
  };

  // Render logic based on state
  const renderContent = () => {
    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setPage('register')} onLogin={() => setPage('login')} />;
      
      case 'login':
        return <Login onLogin={handleLogin} onRegisterClick={() => setPage('register')} onBack={() => setPage('landing')} />;
      
      case 'register':
        return <Register onRegister={handleRegisterSuccess} onLoginClick={() => setPage('login')} onBack={() => setPage('landing')} />;
      
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      
      case 'dashboard':
      case 'settings':
        // Ensure user is authenticated before rendering dashboard
        if (!user) {
          setPage('login');
          return null;
        }

        return (
          <Layout 
            userRole={user.role}
            userName={user.name}
            onLogout={handleLogout}
            currentPage={dashboardPage}
            setCurrentPage={handleDashboardNavChange}
          >
            {dashboardPage === 'profile' && (
                 <ProfilePage userRole={user.role} userName={user.name} />
            )}
            {dashboardPage === 'notifications' && (
                 <NotificationsPage />
            )}
            
            {/* Dashboard Role Routing */}
            {currentPage === 'dashboard' && dashboardPage !== 'profile' && dashboardPage !== 'notifications' && (
                <>
                    {user.role === UserRole.STUDENT && <StudentDashboard userName={user.name} view={dashboardPage} />}
                    {user.role === UserRole.LECTURER && <LecturerDashboard userName={user.name} view={dashboardPage} />}
                    {user.role === UserRole.ADMIN && <AdminDashboard userName={user.name} view={dashboardPage} />}
                    {user.role === UserRole.CLASS_REP && <ClassRepDashboard userName={user.name} view={dashboardPage} />}
                </>
            )}

            {currentPage === 'settings' && (
                <SettingsPage userRole={user.role} onLogout={handleLogout} />
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
    <HashRouter>
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
    </HashRouter>
  );
};

export default App;