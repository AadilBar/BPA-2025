function Resources() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-8">
                    Resources
                </h1>
                <p className="text-white/80 text-center text-lg mb-12 max-w-2xl mx-auto">
                    Helpful resources for mental health and wellbeing
                </p>
                
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="space-y-6">
                        <div className="text-white/90">
                            <p className="text-lg">
                                Explore our curated collection of mental health resources.
                            </p>
                        </div>
                        
                        {/* Placeholder for resources content */}
                        <div className="bg-white/5 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
                            <p className="text-white/60 text-center">
                                Resources content coming soon...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Resources;
