import Home from './pages/home'
import Education from './pages/education'
import Help from './pages/help'
import Counseling from './pages/counseling'
import Forum from './pages/forum'
import Testimonials from './pages/testimonials'
import { Route, Routes, HashRouter } from 'react-router-dom'; 
import './index.css'
import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Navbar from './components/Navbar';
import MentalHealthPopup from './components/MentalHealthPopup';

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
    <>
      <Navbar />
      <MentalHealthPopup />
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/education" element={<Education />} />
            <Route path="/help" element={<Help />} />
            <Route path="/counseling" element={<Counseling />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/testimonials" element={<Testimonials />} />
        </Routes>
    </>
  )
}

export default function AppWrapper() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
}
