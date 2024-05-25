// eslint-disable-next-line no-unused-vars
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import League from './pages/League';
import Picks from './pages/Picks';
import Picksheet from './pages/Picksheet';
import Standings from './pages/Standings';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './style.scss';

const NavAndSideLayout = () => {
  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

const NavbarOnlyLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

// Layout that includes only Sidebar
// eslint-disable-next-line no-unused-vars
const SidebarOnlyLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

// Layout that includes neither Navbar nor Sidebar
const NoNavOrSideLayout = () => {
  return (
    <div className="content">
      <Outlet />
    </div>
  );
};

// Router handles page navigation
const router = createBrowserRouter([
  {
    path: '/',
    element: <NavbarOnlyLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
    ],
  },
  {
    path: '/league',
    element: <NavAndSideLayout />,
    children: [
      {
        path: '',
        element: <League />,
      },
      {
        path: 'picksheet',
        element: <Picksheet />,
      },
      {
        path: 'standings',
        element: <Standings />,
      },
    ],
  },
  {
    path: '/login',
    element: <NoNavOrSideLayout />,
    children: [
      {
        path: '',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
]);

const App = () => {
  return (
    <div className="app">
      <div className="container">
        <RouterProvider router={router} />
      </div>
    </div>
  );
};

export default App;
