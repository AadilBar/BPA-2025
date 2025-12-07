import Home from './pages/home'
import { Route, Routes, HashRouter } from 'react-router-dom'; 
import './index.css'
import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Routes>
          <Route path="/" element={<Home />} />
      </Routes>
  )
}

export default function AppWrapper() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}
