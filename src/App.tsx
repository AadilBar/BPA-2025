import Home from './pages/home'
import Education from './pages/education'
import Help from './pages/help'
import Counseling from './pages/counseling'
import Forum from './pages/forum'
import CreatePost from './pages/createPost'
import Testimonials from './pages/testimonials'
import SignIn from './pages/signin'
import AccountSetup from './pages/accountSetup'
import Profile from './pages/profile'
import Blog from './pages/blog'
import Resources from './pages/resources'
import AddBlogPost from './pages/AddBlogPost';
import BlogPostDetail from './pages/BlogPostDetail';
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
            <Route path="/forum/create" element={<CreatePost />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/accountsetup" element={<AccountSetup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/add-blog" element={<AddBlogPost />} />
            <Route path="/blog/:postId" element={<BlogPostDetail />} />
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
