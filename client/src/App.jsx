// eslint-disable-next-line no-unused-vars
import React from 'react';
import { createBrowserRouter, RouterProvider, Route, Outlet } from "react-router-dom";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Login from "./pages/Login";
import League from "./pages/League";
import Picks from "./pages/Picks";
import LeagueStandings from './pages/LeagueStandings';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import "./style.scss"

// Used for creating consistent layouts across pages
// const NavbarLayout = () => {
//   return(
//     <>
//       <Navbar />
//       <Outlet />
//     </>
//   );
// };

const Layout = () => {
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



// Router handles page navigation
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/league",
        element: <League />
      },
      {
        path: "/picks",
        element: <Picks />
      },
      {
        path: "/leaguestandings",
        element: <LeagueStandings />
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  }
]);

const App = () => {
  return (
    <div className="app">
      <div className="container">
        <RouterProvider router={router} />
      </div>
    </div>
  )
}


export default App