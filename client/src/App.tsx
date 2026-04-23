import React, { lazy, Suspense, useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Navbar from './components/Navbar.tsx';
import { AuthContext } from './context/AuthContext.tsx';
import './style.scss';

// Code-split all pages — each loads only when navigated to
const Home = lazy(() => import('./pages/Home.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const Register = lazy(() => import('./pages/Register.tsx'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword.tsx'));
const League = lazy(() => import('./pages/League.tsx'));
const Standings = lazy(() => import('./pages/Standings.tsx'));
const Picksheet = lazy(() => import('./pages/Picksheet.tsx'));
const Pickgrid = lazy(() => import('./pages/Pickgrid.tsx'));
const JoinLeague = lazy(() => import('./pages/JoinLeague.tsx'));
const CreateLeague = lazy(() => import('./pages/CreateLeague.tsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));
const Commissioner = lazy(() => import('./pages/Commissioner.tsx'));

const AUTH_PATHS = ['/login', '/register', '/updatepassword'];

// Center content on desktop while staying full-width on mobile
const PageCenter = ({ children, fullScreen }: { children: React.ReactNode; fullScreen?: boolean }) => (
  <div style={{ background: '#0c1628', minHeight: fullScreen ? '100vh' : 'calc(100vh - 56px)', display: 'flex', justifyContent: 'center' }}>
    <div style={{ width: '100%', maxWidth: 720 }}>
      {children}
    </div>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const isLeaguePage = location.pathname.startsWith('/league/');

  if (isAuthPage || isLeaguePage) {
    return <PageCenter fullScreen>{children}</PageCenter>;
  }

  return (
    <>
      <Navbar />
      <PageCenter>{children}</PageCenter>
    </>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) return null;

  return (
    <Router>
      <Layout>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="/updatepassword"
              element={isAuthenticated ? <Navigate to="/" replace /> : <UpdatePassword />}
            />
            <Route path="/league/:leagueId" element={<ProtectedRoute><League /></ProtectedRoute>} />
            <Route path="/league/:leagueId/standings" element={<ProtectedRoute><Standings /></ProtectedRoute>} />
            <Route path="/league/:leagueId/picksheet" element={<ProtectedRoute><Picksheet /></ProtectedRoute>} />
            <Route path="/league/:leagueId/pickgrid" element={<ProtectedRoute><Pickgrid /></ProtectedRoute>} />
            <Route path="/league/:leagueId/commissioner" element={<ProtectedRoute><Commissioner /></ProtectedRoute>} />
            <Route path="/joinleague" element={<ProtectedRoute><JoinLeague /></ProtectedRoute>} />
            <Route path="/createleague" element={<ProtectedRoute><CreateLeague /></ProtectedRoute>} />
            <Route path="/userprofile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
