import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Discussions from "../components/home/discussions";
import MentalHealthPopup from "../components/MentalHealthPopup";
import tsplanding from '../assets/tsplanding.png';
import person1 from '../assets/people/pexels-creationhill-1681010.jpg';
import person2 from '../assets/people/pexels-olly-733872.jpg';
import person3 from '../assets/people/pexels-olly-774095.jpg';

function Home() {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    // Check if user has seen the popup before
    const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');

    // Initial page fade-in and setup
    useEffect(() => {
        setPageLoaded(true);
        
        // Show popup after delay only if never seen before
        if (!hasSeenPopup) {
            const popupTimer = setTimeout(() => {
                setShowPopup(true);
            }, 2000);
            
            return () => clearTimeout(popupTimer);
        }
    }, []);

    // Remove forced immediate scrollTo — keep original transition logic to control landing

    const triggerTransition = () => {
        if (isTransitioning) return;
        
        // Start transition immediately
        setIsTransitioning(true);
        
        // Show content earlier to avoid blank screen
        setTimeout(() => {
            setShowContent(true);
            setIsTransitioning(false);
            // Mark that user has visited home
            sessionStorage.setItem('hasVisitedHome', 'true');
            // Immediately scroll to top when transition completes
            window.scrollTo(0, 0);
        }, 400);
    };

    const reverseTransition = () => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        
        setTimeout(() => {
            setShowContent(false);
            setIsTransitioning(false);
            setHasScrolled(false);
        }, 400);
    };

    const scrollToContent = () => {
        // If content is not shown yet, trigger transition first
        if (!showContent) {
            triggerTransition();
        } else {
            // If already shown, just scroll to it
            const contentSection = document.getElementById('main-content');
            if (contentSection) {
                contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Detect scroll direction and trigger/reverse transition
    useEffect(() => {
        let lastScrollY = 0;

        const handleWheel = (e: WheelEvent) => {
            // Only react to trusted (user-generated) wheel events to avoid programmatic/autoplay triggers
            if (!e.isTrusted) return;
            
            const scrollingDown = e.deltaY > 0;
            
            if (scrollingDown && !showContent && !isTransitioning && !hasScrolled) {
                // Scrolling down from landing -> trigger transition
                e.preventDefault();
                setHasScrolled(true);
                triggerTransition();
            } else if (!scrollingDown && showContent && !isTransitioning && window.scrollY === 0) {
                // Scrolling up at top of content -> reverse back to landing
                e.preventDefault();
                reverseTransition();
            }
        };

        const handleTouch = (e: TouchEvent) => {
            // Only react to trusted (user) touch events
            if (!e.isTrusted) return;
            
            // Determine scroll direction from touch
            const touch = e.touches[0];
            if (!touch) return;
            
            const currentY = touch.clientY;
            const scrollingDown = lastScrollY > currentY;
            lastScrollY = currentY;
            
            if (scrollingDown && !showContent && !isTransitioning && !hasScrolled) {
                e.preventDefault();
                setHasScrolled(true);
                triggerTransition();
            } else if (!scrollingDown && showContent && !isTransitioning && window.scrollY === 0) {
                e.preventDefault();
                reverseTransition();
            }
        };

        // Listen for direct user inputs: wheel and touchstart/touchmove
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouch, { passive: false });
        window.addEventListener('touchmove', handleTouch, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouch);
            window.removeEventListener('touchmove', handleTouch);
        };
    }, [showContent, isTransitioning, hasScrolled]);

    // NOTE: Removed delayed scrollTo effect - now happens instantly when transition completes inside triggerTransition()
    // This was causing the page to auto-scroll even when the user didn't initiate it.

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
            {/* Landing Section - show during transition even if showContent is true for reverse animation */}
            <section 
                className={`min-h-screen flex items-center justify-center overflow-hidden ${showContent && !isTransitioning ? 'hidden' : ''}`}
                style={{
                    position: showContent && !isTransitioning ? 'relative' : 'fixed',
                    top: showContent && !isTransitioning ? undefined : 0,
                    left: showContent && !isTransitioning ? undefined : 0,
                    right: showContent && !isTransitioning ? undefined : 0,
                    bottom: showContent && !isTransitioning ? undefined : 0,
                    zIndex: showContent && !isTransitioning ? undefined : 50,
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
                    className={`z-10 px-4 sm:px-8 md:px-16 lg:px-24 text-center max-w-5xl`}
                    style={{
                        opacity: isTransitioning ? 0 : 1,
                        transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
                        transition: 'all 900ms cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                >
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-4 sm:mb-6 md:mb-8 leading-tight drop-shadow-2xl tracking-tight">
                        #RiseAbove
                    </h1>
                    
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white/95 mb-8 sm:mb-12 md:mb-16 leading-relaxed font-semibold px-2">
                        Join thousands of others who have overcome their fears
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-2">
                        <button 
                            onClick={() => navigate('/counseling')}
                            className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white/25 hover:bg-white/35 backdrop-blur-xl text-white font-bold text-base sm:text-lg rounded-full border border-white/40 shadow-2xl shadow-black/20 transition-all duration-300 drop-shadow-lg hover:scale-105"
                        >
                            Get Support
                        </button>
                        <button 
                            onClick={scrollToContent}
                            className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-semibold text-base sm:text-lg rounded-full border border-white/30 shadow-xl transition-all duration-300 hover:scale-105"
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

            {/* Main Content - Now positioned after landing section */}
            <section 
                id="main-content" 
                className="relative flex flex-col items-center pb-32"
                style={{
                    background: 'radial-gradient(ellipse at 20% 10%, #0A0F2A 0%, #6A1E55 35%, #D76F86 65%, #FFA54C 95%), linear-gradient(155deg, #0A0F2A 0%, #5A1648 40%, #C86080 70%, #FF954A 100%)',
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 800ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    pointerEvents: showContent ? 'auto' : 'none'
                }}
            > 
                {/* Testimonials Section - Full Width Stories */}
                <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24 relative space-y-20 sm:space-y-28 md:space-y-40">
                    {/* Story 1 - Image Left */}
                    <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-[1600px] mx-auto">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
                                <img 
                                    src={person1} 
                                    alt="Sarah's Journey" 
                                    className="relative z-10 w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] object-cover rounded-2xl sm:rounded-3xl shadow-2xl"
                                />
                            </div>
                            <div className="relative space-y-4 sm:space-y-6">
                                {/* Floating quote decoration */}
                                <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 text-white/10 text-7xl sm:text-[100px] md:text-[120px] font-serif leading-none">"</div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">Mike's Journey</h3>
                                <div className="h-1 w-16 sm:w-20 md:w-24 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mb-4 sm:mb-6"></div>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    For years, I battled with depression that felt like an endless darkness. Some days, getting out of bed seemed impossible. I felt completely alone in my struggle.
                                </p>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    Finding Nimbus changed everything. The community welcomed me with open arms, and through their support and the professional counseling I found here, I slowly began to see light again.
                                </p>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    Today, I'm not just surviving—I'm thriving. I've learned to manage my mental health, and I'm passionate about helping others who are going through what I experienced. Recovery is possible.
                                </p>
                                <p className="text-white/70 text-sm sm:text-base md:text-lg font-semibold mt-6 sm:mt-8 italic flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                    </svg>
                                    Mike B., 2 years on her journey
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Story 2 - Image Right */}
                    <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-[1600px] mx-auto">
                            <div className="relative order-2 lg:order-1 space-y-4 sm:space-y-6">
                                {/* Floating quote decoration */}
                                <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 text-white/10 text-7xl sm:text-[100px] md:text-[120px] font-serif leading-none">"</div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">Sarah's Recovery</h3>
                                <div className="h-1 w-16 sm:w-20 md:w-24 bg-gradient-to-r from-blue-400 to-sky-500 rounded-full mb-4 sm:mb-6"></div>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    My addiction to substances nearly cost me everything—my family, my career, my life. I hit rock bottom and didn't know if I could ever climb back up.
                                </p>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    Through Nimbus, I connected with others who understood my pain without judgment. The resources here pointed me toward professional treatment, and the community kept me accountable during my darkest moments.
                                </p>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    I've been clean for 18 months now. I've rebuilt relationships with my family and found purpose in mentoring others in recovery. Every day is a choice, and Nimbus helps me make the right one.
                                </p>
                                <p className="text-white/70 text-sm sm:text-base md:text-lg font-semibold mt-6 sm:mt-8 italic flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                    </svg>
                                    Sarah R., 18 months sober
                                </p>
                            </div>
                            <div className="relative order-1 lg:order-2">
                                
                                <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/20 to-sky-500/20 rounded-full blur-3xl"></div>
                                <img 
                                    src={person2} 
                                    alt="Michael's Recovery" 
                                    className="relative z-10 w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] object-cover rounded-2xl sm:rounded-3xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Story 3 - Image Left */}
                    <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-[1600px] mx-auto">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-300/20 to-blue-600/20 rounded-full blur-3xl"></div>
                                <img 
                                    src={person3} 
                                    alt="Jessica's Transformation" 
                                    className="relative z-10 w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] object-cover rounded-2xl sm:rounded-3xl shadow-2xl"
                                />
                            </div>
                            <div className="relative space-y-4 sm:space-y-6">
                                {/* Floating quote decoration */}
                                <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 text-white/10 text-7xl sm:text-[100px] md:text-[120px] font-serif leading-none">"</div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">Jessica's Transformation</h3>
                                <div className="h-1 w-16 sm:w-20 md:w-24 bg-gradient-to-r from-sky-300 to-blue-600 rounded-full mb-4 sm:mb-6"></div>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    Anxiety controlled my life for so long. Panic attacks would strike without warning, keeping me isolated and afraid to leave my home. I felt trapped in my own mind.
                                </p>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    Nimbus gave me the courage to seek help. The forum discussions taught me I wasn't alone, and the professional counselors here gave me tools to manage my anxiety effectively.
                                </p>
                                <p className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                                    Now I'm living life on my terms. I travel, I've made new friends, and I even started my own business. The anxiety hasn't disappeared, but I've learned to live alongside it rather than letting it control me.
                                </p>
                                <p className="text-white/70 text-sm sm:text-base md:text-lg font-semibold mt-6 sm:mt-8 italic flex items-center gap-2">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                    </svg>
                                    Jessica L., reclaiming her life
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Combined Discussions & Help Section */}
                <div className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
                    <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
                        {/* Left: Discussions */}
                        <div className="space-y-6 sm:space-y-8">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Latest Discussions</h2>
                            
                            <div className="space-y-4 sm:space-y-6">
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
                                    category="Support"
                                    title="Dealing with stress at work"
                                    description="Anyone else struggling with work-life balance?"
                                    profileImageUrl="home/person2.jpg"
                                    authorName="Jane Smith"
                                    timestamp="5 hours ago"
                                    commentsCount={12}
                                />
                                <Discussions 
                                    category="Wellness"
                                    title="Meditation tips for beginners"
                                    description="Starting my mindfulness journey, any advice?"
                                    profileImageUrl="home/person3.jpg"
                                    authorName="Mike Johnson"
                                    timestamp="1 day ago"
                                    commentsCount={8}
                                />
                            </div>

                            <button 
                                onClick={() => navigate('/forum')}
                                className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white/15 hover:bg-white/25 backdrop-blur-xl text-white font-bold text-base sm:text-lg rounded-full border border-white/30 shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                View More Discussions
                            </button>
                        </div>

                        {/* Right: Need Help */}
                        <div className="lg:sticky lg:top-24">
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 border border-white/20 shadow-2xl h-full flex flex-col justify-center items-center text-center space-y-4 sm:space-y-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                    </svg>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Still need more help?</h2>
                                <p className="text-white/80 text-sm sm:text-base md:text-lg">Connect with a professional counselor who can provide personalized support</p>
                                <button 
                                    onClick={() => navigate('/counseling')}
                                    className="px-8 sm:px-10 md:px-12 py-4 sm:py-5 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white font-bold text-base sm:text-lg rounded-full border border-white/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:scale-105"
                                >
                                    Book an appointment now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
        {/* Mental Health Popup with delayed fade-in */}
        {showPopup && <MentalHealthPopup />}
        </>
    );
}

export default Home;
