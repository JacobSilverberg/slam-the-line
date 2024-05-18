import React from 'react';
import { createBrowserRouter, RouterProvider, Route, Outlet } from "react-router-dom";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Login from "./pages/Login";
import League from "./pages/League";
import Picks from "./pages/Picks";
import Navbar from './components/Navbar';
import "./style.scss"

// Used for creating consistent layouts across pages
const NavbarLayout = () => {
  return(
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

// Router handles page navigation
const router = createBrowserRouter([
  {
    path: "/",
    element: <NavbarLayout />,
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
        path: "/picks/post/:id",
        element: <Picks />
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
  },
  {
    path: "/league",
    element: <League />
  },
  {
    path: "/picks",
    element: <Picks />
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