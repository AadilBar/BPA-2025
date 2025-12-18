import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#081023] border-t border-white/6">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-purple-300">The Skyline Project</h3>
            <p className="text-white/60 mt-4 max-w-sm">A safe space for mental health support, connecting you with resources, community, and professional care when you need it most.</p>

            <div className="flex items-center gap-3 mt-6">
              <button className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Facebook size={16} className="text-white/70"/></button>
              <button className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Twitter size={16} className="text-white/70"/></button>
              <button className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Instagram size={16} className="text-white/70"/></button>
              <button className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Linkedin size={16} className="text-white/70"/></button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Navigate</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/nimbus" className="hover:text-white">Lookup</Link></li>
              <li><Link to="/counseling" className="hover:text-white">Appointment</Link></li>
              <li><Link to="/forum" className="hover:text-white">Forums</Link></li>
              <li><Link to="/resources" className="hover:text-white">Resources</Link></li>
              <li><Link to="/testimonials" className="hover:text-white">Testimonials</Link></li>
              <li><Link to="/signin" className="hover:text-white">Sign in</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-4">Need Immediate Help?</h4>
            <div className="bg-white/5 rounded-2xl p-6 shadow-inner">
              <div className="text-white/60 text-sm mb-3">National Suicide Prevention</div>
              <div className="text-white font-bold text-lg mb-3">988</div>

              <div className="text-white/60 text-sm mb-3">Crisis Text Line</div>
              <div className="text-white font-bold mb-3">Text HOME to 741741</div>

              <div className="text-white/60 text-sm mb-1">SAMHSA Helpline</div>
              <div className="text-white font-bold">1-800-662-4357</div>

              <div className="text-white/50 text-xs mt-3">Available 24/7</div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/6 pt-6 text-center text-white/60 text-sm">
          © {new Date().getFullYear()} The Skyline Project. Made with ❤️
          <div className="mt-2 text-white/50 text-xs">Creators: Aadil Barkat • Jeevith Veerasaravanan • Amogh Shivanna • Pradyun Fatwani</div>
        </div>
      </div>
    </footer>
  );
}
