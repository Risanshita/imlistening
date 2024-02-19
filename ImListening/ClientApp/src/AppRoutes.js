import { Counter } from "./components/Counter";
import Home from "./components/Home";
import Login from "./components/Login";
import LoadGraph from "./components/loadGraph/LoadGraph";
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
  {
    path: '/loadGraph',
    element: <LoadGraph />,
    isPrivate: true
  },
  {
    path: '/history',
    element: <Home />,
    isPrivate: true
  },

];

export default AppRoutes;
