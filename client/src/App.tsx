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
import { Spinner } from './components/LoadState.tsx';
import './style.css';

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

// Center content on desktop while staying full-width on mobile.
// League pages widen to 1100px on large screens (.page-center--wide).
const PageCenter = ({ children, fullScreen, wide }: { children: React.ReactNode; fullScreen?: boolean; wide?: boolean }) => (
  <div className={fullScreen ? 'vh-full' : 'vh-nav'} style={{ background: '#0c1628', display: 'flex', justifyContent: 'center' }}>
    <div className={`page-center${wide ? ' page-center--wide' : ''}`}>
      {children}
    </div>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const isLeaguePage = location.pathname.startsWith('/league/');

  if (isAuthPage) {
    return <PageCenter fullScreen>{children}</PageCenter>;
  }

  if (isLeaguePage) {
    return (
      <>
        <Navbar />
        <PageCenter wide>{children}</PageCenter>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageCenter>{children}</PageCenter>
    </>
  );
};

const FullScreenSpinner = () => (
  <div className="vh-full" style={{ background: '#0c1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spinner />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) return <FullScreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) return <FullScreenSpinner />;

  return (
    <Router>
      <Layout>
        <Suspense fallback={<Spinner full />}>
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
