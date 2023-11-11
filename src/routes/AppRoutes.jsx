import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import Home from './../pages/Home';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
