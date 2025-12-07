import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 sm:px-8 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold text-white drop-shadow-lg">
                            temp
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-8">
                            <Link to="/" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-md">
                                Education
                            </Link>
                            <Link to="/help" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-md">
                                Help
                            </Link>
                            <Link to="/counseling" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-md">
                                Counseling
                            </Link>
                            <Link to="/forum" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-md">
                                Forum
                            </Link>
                            <Link to="/testimonials" className="text-white/90 hover:text-white transition-colors duration-200 drop-shadow-md">
                                Testimonials
                            </Link>
                            <button className="px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-white/30 shadow-lg">
                                Get Help
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white/90 hover:text-white focus:outline-none drop-shadow-md"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                    <div className="px-4 pt-3 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Education
                        </Link>
                        <Link
                            to="/help"
                            className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Help
                        </Link>
                        <Link
                            to="/counseling"
                            className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Counseling
                        </Link>
                        <Link
                            to="/forum"
                            className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Forum
                        </Link>
                        <Link
                            to="/testimonials"
                            className="block px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Testimonials
                        </Link>
                        <button className="w-full mt-2 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-white/30 shadow-lg">
                            Get Help
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
