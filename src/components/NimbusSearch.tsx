import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

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

interface Forum {
    id: string;
    title: string;
    content: string;
    category: string;
    replies: number;
    likes: number;
    views: number;
    lastActive: string;
    author: string;
    authorAvatar: string;
}

interface Counselor {
    name: string;
    specialty: string;
    availability: string;
    description: string;
}

interface RelatedTopic {
    topic: string;
    query: string;
}

interface Helpline {
    name: string;
    number: string;
    description: string;
    availability: string;
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
    forums?: Forum[];
    counselors?: Counselor[];
    relatedTopics?: RelatedTopic[];
    helplines?: Helpline[];
}

interface NimbusSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
}

function NimbusSearch({ searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen }: NimbusSearchProps) {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (searchQuery.trim()) {
            setIsSearchActive(true);
            // Generate tiles when user starts typing
            const newTiles: Tile[] = [
                { id: 1, title: 'Research Articles', content: '', loading: true, width: 'col-span-3', height: 'h-72', articles: [] },
                { id: 2, title: 'Key Definitions', content: '', loading: true, width: 'col-span-2', height: 'h-72', definitions: [] },
                { id: 3, title: 'Professional Support', content: '', loading: true, width: 'col-span-2', height: 'h-56', counselors: [] },
                { id: 4, title: 'Relevant Forums', content: '', loading: true, width: 'col-span-3', height: 'h-56', forums: [] },
                { id: 5, title: 'Helplines', content: '', loading: true, width: 'col-span-3', height: 'h-64', helplines: [] },
                { id: 6, title: 'Related Topics', content: '', loading: true, width: 'col-span-2', height: 'h-64', relatedTopics: [] },
            ];
            setTiles(newTiles);

            // Debounce the API call to prevent rate limiting
            const debounceTimer = setTimeout(() => {
                // Fetch PubMed articles
                const fetchPubMedArticles = async () => {
                    try {
                        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery + ' mental health')}&retmax=5&retmode=json`;
                        const searchResponse = await fetch(searchUrl);
                        const searchData = await searchResponse.json();
                        
                        if (searchData.esearchresult?.idlist?.length > 0) {
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
                                t.id === 1 ? { ...t, loading: false, articles, content: '' } : t
                            ));
                        } else {
                            setTiles(prev => prev.map(t => 
                                t.id === 1 ? { ...t, loading: false, content: 'No research articles found for this topic.', articles: [] } : t
                            ));
                        }
                    } catch (error) {
                        console.error('Error fetching PubMed articles:', error);
                        setTiles(prev => prev.map(t => 
                            t.id === 1 ? { ...t, loading: false, content: 'Unable to load articles at this time.', articles: [] } : t
                        ));
                    }
                };

                // Fetch definitions
                const fetchDefinitions = async () => {
                    try {
                        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'about', 'how', 'what', 'when', 'where', 'who', 'why', 'i', 'my', 'me'];
                        const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.includes(w));
                        
                        if (words.length === 0) {
                            setTiles(prev => prev.map(t => 
                                t.id === 2 ? { ...t, loading: false, content: 'No key terms found to define.', definitions: [] } : t
                            ));
                            return;
                        }

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
                                t.id === 2 ? { ...t, loading: false, definitions, content: '' } : t
                            ));
                        } else {
                            setTiles(prev => prev.map(t => 
                                t.id === 2 ? { ...t, loading: false, content: 'Could not find definitions for these terms.', definitions: [] } : t
                            ));
                        }
                    } catch (error) {
                        console.error('Error fetching definitions:', error);
                        setTiles(prev => prev.map(t => 
                            t.id === 2 ? { ...t, loading: false, content: 'Unable to load definitions at this time.', definitions: [] } : t
                        ));
                    }
                };

                fetchPubMedArticles();
                fetchDefinitions();

                // Fetch relevant forums from Firebase
                const fetchForums = async () => {
                    try {
                        const forumRef = collection(db, 'forum');
                        const q = query(forumRef, orderBy('createdAt', 'desc'), limit(20));
                        const querySnapshot = await getDocs(q);
                        
                        // Map all discussions from Firebase
                        const allForums: Forum[] = querySnapshot.docs.map(doc => {
                            const data = doc.data();
                            const createdAt = data.createdAt?.toDate();
                            const timeAgo = createdAt ? getTimeAgo(createdAt) : 'just now';
                            
                            return {
                                id: doc.id,
                                title: data.title || 'Untitled',
                                content: data.content || '',
                                category: data.category || 'General',
                                replies: data.replies || 0,
                                likes: data.likes || 0,
                                views: data.views || 0,
                                lastActive: timeAgo,
                                author: data.authorDisplayName || 'Anonymous',
                                authorAvatar: data.authorProfilePic || ''
                            };
                        });
                        
                        // Filter forums based on search query
                        const q_lower = searchQuery.toLowerCase();
                        const relevantForums = allForums.filter(forum => {
                            const titleMatch = forum.title.toLowerCase().includes(q_lower);
                            const contentMatch = forum.content.toLowerCase().includes(q_lower);
                            const categoryMatch = forum.category.toLowerCase().includes(q_lower);
                            const tags = (querySnapshot.docs.find(doc => doc.id === forum.id)?.data().tags || []) as string[];
                            const tagsMatch = tags.some((tag: string) => tag.toLowerCase().includes(q_lower));
                            return titleMatch || contentMatch || categoryMatch || tagsMatch;
                        });
                        
                        // Take top 5 relevant forums, or show all forums if no matches
                        const forumsToShow = relevantForums.length > 0 
                            ? relevantForums.slice(0, 5) 
                            : allForums.slice(0, 5);
                        
                        if (forumsToShow.length > 0) {
                            setTiles(prev => prev.map(t => 
                                t.id === 4 ? { ...t, loading: false, forums: forumsToShow, content: '' } : t
                            ));
                        } else {
                            setTiles(prev => prev.map(t => 
                                t.id === 4 ? { ...t, loading: false, forums: [], content: 'No forum discussions found.' } : t
                            ));
                        }
                    } catch (error) {
                        console.error('Error fetching forums:', error);
                        setTiles(prev => prev.map(t => 
                            t.id === 4 ? { ...t, loading: false, forums: [], content: 'Unable to load forum discussions.' } : t
                        ));
                    }
                };
                
                // Helper function to calculate time ago (same as forum page)
                const getTimeAgo = (date: Date): string => {
                    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
                    
                    const intervals: { [key: string]: number } = {
                        year: 31536000,
                        month: 2592000,
                        week: 604800,
                        day: 86400,
                        hour: 3600,
                        minute: 60
                    };
                    
                    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
                        const interval = Math.floor(seconds / secondsInUnit);
                        if (interval >= 1) {
                            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
                        }
                    }
                    
                    return 'just now';
                };
                
                fetchForums();

                // Fetch recommended counselors (placeholder for now)
                const fetchCounselors = () => {
                    setTimeout(() => {
                        const placeholderCounselors: Counselor[] = [
                            {
                                name: 'Dr. Sarah Mitchell',
                                specialty: 'Anxiety & Stress Management',
                                availability: 'Available today',
                                description: `Specializes in helping clients manage ${searchQuery.toLowerCase()} through evidence-based therapies.`
                            },
                            {
                                name: 'Dr. James Chen',
                                specialty: 'Cognitive Behavioral Therapy',
                                availability: 'Next available: Tomorrow',
                                description: `Expert in treating ${searchQuery.toLowerCase()} with proven CBT techniques.`
                            }
                        ];
                        
                        setTiles(prev => prev.map(t => 
                            t.id === 3 ? { ...t, loading: false, counselors: placeholderCounselors, content: '' } : t
                        ));
                    }, 1000);
                };
                
                fetchCounselors();

                // Fetch related topics (placeholder for now)
                const fetchRelatedTopics = () => {
                    setTimeout(() => {
                        const words = searchQuery.toLowerCase().split(/\s+/);
                        const mainKeyword = words[0] || searchQuery;
                        
                        const placeholderTopics: RelatedTopic[] = [
                            { topic: `${searchQuery} treatment options`, query: `${searchQuery} treatment options` },
                            { topic: `${searchQuery} coping strategies`, query: `${searchQuery} coping strategies` },
                            { topic: `${searchQuery} symptoms`, query: `${searchQuery} symptoms` },
                            { topic: `${mainKeyword} therapy`, query: `${mainKeyword} therapy` },
                            { topic: `managing ${searchQuery}`, query: `managing ${searchQuery}` },
                            { topic: `${searchQuery} prevention`, query: `${searchQuery} prevention` }
                        ];
                        
                        setTiles(prev => prev.map(t => 
                            t.id === 6 ? { ...t, loading: false, relatedTopics: placeholderTopics, content: '' } : t
                        ));
                    }, 1500);
                };
                
                fetchRelatedTopics();

                // Fetch relevant helplines based on search keywords
                const fetchHelplines = () => {
                    setTimeout(() => {
                        const query = searchQuery.toLowerCase();
                        const helplines: Helpline[] = [];

                        // Suicide/Crisis keywords
                        if (query.includes('suicid') || query.includes('crisis') || query.includes('self harm') || query.includes('self-harm')) {
                            helplines.push({
                                name: 'National Suicide Prevention Lifeline',
                                number: '988',
                                description: '24/7 free and confidential support for people in distress.',
                                availability: '24/7'
                            });
                            helplines.push({
                                name: 'Crisis Text Line',
                                number: 'Text HOME to 741741',
                                description: 'Free, 24/7 support for those in crisis via text message.',
                                availability: '24/7'
                            });
                        }

                        // Substance abuse keywords
                        if (query.includes('drug') || query.includes('alcohol') || query.includes('substance') || query.includes('addiction')) {
                            helplines.push({
                                name: 'SAMHSA National Helpline',
                                number: '1-800-662-4357',
                                description: 'Treatment referral and information service for substance abuse.',
                                availability: '24/7'
                            });
                        }

                        // Domestic violence keywords
                        if (query.includes('abuse') || query.includes('domestic') || query.includes('violence')) {
                            helplines.push({
                                name: 'National Domestic Violence Hotline',
                                number: '1-800-799-7233',
                                description: 'Support for victims and survivors of domestic violence.',
                                availability: '24/7'
                            });
                        }

                        // Eating disorder keywords
                        if (query.includes('eating') || query.includes('anorexia') || query.includes('bulimia')) {
                            helplines.push({
                                name: 'NEDA Helpline',
                                number: '1-800-931-2237',
                                description: 'National Eating Disorders Association support line.',
                                availability: 'Mon-Thu 9am-9pm ET, Fri 9am-5pm ET'
                            });
                        }

                        // Veterans keywords
                        if (query.includes('veteran') || query.includes('military') || query.includes('ptsd')) {
                            helplines.push({
                                name: 'Veterans Crisis Line',
                                number: '988 then Press 1',
                                description: 'Confidential support for Veterans and their families.',
                                availability: '24/7'
                            });
                        }

                        // General mental health - always show these
                        if (helplines.length === 0) {
                            helplines.push({
                                name: 'National Suicide Prevention Lifeline',
                                number: '988',
                                description: '24/7 free and confidential support for people in distress.',
                                availability: '24/7'
                            });
                        }

                        helplines.push({
                            name: 'NAMI HelpLine',
                            number: '1-800-950-6264',
                            description: 'Information, resource referrals and support for mental health.',
                            availability: 'Mon-Fri 10am-10pm ET'
                        });

                        // Limit to 4 helplines max
                        const limitedHelplines = helplines.slice(0, 4);
                        
                        setTiles(prev => prev.map(t => 
                            t.id === 5 ? { ...t, loading: false, helplines: limitedHelplines, content: '' } : t
                        ));
                    }, 900);
                };
                
                fetchHelplines();

                // Simulate loading for other tiles
                newTiles.slice(2).forEach((tile) => {
                    // Skip tile 3 (counselors), tile 4 (forums), tile 5 (helplines), and tile 6 (related topics) as they have their own fetch logic
                    if (tile.id === 3 || tile.id === 4 || tile.id === 5 || tile.id === 6) return;
                    
                    const delay = Math.random() * 2000 + 1000;
                    setTimeout(() => {
                        setTiles(prev => prev.map(t => 
                            t.id === tile.id 
                                ? { ...t, loading: false, content: `Information about ${t.title.toLowerCase()} based on your search: "${searchQuery}"` }
                                : t
                        ));
                    }, delay);
                });
            }, 800);

            return () => clearTimeout(debounceTimer);
        } else {
            setIsSearchActive(false);
            setTiles([]);
        }
    }, [searchQuery]);

    if (!isSearchOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] animate-in fade-in duration-200"
                onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                }}
            />
            
            {/* Search Container */}
            <div className={`fixed left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[999] transition-all duration-700 ease-out ${isSearchActive ? 'top-[10%]' : 'top-[40%]'}`}>
                {/* Search Box */}
                <div className="relative overflow-hidden bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl mb-6 animate-in zoom-in-95 fade-in duration-200 mx-auto max-w-4xl">
                    <div
                        className="pointer-events-none absolute inset-[-12px] opacity-50 mix-blend-screen blur-2xl bg-[conic-gradient(at_30%_30%,#ffffff60,#7ed6ff45,#ffffff20,#abc6ff60,#ffffff60)] animate-[spin_20s_linear_infinite]"
                        aria-hidden
                    />
                    <div className="relative flex items-center px-6 py-5">
                        <svg className="h-6 w-6 text-white/70 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Ask Nimbus anything about mental health..."
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
                </div>

                {/* Tiles */}
                {isSearchActive && tiles.length > 0 && (
                    <div className="grid grid-cols-5 gap-4 auto-rows-auto">
                        {tiles.map((tile) => (
                            <div
                                key={tile.id}
                                className={`${tile.width} ${tile.height}`}
                            >
                                <div className="relative h-full overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300">
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
                                            ) : tile.forums && tile.forums.length > 0 ? (
                                                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 animate-in fade-in duration-500 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                                                    {tile.forums.map((forum, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="border-b border-white/10 pb-3 last:border-0 hover:bg-white/5 transition-colors rounded-lg p-2 -m-2 cursor-pointer"
                                                            onClick={() => {
                                                                setIsSearchOpen(false);
                                                                setSearchQuery('');
                                                                navigate(`/forum/${forum.id}`);
                                                            }}
                                                        >
                                                            <h4 className="text-sm font-semibold text-white leading-tight mb-1">
                                                                {forum.title}
                                                            </h4>
                                                            <p className="text-xs text-white/60 mb-2 line-clamp-2">
                                                                {forum.content}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-xs text-white/60">
                                                                <span className="bg-white/10 px-2 py-0.5 rounded-full">{forum.category}</span>
                                                                <span>{forum.replies} replies</span>
                                                                <span>•</span>
                                                                <span>{forum.likes} likes</span>
                                                                <span>•</span>
                                                                <span>{forum.lastActive}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : tile.counselors && tile.counselors.length > 0 ? (
                                                <div className="flex-1 overflow-y-auto space-y-3 animate-in fade-in duration-500 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                                                    {tile.counselors.map((counselor, idx) => (
                                                        <div key={idx} className="border border-white/20 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                                            <h4 className="text-base font-bold text-white mb-1">
                                                                {counselor.name}
                                                            </h4>
                                                            <p className="text-xs text-white/70 mb-2">
                                                                {counselor.specialty}
                                                            </p>
                                                            <p className="text-xs text-white/60 mb-3">
                                                                {counselor.description}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-green-300">{counselor.availability}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsSearchOpen(false);
                                                                        setSearchQuery('');
                                                                        navigate('/counseling', { state: { counselor, searchQuery } });
                                                                    }}
                                                                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold text-white transition-all duration-200"
                                                                >
                                                                    Book Session
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : tile.relatedTopics && tile.relatedTopics.length > 0 ? (
                                                <div className="flex-1 overflow-y-auto space-y-2 animate-in fade-in duration-500 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                                                    {tile.relatedTopics.map((topic, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSearchQuery(topic.query)}
                                                            className="w-full text-left px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-200 group"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <svg className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                </svg>
                                                                <span className="text-sm text-white/80 group-hover:text-white font-medium transition-colors">
                                                                    {topic.topic}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : tile.helplines && tile.helplines.length > 0 ? (
                                                <div className="flex-1 overflow-y-auto space-y-3 animate-in fade-in duration-500 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                                                    {tile.helplines.map((helpline, idx) => (
                                                        <div key={idx} className="bg-white/5 border border-white/20 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h4 className="text-base font-bold text-white leading-tight flex-1">
                                                                    {helpline.name}
                                                                </h4>
                                                                <span className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                                                                    {helpline.availability}
                                                                </span>
                                                            </div>
                                                            <a 
                                                                href={`tel:${helpline.number.replace(/[^0-9]/g, '')}`}
                                                                className="text-lg font-bold text-blue-300 hover:text-blue-200 transition-colors mb-2 block"
                                                            >
                                                                {helpline.number}
                                                            </a>
                                                            <p className="text-xs text-white/70 leading-relaxed">
                                                                {helpline.description}
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
                )}
            </div>
        </>
    );
}

export default NimbusSearch;
