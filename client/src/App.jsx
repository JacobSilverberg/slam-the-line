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
import Standings from './pages/Standings.jsx';
import Picksheet from './pages/Picksheet.jsx';
import JoinLeague from './pages/JoinLeague.jsx';
import CreateLeague from './pages/CreateLeague.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Commissioner from './pages/Commissioner.jsx';

import Navbar from './components/Navbar.jsx';
// import Sidebar from './components/Sidebar.jsx';

import { AuthContext } from './context/AuthContext.jsx';

import PropTypes from 'prop-types';
import './style.scss';

const Layout = ({ children }) => {
  const location = useLocation();

  const showNavbar = ['/', '/league'].some((path) =>
    location.pathname.startsWith(path)
  );
  // const showSidebar = ['/league'].some((path) =>
  //   location.pathname.startsWith(path)
  // );

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="content">
        {/* {showSidebar && <Sidebar />} */}
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
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Register />
            }
          />
          <Route
            path="/league/:leagueId"
            element={
              <ProtectedRoute>
                <League />
              </ProtectedRoute>
            }
          />
          <Route
            path="/league/:leagueId/standings"
            element={
              <ProtectedRoute>
                <Standings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/league/:leagueId/picksheet"
            element={
              <ProtectedRoute>
                <Picksheet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/league/:leagueId/commissioner"
            element={
              <ProtectedRoute>
                <Commissioner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/joinleague/"
            element={
              <ProtectedRoute>
                <JoinLeague />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createleague"
            element={
              <ProtectedRoute>
                <CreateLeague />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userprofile"
            element={
              <ProtectedRoute>
                <UserProfile />
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
