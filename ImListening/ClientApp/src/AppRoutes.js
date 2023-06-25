import { Counter } from "./components/Counter";
import Home from "./components/Home";
import Login from "./components/Login";
import Users from "./components/users/Users";
import Urls from "./components/webhook/Urls";

const AppRoutes = [
  {
    index: true,
    element: <Home />
  },
  {
    path: '/counter',
    element: <Counter />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/urls',
    element: <Urls />,
    isPrivate: true
  },
  {
    path: '/users',
    element: <Users />
  },
  // {
  //   path: '/diagnostics',
  //   element: <Diagnostic />
  // },

];

export default AppRoutes;
