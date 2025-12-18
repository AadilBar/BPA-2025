import { useState, useEffect } from 'react';

interface Article {
    title: string;
    source: string;
    year: string;
    summary: string;
}

interface Definition {
    word: string;
    partOfSpeech: string;
    definition: string;
}

interface Tile {
    id: number;
    title: string;
    content: string;
    loading: boolean;
    width: string;
    height: string;
    articles?: Article[];
    definitions?: Definition[];
}

function Nimbus() {
    const [searchQuery, setSearchQuery] = useState('');
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [isSearchActive, setIsSearchActive] = useState(false);

    useEffect(() => {
        if (searchQuery.trim()) {
            setIsSearchActive(true);
            // Generate tiles when user starts typing
            const newTiles: Tile[] = [
                { id: 1, title: 'Research Articles', content: '', loading: true, width: 'col-span-2', height: 'h-64', articles: [] },
                { id: 2, title: 'Key Definitions', content: '', loading: true, width: 'col-span-1', height: 'h-48', definitions: [] },
                { id: 3, title: 'Professional Support', content: '', loading: true, width: 'col-span-1', height: 'h-56' },
                { id: 4, title: 'Community Resources', content: '', loading: true, width: 'col-span-2', height: 'h-52' },
                { id: 5, title: 'Self-Care Tips', content: '', loading: true, width: 'col-span-1', height: 'h-60' },
                { id: 6, title: 'Related Topics', content: '', loading: true, width: 'col-span-1', height: 'h-44' },
            ];
            setTiles(newTiles);

            // Debounce the API call to prevent rate limiting
            const debounceTimer = setTimeout(() => {
                // Fetch PubMed articles for the Articles tile
                const fetchPubMedArticles = async () => {
                    try {
                        // Search PubMed for relevant articles
                        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery + ' mental health')}&retmax=5&retmode=json`;
                        const searchResponse = await fetch(searchUrl);
                        const searchData = await searchResponse.json();
                        
                        if (searchData.esearchresult?.idlist?.length > 0) {
                            // Fetch details for the articles
                            const ids = searchData.esearchresult.idlist.join(',');
                            const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
                            const summaryResponse = await fetch(summaryUrl);
                            const summaryData = await summaryResponse.json();
                            
                            const articles: Article[] = searchData.esearchresult.idlist.slice(0, 5).map((id: string) => {
                                const article = summaryData.result[id];
                                return {
                                    title: article.title || 'Untitled',
                                    source: article.source || article.fulljournalname || 'Journal name unavailable',
                                    year: article.pubdate ? article.pubdate.split(' ')[0] : 'Year unavailable',
                                    summary: `This research explores ${searchQuery.toLowerCase()} in the context of mental health and well-being.`
                                };
                            });
                            
                            setTiles(prev => prev.map(t => 
                                t.id === 1 
                                    ? { ...t, loading: false, articles, content: '' }
                                    : t
                            ));
                        } else {
                            setTiles(prev => prev.map(t => 
                                t.id === 1 
                                    ? { ...t, loading: false, content: 'No research articles found for this topic.', articles: [] }
                                    : t
                            ));
                        }
                    } catch (error) {
                        console.error('Error fetching PubMed articles:', error);
                        setTiles(prev => prev.map(t => 
                            t.id === 1 
                                ? { ...t, loading: false, content: 'Unable to load articles at this time.', articles: [] }
                                : t
                        ));
                    }
                };

                fetchPubMedArticles();

                // Fetch word definitions for Key Definitions tile
                const fetchDefinitions = async () => {
                    try {
                        // Filter out common stop words and get important words
                        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'about', 'how', 'what', 'when', 'where', 'who', 'why', 'i', 'my', 'me'];
                        const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.includes(w));
                        
                        if (words.length === 0) {
                            setTiles(prev => prev.map(t => 
                                t.id === 2 
                                    ? { ...t, loading: false, content: 'No key terms found to define.', definitions: [] }
                                    : t
                            ));
                            return;
                        }

                        // Fetch definitions for up to 3 most important words
                        const definitionsPromises = words.slice(0, 3).map(async (word) => {
                            try {
                                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                                if (!response.ok) return null;
                                const data = await response.json();
                                
                                if (data && data[0] && data[0].meanings && data[0].meanings[0]) {
                                    const meaning = data[0].meanings[0];
                                    return {
                                        word: word,
                                        partOfSpeech: meaning.partOfSpeech || '',
                                        definition: meaning.definitions[0]?.definition || 'Definition unavailable'
                                    };
                                }
                                return null;
                            } catch {
                                return null;
                            }
                        });

                        const definitions = (await Promise.all(definitionsPromises)).filter(d => d !== null) as Definition[];
                        
                        if (definitions.length > 0) {
                            setTiles(prev => prev.map(t => 
                                t.id === 2 
                                    ? { ...t, loading: false, definitions, content: '' }
                                    : t
                            ));
                        } else {
                            setTiles(prev => prev.map(t => 
                                t.id === 2 
                                    ? { ...t, loading: false, content: 'Could not find definitions for these terms.', definitions: [] }
                                    : t
                            ));
                        }
                    } catch (error) {
                        console.error('Error fetching definitions:', error);
                        setTiles(prev => prev.map(t => 
                            t.id === 2 
                                ? { ...t, loading: false, content: 'Unable to load definitions at this time.', definitions: [] }
                                : t
                        ));
                    }
                };

                fetchDefinitions();
            }, 800); // Wait 800ms after user stops typing

            // Simulate loading for other tiles with random delays
            newTiles.slice(2).forEach((tile) => {
                const delay = Math.random() * 2000 + 1000; // 1-3 seconds
                setTimeout(() => {
                    setTiles(prev => prev.map(t => 
                        t.id === tile.id 
                            ? { ...t, loading: false, content: `Information about ${t.title.toLowerCase()} based on your search: "${searchQuery}"` }
                            : t
                    ));
                }, delay);
            });

            // Cleanup function to cancel the debounce timer
            return () => clearTimeout(debounceTimer);
        } else {
            setIsSearchActive(false);
            setTiles([]);
        }
    }, [searchQuery]);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Abstract Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F2A] via-[#6A1E55] to-[#D76F86]"></div>
                
                {/* Animated Blobs */}
                <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
                <div className="absolute top-[40%] right-[20%] w-96 h-96 bg-gradient-to-br from-orange-500/30 to-yellow-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[20%] left-[30%] w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
                <div className="absolute top-[60%] right-[40%] w-80 h-80 bg-gradient-to-br from-pink-500/30 to-red-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-6000"></div>
                <div className="absolute bottom-[40%] right-[15%] w-72 h-72 bg-gradient-to-br from-indigo-500/30 to-blue-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-8000"></div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-700 ease-out ${isSearchActive ? 'pt-32' : 'min-h-screen flex flex-col items-center justify-center'}`}>
                {/* Title - only show when search is not active */}
                {!isSearchActive && (
                    <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-12 animate-in fade-in duration-1000">
                        Do you have a question?
                    </h1>
                )}

                {/* Search Bar */}
                <div className={`transition-all duration-700 ease-out ${isSearchActive ? 'w-full max-w-3xl px-8' : 'w-full max-w-2xl px-8'}`}>
                    <div className="relative overflow-hidden bg-white/15 backdrop-blur-2xl rounded-full border border-white/30 shadow-2xl">
                        <div
                            className="pointer-events-none absolute inset-[-12px] opacity-50 mix-blend-screen blur-2xl bg-[conic-gradient(at_30%_30%,#ffffff60,#7ed6ff45,#ffffff20,#abc6ff60,#ffffff60)] animate-[spin_20s_linear_infinite]"
                            aria-hidden
                        />
                        <div className="relative flex items-center px-6 py-4">
                            <svg className="h-6 w-6 text-white/70 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Ask Nimbus anything about mental health..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-white text-lg placeholder-white/50 focus:outline-none font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Tiles Container */}
                {isSearchActive && (
                    <div className="w-full max-w-7xl px-8 mt-12 pb-12">
                        <div className="grid grid-cols-3 gap-6 auto-rows-auto">
                            {tiles.map((tile, index) => (
                                <div
                                    key={tile.id}
                                    className={`${tile.width} ${tile.height} animate-in fade-in zoom-in-95 duration-500`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="relative h-full overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 hover:bg-white/15 transition-all duration-300">
                                        <div
                                            className="pointer-events-none absolute inset-[-12px] opacity-40 mix-blend-screen blur-xl bg-[conic-gradient(at_30%_30%,#ffffff40,#7ed6ff35,#ffffff20,#abc6ff40,#ffffff40)] animate-[spin_25s_linear_infinite]"
                                            aria-hidden
                                        />
                                        <div className="relative h-full flex flex-col">
                                            <h3 className="text-xl font-bold text-white mb-4">{tile.title}</h3>
                                            
                                            {tile.loading ? (
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className="flex gap-2">
                                                        <div className="w-3 h-3 bg-white/70 rounded-full animate-bounce"></div>
                                                        <div className="w-3 h-3 bg-white/70 rounded-full animate-bounce animation-delay-200"></div>
                                                        <div className="w-3 h-3 bg-white/70 rounded-full animate-bounce animation-delay-400"></div>
                                                    </div>
                                                </div>
                                            ) : tile.articles && tile.articles.length > 0 ? (
                                                <div className="flex-1 overflow-y-auto space-y-4 animate-in fade-in duration-500 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                                                    {tile.articles.map((article, idx) => (
                                                        <div key={idx} className="border-b border-white/10 pb-3 last:border-0">
                                                            <h4 className="text-sm font-semibold text-white leading-tight mb-1">
                                                                {article.title}
                                                            </h4>
                                                            <p className="text-xs text-white/60 mb-1">
                                                                {article.source} • {article.year}
                                                            </p>
                                                            <p className="text-xs text-white/70 leading-relaxed">
                                                                {article.summary}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : tile.definitions && tile.definitions.length > 0 ? (
                                                <div className="flex-1 overflow-y-auto space-y-3 animate-in fade-in duration-500 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                                                    {tile.definitions.map((def, idx) => (
                                                        <div key={idx} className="border-b border-white/10 pb-3 last:border-0">
                                                            <div className="flex items-baseline gap-2 mb-1">
                                                                <h4 className="text-base font-bold text-white capitalize">
                                                                    {def.word}
                                                                </h4>
                                                                <span className="text-xs text-white/50 italic">
                                                                    {def.partOfSpeech}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-white/80 leading-relaxed">
                                                                {def.definition}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-white/80 text-sm leading-relaxed animate-in fade-in duration-500">
                                                    {tile.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Nimbus;
