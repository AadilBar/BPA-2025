import { useState, useEffect } from 'react';

function SearchButton() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle keyboard shortcuts for search
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

    return (
        <>
            {/* Spotlight Search Modal */}
            {isSearchOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] animate-in fade-in duration-200"
                        onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                        }}
                    />
                    
                    {/* Spotlight Search Box */}
                    <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[1000] animate-in zoom-in-95 fade-in duration-200">
                        <div className="relative overflow-hidden bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl">
                            <div
                                className="pointer-events-none absolute inset-[-12px] opacity-50 mix-blend-screen blur-2xl bg-[conic-gradient(at_30%_30%,#ffffff60,#7ed6ff45,#ffffff20,#abc6ff60,#ffffff60)] animate-[spin_20s_linear_infinite]"
                                aria-hidden
                            />
                            
                            {/* Search Input */}
                            <div className="relative flex items-center px-6 py-5 border-b border-white/20">
                                <svg className="h-6 w-6 text-white/70 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Ask Nimbus anything..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-white text-lg placeholder-white/50 focus:outline-none font-medium"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="text-white/70 hover:text-white focus:outline-none transition-all duration-200 ml-4 px-3 py-1 bg-white/10 rounded-lg text-sm font-semibold"
                                >
                                    ESC
                                </button>
                            </div>
                            
                            {/* Search Results */}
                            <div className="relative px-6 py-4 max-h-96 overflow-y-auto">
                                {searchQuery ? (
                                    <div className="space-y-2">
                                        <div className="text-white/60 text-sm mb-3">Results for "{searchQuery}"</div>
                                        {/* Placeholder results */}
                                        <div className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer">
                                            <div className="text-white font-semibold">Sample Result 1</div>
                                            <div className="text-white/60 text-sm mt-1">This is a placeholder result...</div>
                                        </div>
                                        <div className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer">
                                            <div className="text-white font-semibold">Sample Result 2</div>
                                            <div className="text-white/60 text-sm mt-1">This is another placeholder result...</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-white/50 text-center py-8">
                                        Type to search...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Floating Search Button - Bottom Right */}
            <button
                onClick={() => setIsSearchOpen(true)}
                className="fixed bottom-8 right-8 z-50 overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-4 shadow-2xl shadow-black/30 text-white/90 hover:text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 group"
                aria-label="Open Nimbus search"
            >
                <span
                    className="pointer-events-none absolute inset-[-10px] opacity-60 mix-blend-screen blur-xl bg-[conic-gradient(at_40%_40%,#ffffff80,#7ed6ff55,#ffffff30,#abc6ff70,#ffffff80)] animate-[spin_14s_linear_infinite]"
                    aria-hidden
                />
                <svg className="h-6 w-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Ask Nimbus
                </div>
            </button>
        </>
    );
}

export default SearchButton;
