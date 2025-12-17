import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { getUserProfile } from '../utils/profileHelpers';
import NimbusLogo from '../assets/Nimbus1.png';
import NimbusSearch from './NimbusSearch';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const profile = await getUserProfile();
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Handle search keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-profile-dropdown]')) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isProfileOpen]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setIsProfileOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const getFirstName = () => {
        if (userProfile?.displayName) {
            return userProfile.displayName.split(' ')[0];
        }
        return user?.email?.split('@')[0] || 'User';
    };

    return (
        <nav className="fixed top-4 left-0 right-0 z-50">
            {/* Search Button - Top Left */}
            <button
                onClick={() => setIsSearchOpen(true)}
                className="fixed top-4 left-4 z-[60] overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-3 shadow-2xl text-white/90 hover:text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
                aria-label="Open search"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>

            {/* Nimbus Search Modal */}
            <NimbusSearch 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
            />

            {/* Two sections - center navigation and right profile */}
            <div className="relative flex items-center justify-center px-4 max-w-full">
                {/* Center: All navigation in one rounded section */}
                <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-full px-2 py-1.5 border border-white/20 shadow-2xl">
                    <div
                        className="pointer-events-none absolute inset-[-12px] opacity-60 mix-blend-screen blur-2xl bg-[conic-gradient(at_30%_30%,#ffffff80,#7ed6ff55,#ffffff30,#abc6ff70,#ffffff80)] animate-[spin_18s_linear_infinite]"
                        aria-hidden
                    />
                    <div className="relative flex items-center gap-1">
                        {/* Left pages */}
                        <Link 
                            to="/nimbus" 
                            className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                                location.pathname === '/nimbus' 
                                    ? 'bg-white/25 text-white shadow-md' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Nimbus
                        </Link>
                        <Link 
                            to="/counseling" 
                            className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                                location.pathname === '/counseling' 
                                    ? 'bg-white/25 text-white shadow-md' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Counseling
                        </Link>
                        
                        {/* Center Logo */}
                        <Link to="/" className="group px-2">
                            <img 
                                src={NimbusLogo} 
                                alt="Nimbus" 
                                className="h-8 w-8 transition-transform duration-300 ease-out group-hover:scale-125 drop-shadow-lg"
                            />
                        </Link>
                        
                        {/* Right pages */}
                        <Link 
                            to="/forum" 
                            className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                                location.pathname === '/forum' 
                                    ? 'bg-white/25 text-white shadow-md' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Forums
                        </Link>
                        <Link 
                            to="/resources" 
                            className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                                location.pathname === '/resources' 
                                    ? 'bg-white/25 text-white shadow-md' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            Resources
                        </Link>
                    </div>
                </div>

                {/* Right: Profile/Sign In in rounded section - positioned absolutely */}
                <div className="hidden md:flex absolute right-4">
                    <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
                        <div
                            className="pointer-events-none absolute inset-[-12px] opacity-60 mix-blend-screen blur-2xl bg-[conic-gradient(at_30%_30%,#ffffff80,#7ed6ff55,#ffffff30,#abc6ff70,#ffffff80)] animate-[spin_18s_linear_infinite]"
                            aria-hidden
                        />
                        {user ? (
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="relative flex items-center gap-2 px-4 py-2 text-white font-semibold transition-all duration-300 hover:bg-white/10 rounded-full"
                                data-profile-dropdown
                            >
                                {userProfile?.profileImageUrl ? (
                                    <img
                                        src={userProfile.profileImageUrl}
                                        alt="Profile"
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                                        <UserIcon size={16} />
                                    </div>
                                )}
                                <span className="text-sm">{getFirstName()}</span>
                            </button>
                        ) : (
                            <Link 
                                to="/signin" 
                                className="relative block px-5 py-2 text-white font-semibold text-sm transition-all duration-300 hover:bg-white/10 rounded-full"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden absolute right-4 relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-full p-2 border border-white/20 shadow-2xl">
                    <div
                        className="pointer-events-none absolute inset-[-12px] opacity-60 mix-blend-screen blur-2xl bg-[conic-gradient(at_30%_30%,#ffffff80,#7ed6ff55,#ffffff30,#abc6ff70,#ffffff80)] animate-[spin_18s_linear_infinite]"
                        aria-hidden
                    />
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="relative text-white/90 hover:text-white focus:outline-none"
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

            {/* Profile Dropdown - Outside overflow container */}
            {isProfileOpen && user && (
                <div className="absolute right-6 top-20 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden" style={{ zIndex: 1000 }}>
                    <Link
                        to="/profile"
                        className="block w-full px-4 py-3 text-white hover:bg-white/10 transition-colors text-center font-semibold border-b border-white/10"
                        onClick={() => setIsProfileOpen(false)}
                    >
                        View Profile
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            )}

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                    <div className="px-4 pt-3 pb-3 space-y-1">
                        <Link
                            to="/nimbus"
                            className={`block px-3 py-2 font-bold rounded-2xl transition-all duration-200 ${location.pathname === '/nimbus' ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Nimbus
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
                            Forums
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="block w-full px-3 py-2 font-bold rounded-2xl transition-all duration-200 text-white/90 hover:text-white hover:bg-white/10 text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    View Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full mt-2 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-white/30 shadow-lg"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/signin"
                                className="w-full mt-2 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold rounded-full transition-all duration-300 border border-white/30 shadow-lg block text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
