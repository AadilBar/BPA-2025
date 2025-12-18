import Home from './pages/home'
import Education from './pages/education'
import Help from './pages/help'
import Counseling from './pages/counseling'
import Forum from './pages/forum'
import Testimonials from './pages/testimonials'
import SignIn from './pages/signin'
import AccountSetup from './pages/accountSetup'
import Profile from './pages/profile'
import Nimbus from './pages/nimbus'
import Resources from './pages/resources'
import { Route, Routes, HashRouter, useLocation } from 'react-router-dom'; 
import './index.css'
import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Navbar from './components/Navbar';
import MentalHealthPopup from './components/MentalHealthPopup';

function App() {
  const location = useLocation();

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
            <Route path="/signin" element={<SignIn />} />
            <Route path="/accountsetup" element={<AccountSetup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/nimbus" element={<Nimbus />} />
            <Route path="/resources" element={<Resources />} />
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
