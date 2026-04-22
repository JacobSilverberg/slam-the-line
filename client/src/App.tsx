import React, { lazy, Suspense, useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import './style.scss';

// Code-split all pages — each loads only when navigated to
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword.jsx'));
const League = lazy(() => import('./pages/League.jsx'));
const Standings = lazy(() => import('./pages/Standings.jsx'));
const Picksheet = lazy(() => import('./pages/Picksheet.jsx'));
const Pickgrid = lazy(() => import('./pages/Pickgrid.jsx'));
const JoinLeague = lazy(() => import('./pages/JoinLeague.jsx'));
const CreateLeague = lazy(() => import('./pages/CreateLeague.jsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.jsx'));
const Commissioner = lazy(() => import('./pages/Commissioner.jsx'));

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showNavbar = ['/', '/league'].some((path) => location.pathname.startsWith(path));

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="content">
        <div className="main">{children}</div>
      </div>
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
