import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Discussions from "../components/home/discussions";
import Testimonial from "../components/home/testimonials";
import MentalHealthPopup from "../components/MentalHealthPopup";
import tsplanding from '../assets/tsplanding.png';

function Home() {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    // Check if this is the first visit
    const isFirstVisit = !sessionStorage.getItem('hasVisitedHome');
    const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');

    // Initial page fade-in and setup
    useEffect(() => {
        setPageLoaded(true);
        
        // If not first visit, show content immediately
        if (!isFirstVisit) {
            setShowContent(true);
        }
        
        // Show popup after delay only if never seen before
        if (!hasSeenPopup) {
            const popupTimer = setTimeout(() => {
                setShowPopup(true);
            }, 2000);
            
            return () => clearTimeout(popupTimer);
        }
    }, []);

    const triggerTransition = () => {
        if (isTransitioning || showContent) return;
        
        // Start transition immediately
        setIsTransitioning(true);
        
        // Show content earlier to avoid blank screen
        setTimeout(() => {
            setShowContent(true);
            setIsTransitioning(false);
            // Mark that user has visited home
            sessionStorage.setItem('hasVisitedHome', 'true');
        }, 400);
    };

    // Prevent scrolling and trigger transition instead
    useEffect(() => {
        const handleScroll = (e: Event) => {
            if (!showContent && !isTransitioning) {
                e.preventDefault();
                window.scrollTo(0, 0);
                
                if (!hasScrolled) {
                    setHasScrolled(true);
                    triggerTransition();
                }
            }
        };

        const handleWheel = (e: WheelEvent) => {
            if (!showContent && !isTransitioning) {
                e.preventDefault();
                
                if (!hasScrolled) {
                    setHasScrolled(true);
                    triggerTransition();
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: false });
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [showContent, isTransitioning, hasScrolled]);

    // Scroll to content after transition
    useEffect(() => {
        if (showContent) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [showContent]);

    // Prevent body scrolling when on landing
    useEffect(() => {
        if (!showContent) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showContent]);

    return (
        <>
        <div 
            style={{
                minHeight: '100vh',
                position: 'relative',
                background: `
                    radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.5) 0%, transparent 40%),
                    radial-gradient(circle at 85% 25%, rgba(14, 165, 233, 0.45) 0%, transparent 35%),
                    radial-gradient(circle at 35% 65%, rgba(125, 211, 252, 0.4) 0%, transparent 45%),
                    radial-gradient(circle at 75% 75%, rgba(2, 132, 199, 0.5) 0%, transparent 50%),
                    radial-gradient(circle at 50% 45%, rgba(96, 165, 250, 0.35) 0%, transparent 55%),
                    radial-gradient(circle at 5% 85%, rgba(3, 105, 161, 0.4) 0%, transparent 40%),
                    radial-gradient(circle at 90% 10%, rgba(186, 230, 253, 0.3) 0%, transparent 35%),
                    radial-gradient(circle at 60% 90%, rgba(7, 89, 133, 0.35) 0%, transparent 40%),
                    linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #38bdf8 100%)
                `,
                opacity: pageLoaded ? 1 : 0,
                transition: 'opacity 800ms ease-out'
            }}
        >
            {/* Landing Section - Overlay */}
            <section 
                className={`min-h-screen flex items-center justify-center overflow-hidden ${
                    showContent ? 'hidden' : ''
                }`}
                style={{
                    position: showContent ? 'relative' : 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: showContent ? 0 : 50,
                    backgroundImage: `url(${tsplanding})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
            >
                {/* Animated background layer that zooms */}
                <div 
                    className={`absolute inset-0`}
                    style={{
                        backgroundImage: `url(${tsplanding})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        transform: isTransitioning ? 'scale(3)' : 'scale(1)',
                        transformOrigin: 'center center',
                        transition: 'transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                />
                
                {/* Color transition overlay - crossfades to match content background */}
                <div 
                    className={`absolute inset-0`}
                    style={{
                        background: 'linear-gradient(135deg, rgba(12, 74, 110, 0.8) 0%, rgba(3, 105, 161, 0.7) 50%, rgba(56, 189, 248, 0.6) 100%)',
                        opacity: isTransitioning ? 1 : 0,
                        transition: 'opacity 600ms cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                />
                
                {/* Base overlay for readability */}
                <div 
                    className={`absolute inset-0`}
                    style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        opacity: isTransitioning ? 0 : 1,
                        transition: 'opacity 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                />
                
                {/* Title + Content - fades as zoom happens */}
                <div 
                    className={`z-10 px-8 md:px-16 lg:px-24 text-center max-w-5xl`}
                    style={{
                        opacity: isTransitioning ? 0 : 1,
                        transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
                        transition: 'all 900ms cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                >
                    <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-tight drop-shadow-2xl tracking-tight">
                        #RiseAbove
                    </h1>
                    
                    <p className="text-2xl md:text-3xl lg:text-4xl text-white/95 mb-16 leading-relaxed font-semibold">
                        Join thousands of others who have overcome their fears
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button 
                            onClick={() => navigate('/counseling')}
                            className="px-10 py-5 bg-white/25 hover:bg-white/35 backdrop-blur-xl text-white font-bold text-lg rounded-full border border-white/40 shadow-2xl shadow-black/20 transition-all duration-300 drop-shadow-lg hover:scale-105"
                        >
                            Get Support
                        </button>
                        <button 
                            onClick={triggerTransition}
                            className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-semibold text-lg rounded-full border border-white/30 shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            View The Change
                        </button>
                    </div>
                </div>

                {/* Wavy transition at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-48 z-20 -mb-8">
                    <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full">
                        {/* Bottom layer with soft fade */}
                        <path d="M0,100 C200,140 300,80 450,110 C600,140 750,90 900,120 C1050,150 1150,100 1200,130 L1200,200 L0,200 Z" 
                              fill="url(#soft-blue1)" opacity="0.4"/>
                        {/* Second layer */}
                        <path d="M0,85 C150,55 350,105 500,75 C650,45 800,95 950,65 C1100,35 1180,75 1200,85 L1200,200 L0,200 Z" 
                              fill="url(#soft-blue2)" opacity="0.35"/>
                        {/* Middle fluffy layer */}
                        <path d="M0,70 C100,100 250,50 400,80 C550,110 700,60 850,90 C1000,120 1120,70 1200,100 L1200,200 L0,200 Z" 
                              fill="url(#soft-white1)" opacity="0.3"/>
                        {/* Upper soft layer */}
                        <path d="M0,60 C180,80 320,40 520,70 C720,100 880,50 1050,80 C1150,95 1180,60 1200,75 L1200,200 L0,200 Z" 
                              fill="url(#soft-blue3)" opacity="0.25"/>
                        {/* Top highlight layer */}
                        <path d="M0,50 C220,70 380,30 580,60 C780,90 920,40 1100,65 C1170,75 1190,45 1200,60 L1200,200 L0,200 Z" 
                              fill="url(#soft-white2)" opacity="0.2"/>
                        <defs>
                            <linearGradient id="soft-blue1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="#eff6ff" stopOpacity="0.3" />
                            </linearGradient>
                            <linearGradient id="soft-blue2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
                                <stop offset="50%" stopColor="#bfdbfe" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.2" />
                            </linearGradient>
                            <linearGradient id="soft-white1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                                <stop offset="50%" stopColor="#f0f9ff" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.1" />
                            </linearGradient>
                            <linearGradient id="soft-blue3" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.1" />
                            </linearGradient>
                            <linearGradient id="soft-white2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#f0f9ff" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </section>

            {/* Nimbus Overview */}

            <section 
                id="main-content" 
                className={`min-h-screen relative flex flex-col items-center pt-16 pb-32`}
                style={{
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(5px)',
                    transition: 'all 800ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    pointerEvents: showContent ? 'auto' : 'none'
                }}
            > 

                <div className="flex items-center flex-col mt-16 px-8 md:px-16 lg:px-24"> 
                    <h2 className="md:text-5xl font-bold text-white mb-2 leading-tight">Do you have a question?</h2>
                    <p className="md:text-2xl text-white mb-16">Nimbus is here to help</p>
                    <div className="flex flex-row justify-center w-full">
                        <input className="border border-white/30 bg-white/10 backdrop-blur-xl w-[100%] px-4 py-2 rounded-full text-white placeholder-white/60 shadow-lg focus:outline-none focus:border-white/50 transition-all duration-300" placeholder="Search mental health topics..." />
                    </div>
                    
                </div>

                <h2 className="mt-32 md:text-5xl font-bold ">Latest Discussions</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 md:px-16 lg:px-24 mt-16">
                    <Discussions 
                        category="Mental Health"
                        title="How to manage anxiety?"
                        description="Looking for tips and strategies to cope with anxiety."
                        profileImageUrl="home/person1.jpg"
                        authorName="John Doe"
                        timestamp="2 hours ago"
                        commentsCount={5}
                    />
                    <Discussions 
                        category="Mental Health"
                        title="How to manage anxiety?"
                        description="Looking for tips and strategies to cope with anxiety."
                        profileImageUrl="home/person2.jpg"
                        authorName="John Doe"
                        timestamp="2 hours ago"
                        commentsCount={5}
                    />
                    <Discussions 
                        category="Mental Health"
                        title="How to manage anxiety?"
                        description="Looking for tips and strategies to cope with anxiety."
                        profileImageUrl="home/person3.jpg"
                        authorName="John Doe"
                        timestamp="2 hours ago"
                        commentsCount={5}
                    />
                    <Discussions 
                        category="Mental Health"
                        title="How to manage anxiety?"
                        description="Looking for tips and strategies to cope with anxiety."
                        profileImageUrl="home/person1.jpg"
                        authorName="John Doe"
                        timestamp="2 hours ago"
                        commentsCount={5}
                    />
                    <Discussions 
                        category="Mental Health"
                        title="How to manage anxiety?"
                        description="Looking for tips and strategies to cope with anxiety."
                        profileImageUrl="home/person2.jpg"
                        authorName="John Doe"
                        timestamp="2 hours ago"
                        commentsCount={5}
                    />
                    <Discussions 
                        category="Mental Health"
                        title="How to manage anxiety?"
                        description="Looking for tips and strategies to cope with anxiety."
                        profileImageUrl="home/person3.jpg"
                        authorName="John Doe"
                        timestamp="2 hours ago"
                        commentsCount={5}
                    />
                </div>



            
            </section>

            {/** testimonila section */}

            <section className="pb-32">
                <div className="flex flex-col items-center justify-center px-8 md:px-16 lg:px-24"> 

                    <h2 className="md:text-5xl font-bold text-white mb-2 leading-tight">Stories of Hope</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"> 
                        <Testimonial 
                            profileImageUrl="home/person1.jpg"
                            authorName="Jane Smith"
                            content="Nimbus helped me find the support I needed during tough times. I'm grateful for this community."
                        />
                        <Testimonial 
                            profileImageUrl="home/person2.jpg"
                            authorName="Mike Johnson"
                            content="The resources and discussions on Nimbus have been invaluable in my journey to mental wellness."
                        />
                        <Testimonial 
                            profileImageUrl="home/person3.jpg"
                            authorName="Mike Johnson"
                            content="The resources and discussions on Nimbus have been invaluable in my journey to mental wellness."
                        />
                    </div>


                </div>
            </section>

            {/** booking stufff */}

            <section className="pb-32"> 
                <div className="flex flex-col items-center justify-center px-8 md:px-16 lg:px-24"> 
                    <h2 className="md:text-5xl font-bold text-white mb-2 leading-tight">Still need more help?</h2>
                    <p className="text-white font-semibold">Connect with a professional counselor</p>
                    <button className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold rounded-full border border-white/30 shadow-2xl shadow-black/20 transition-all duration-300 drop-shadow-lg">Book an appointmentr with us now
                    </button>
                </div>
             </section>
        </div>
        
        {/* Mental Health Popup with delayed fade-in */}
        {showPopup && <MentalHealthPopup />}
        </>
    );
}

export default Home;
