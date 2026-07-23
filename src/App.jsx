import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import WriteupPage from './pages/WriteupPage';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter basename="/HTB-Portfolio">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/box/:id" element={<WriteupPage type="machine" />} />
        <Route path="/challenge/:id" element={<WriteupPage type="challenge" />} />
      </Routes>
    </BrowserRouter>
  );
}
