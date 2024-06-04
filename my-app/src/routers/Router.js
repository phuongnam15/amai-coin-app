import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Layout = lazy(() => import("../layouts/Layout"));
const Start = lazy(() => import("../pages/Start"));
const CheckKey = lazy(() => import("../pages/CheckKey"));
const InputKey = lazy(() => import("../pages/InputKey"));

const Router = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/key" /> },
      { path: "/start", exact: true, element: <Start /> },
      { path: "/input-key", element: <InputKey /> },
    ],
  },
  { path: "/key", element: <CheckKey /> },
];

export default Router;
