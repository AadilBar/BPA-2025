import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#081023] border-t border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-purple-300">The Skyline Project</h3>
            <p className="text-white/60 mt-3 sm:mt-4 max-w-sm text-sm sm:text-base">A safe space for mental health support, connecting you with resources, community, and professional care when you need it most.</p>

            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Facebook size={14} className="sm:w-4 sm:h-4 text-white/70"/></button>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Twitter size={14} className="sm:w-4 sm:h-4 text-white/70"/></button>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Instagram size={14} className="sm:w-4 sm:h-4 text-white/70"/></button>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/3 flex items-center justify-center hover:bg-white/5 transition"><Linkedin size={14} className="sm:w-4 sm:h-4 text-white/70"/></button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Navigate</h4>
            <ul className="space-y-2 text-white/70 text-xs sm:text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/counseling" className="hover:text-white">Appointment</Link></li>
              <li><Link to="/forum" className="hover:text-white">Forums</Link></li>
              <li><Link to="/resources" className="hover:text-white">Resources</Link></li>
              <li><a href="https://buy.stripe.com/test_6oU14mfS88iifOk8Tt83C01" target="_blank" rel="noopener noreferrer" className="hover:text-white">Donate</a></li>
              <li><Link to="/signin" className="hover:text-white">Sign in</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Need Immediate Help?</h4>
            <div className="bg-white/5 rounded-2xl p-4 sm:p-6 shadow-inner">
              <div className="text-white/60 text-xs sm:text-sm mb-2 sm:mb-3">National Suicide Prevention</div>
              <div className="text-white font-bold text-base sm:text-lg mb-2 sm:mb-3">988</div>

              <div className="text-white/60 text-xs sm:text-sm mb-2 sm:mb-3">Crisis Text Line</div>
              <div className="text-white font-bold text-sm sm:text-base mb-2 sm:mb-3">Text HOME to 741741</div>

              <div className="text-white/60 text-xs sm:text-sm mb-1">SAMHSA Helpline</div>
              <div className="text-white font-bold text-sm sm:text-base">1-800-662-4357</div>

              <div className="text-white/50 text-xs mt-2 sm:mt-3">Available 24/7</div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-white/6 pt-4 sm:pt-6 text-center text-white/60 text-xs sm:text-sm">
          © {new Date().getFullYear()} The Skyline Project. Made with ❤️
          <div className="mt-2 text-white/50 text-[10px] sm:text-xs">Creators: Aadil Barkat • Jeevith Veerasaravanan • Amogh Shivanna • Pradyun Fatwani</div>
        </div>
      </div>
    </footer>
  );
}
