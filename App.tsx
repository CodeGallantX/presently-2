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

// Page state type
type PageState = 'landing' | 'login' | 'register' | 'onboarding' | 'dashboard' | 'settings' | '404';

const App: React.FC = () => {
  const [currentPage, setPage] = useState<PageState>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [dashboardPage, setDashboardPage] = useState('dashboard'); // Sub-navigation within Layout

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    setPage('dashboard');
    setDashboardPage('dashboard');
  };

  const handleRegisterSuccess = (name: string) => {
    setUserName(name);
    setPage('onboarding');
  };

  const handleOnboardingComplete = (role: UserRole) => {
    setUserRole(role);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('User');
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

  // Render logic based on state
  const renderContent = () => {
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