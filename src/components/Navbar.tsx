import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-6xl flex flex-col">
            <div className="flex items-center gap-3">
                {/* Main navbar container */}
                <div className={`transition-all duration-500 ease-out ${isSearchOpen ? 'flex-1' : 'flex-1'} bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 sm:px-8 shadow-2xl shadow-black/20`}>
                    <div className={`flex items-center h-14 ${isSearchOpen ? 'justify-between' : 'justify-between'}`}>
                        {/* Logo */}
                        {!isSearchOpen && (
                            <div className="flex-shrink-0 transition-opacity duration-300">
                                <Link to="/" className="text-xl font-bold text-white drop-shadow-lg">
                                    temp
                                </Link>
                            </div>
                        )}

                        {/* Desktop Navigation */}
                        {!isSearchOpen && (
                            <div className="hidden md:flex md:flex-1 justify-end items-center space-x-8 nav-fade-in">
                                <Link to="/" className={`nav-link font-bold transition-all duration-200 drop-shadow-md ${location.pathname === '/' ? 'text-white' : 'text-white/90'}`}>
                                    Home
                                </Link>
                                <Link to="/education" className={`nav-link font-bold transition-all duration-200 drop-shadow-md ${location.pathname === '/education' ? 'text-white' : 'text-white/90'}`}>
                                    Education
                                </Link>
                                <Link to="/counseling" className={`nav-link font-bold transition-all duration-200 drop-shadow-md ${location.pathname === '/counseling' ? 'text-white' : 'text-white/90'}`}>
                                    Counseling
                                </Link>
                                <Link to="/forum" className={`nav-link font-bold transition-all duration-200 drop-shadow-md ${location.pathname === '/forum' ? 'text-white' : 'text-white/90'}`}>
                                    Forum
                                </Link>
                                <Link to="/testimonials" className={`nav-link font-bold transition-all duration-200 drop-shadow-md ${location.pathname === '/testimonials' ? 'text-white' : 'text-white/90'}`}>
                                    Testimonials
                                </Link>
                                <Link to="/help" className="px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-white/30 shadow-lg">
                                    Get Help
                                </Link>
                            </div>
                        )}

                        {/* Search Input */}
                        {isSearchOpen && (
                            <div className="flex-1 flex items-center justify-between nav-fade-in">
                                <input
                                    type="text"
                                    placeholder="Ask Nimbus..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none font-medium drop-shadow-md"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="text-white/90 hover:text-white focus:outline-none drop-shadow-md transition-all duration-200 ml-4"
                                    aria-label="Close search"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        {!isSearchOpen && (
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
                        )}
                    </div>
                </div>

                {/* Search icon bubble */}
                {!isSearchOpen && (
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="hidden md:flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-3 shadow-2xl shadow-black/20 text-white/90 hover:text-white transition-all duration-300 drop-shadow-md hover:bg-white/20 items-center justify-center h-14 w-14 flex-shrink-0 hover:scale-110"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                    <div className="px-4 pt-3 pb-3 space-y-1">
                        <Link
                            to="/"
                            className={`block px-3 py-2 font-bold rounded-2xl transition-all duration-200 ${location.pathname === '/' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/education"
                            className={`block px-3 py-2 font-bold rounded-2xl transition-all duration-200 ${location.pathname === '/education' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Education
                        </Link>
                        <Link
                            to="/counseling"
                            className={`block px-3 py-2 font-bold rounded-2xl transition-all duration-200 ${location.pathname === '/counseling' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Counseling
                        </Link>
                        <Link
                            to="/forum"
                            className={`block px-3 py-2 font-bold rounded-2xl transition-all duration-200 ${location.pathname === '/forum' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Forum
                        </Link>
                        <Link
                            to="/testimonials"
                            className={`block px-3 py-2 font-bold rounded-2xl transition-all duration-200 ${location.pathname === '/testimonials' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Testimonials
                        </Link>
                        <Link
                            to="/help"
                            className="w-full mt-2 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-white/30 shadow-lg block text-center"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Get Help
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
