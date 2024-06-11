import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import League from './pages/League.jsx';
import LeagueRegistration from './pages/LeagueRegistration.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import PropTypes from 'prop-types';
import './style.scss';

const Layout = ({ children }) => {
  const location = useLocation();

  const showNavbar = ['/', '/league'].includes(location.pathname);
  const showSidebar = ['/league'].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="content">
        {showSidebar && <Sidebar />}
        <div className="main">{children}</div>
      </div>
    </>
  );
};



const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/league" replace /> : <Login />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/league" replace /> : <Register />
              }
            />
            <Route
              path="/league"
              element={
                <ProtectedRoute>
                  <League />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leagueregistration"
              element={
                <ProtectedRoute>
                  <LeagueRegistration />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
    </Router>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
