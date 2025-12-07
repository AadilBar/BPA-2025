import Discussions from "../components/home/discussions";
import Testimonial from "../components/home/testimonials";
function Home() {
    return (
        <div style={{
            background: 'linear-gradient(180deg, #0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)'
        }}>
            {/* Landing Section */}
            <section className="h-screen relative flex items-start">
                {/* Title + Button */}
                <div className="mt-24 z-10 px-8 md:px-16 lg:px-24 w-full">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                        Struggling?<br />
                        Your Journey of<br />
                        Healing Starts Here
                    </h1>
                    <button className="absolute bottom-64 right-32 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold rounded-full border border-white/30 shadow-2xl shadow-black/20 transition-all duration-300 drop-shadow-lg">
                        Enter Safe Space →
                    </button>
                </div>

                {/* Wavy transition at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 z-20">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M0,50 C300,100 500,0 600,30 C700,60 900,100 1200,50 L1200,120 L0,120 Z" 
                              fill="url(#wave-gradient)" opacity="0.8"/>
                        <path d="M0,70 C300,20 500,110 600,80 C700,50 900,0 1200,70 L1200,120 L0,120 Z" 
                              fill="url(#wave-gradient2)" opacity="0.6"/>
                        <defs>
                            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#9D7BA8" />
                                <stop offset="100%" stopColor="#6A1E55" />
                            </linearGradient>
                            <linearGradient id="wave-gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#B89DC0" />
                                <stop offset="100%" stopColor="#8B5A8E" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </section>

            {/* Nimbus Overview */}

            <section className="min-h-screen relative flex flex-col items-center pt-16 pb-32"> 

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
    );
}

export default Home;
