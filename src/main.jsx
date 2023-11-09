/* eslint-disable react/jsx-no-undef */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import {
  // eslint-disable-next-line no-unused-vars
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import Home from './pages/Home.jsx';
import Order from './pages/Order.jsx';
import CommandWaiter from './pages/CommandWaiter.jsx';
// import LoginPage from "../src/admin/src/pages/login.jsx";
// import AppPage from "./admin/src/pages/app.jsx";
// Importe a tela de dashboard

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <CommandWaiter />,
      },
      {
        path: '/menu',
        element: <Home />,
      },
      {
        path: '/pedido',
        element: <Order />,
      },
    ],
  },
  // {
  //   path: "/admin",
  //   element: <Outlet />,
  //   children: [
  //     {
  //       path: "login",
  //       element: <LoginPage />,
  //     },
  //     {
  //       path: "dashboard",
  //       element: <AppPage />,
  //     },
  //   ],
  // },
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
