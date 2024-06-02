import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Layout = lazy(() => import("../layouts/Layout"));
const Home = lazy(() => import("../pages/Home"));
const CheckKey = lazy(() => import("../pages/CheckKey"));

const Router = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/home" /> },
      { path: "/home", exact: true, element: <Home /> },
    ],
  },
  { path: "/check-key", element: <CheckKey /> },
];

export default Router;
