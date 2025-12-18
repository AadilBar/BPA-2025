import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ExternalLink, Phone } from 'lucide-react';

interface ResourceItem {
    id: string;
    title: string;
    category: string;
    summary: string;
    symptoms?: string[];
    coping?: string[];
    whenToSeekHelp?: string[];
    links?: { label: string; url: string }[];
    tags?: string[];
}

const ALL_RESOURCES: ResourceItem[] = [
    {
        id: 'depression',
        title: 'Depression',
        category: 'Mood',
        summary:
            'Persistent low mood, loss of interest in activities, changes in sleep or appetite, and difficulty concentrating.',
        symptoms: ['Low mood', 'Loss of pleasure', 'Fatigue', 'Difficulty concentrating', 'Changes in sleep/appetite'],
        coping: [
            'Keep a regular sleep schedule',
            'Break tasks into small steps',
            'Stay connected to supportive people',
            'Try low-intensity activities (walking, stretching)'
        ],
        whenToSeekHelp: ['If symptoms last more than two weeks', 'If you have suicidal thoughts or lose interest in daily functioning'],
        links: [
            { label: 'WHO — Depression', url: 'https://www.who.int/news-room/fact-sheets/detail/depression' },
            { label: 'NIMH — Depression', url: 'https://www.nimh.nih.gov/health/topics/depression' }
        ],
        tags: ['mood', 'depression']
    },
    {
        id: 'anxiety',
        title: 'Anxiety Disorders',
        category: 'Anxiety',
        summary:
            'Excessive worry, restlessness, irritability, muscle tension, and avoidance of feared situations.',
        symptoms: ['Excessive worry', 'Restlessness', 'Panic attacks', 'Avoidance behaviors'],
        coping: [
            'Practice grounding techniques (5-4-3-2-1)',
            'Diaphragmatic breathing',
            'Limit caffeine and alcohol',
            'Gradual exposure to feared situations with support'
        ],
        whenToSeekHelp: ['If anxiety interferes with daily life', 'If panic attacks are frequent or severe'],
        links: [
            { label: 'Anxiety and Depression Association of America', url: 'https://adaa.org' },
            { label: 'NHS — Anxiety', url: 'https://www.nhs.uk/mental-health/conditions/anxiety/' }
        ],
        tags: ['anxiety', 'panic']
    },
    {
        id: 'ptsd',
        title: 'Post-Traumatic Stress Disorder (PTSD)',
        category: 'Trauma',
        summary:
            'Intrusive memories, avoidance, negative changes in thinking and mood, and changes in physical and emotional reactions following trauma.',
        symptoms: ['Flashbacks', 'Avoidance of reminders', 'Hypervigilance', 'Negative mood'],
        coping: [
            'Grounding techniques during flashbacks',
            'Seek supportive therapy (trauma-focused)',
            'Establish safety and routine'
        ],
        whenToSeekHelp: ['If trauma symptoms persist or worsen', 'If you struggle to function or feel unsafe'],
        links: [
            { label: 'PTSD: NIMH', url: 'https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd' }
        ],
        tags: ['trauma', 'ptsd']
    },
    {
        id: 'eating-disorders',
        title: 'Eating Disorders',
        category: 'Eating',
        summary: 'Unhealthy eating behaviors, preoccupation with weight or shape, and physical health risks.',
        symptoms: ['Preoccupation with food/weight', 'Bingeing or restricting', 'Compensatory behaviors'],
        coping: ['Seek specialized care', 'Focus on body functionality not shape', 'Avoid dieting culture'],
        whenToSeekHelp: ['If eating patterns are causing physical harm', 'Rapid weight change or medical instability'],
        links: [
            { label: 'NEDA — Eating Disorders', url: 'https://www.nationaleatingdisorders.org/' }
        ],
        tags: ['eating', 'disorder']
    },
    {
        id: 'substance',
        title: 'Substance Use & Addiction',
        category: 'Addiction',
        summary: 'Patterns of substance use that cause harm to health, relationships, or responsibilities.',
        symptoms: ['Loss of control', 'Cravings', 'Continued use despite harm'],
        coping: ['Seek professional support', 'Harm reduction strategies', 'Build a sober support network'],
        whenToSeekHelp: ['If use impacts safety or responsibilities', 'If withdrawal or cravings are severe'],
        links: [
            { label: 'SAMHSA', url: 'https://www.samhsa.gov/' }
        ],
        tags: ['substance', 'addiction']
    },
        {
            id: 'bipolar',
            title: 'Bipolar Disorder',
            category: 'Mood',
            summary: 'Episodes of unusually elevated mood (mania or hypomania) and periods of depression which can affect thinking and behaviour.',
            symptoms: ['Periods of high energy or reduced need for sleep', 'Elevated or irritable mood', 'Impulsive behaviour', 'Depressive episodes'],
            coping: ['Keep a stable routine', 'Track mood and triggers', 'Medication as prescribed', 'Psychoeducation and therapy (CBT, family-focused)'],
            whenToSeekHelp: ['If mood episodes disrupt daily life', 'If there are risky behaviours during mania', 'If depressive episodes include suicidal thoughts'],
            links: [
                { label: 'NIMH — Bipolar Disorder', url: 'https://www.nimh.nih.gov/health/topics/bipolar-disorder' }
            ],
            tags: ['bipolar', 'mood']
        },
        {
            id: 'ocd',
            title: 'Obsessive-Compulsive Disorder (OCD)',
            category: 'Anxiety',
            summary: 'Recurring unwanted thoughts (obsessions) and repetitive behaviours (compulsions) performed to reduce distress.',
            symptoms: ['Intrusive thoughts', 'Repetitive checking or rituals', 'Time-consuming compulsions', 'Avoidance'],
            coping: ['Practice response prevention with exposure (ERP)', 'Mindfulness for intrusive thoughts', 'Break rituals into small steps', 'Seek CBT with ERP trained therapist'],
            whenToSeekHelp: ['If rituals take up significant time', 'If obsessions cause severe distress or interfere with functioning'],
            links: [
                { label: 'International OCD Foundation', url: 'https://iocdf.org/' }
            ],
            tags: ['ocd', 'compulsions']
        },
        {
            id: 'adhd',
            title: 'Attention-Deficit/Hyperactivity Disorder (ADHD)',
            category: 'Neurodevelopmental',
            summary: 'Patterns of inattention, hyperactivity, and impulsivity that interfere with functioning or development.',
            symptoms: ['Difficulty sustaining attention', 'Disorganization', 'Impulsivity', 'Hyperactivity (in some)'],
            coping: ['Use structured routines and lists', 'Break tasks into shorter chunks', 'Minimize distractions', 'Consider professional assessment for medication or therapy'],
            whenToSeekHelp: ['If concentration issues affect work/school or relationships', 'If daily functioning is impaired'],
            links: [
                { label: 'CHADD', url: 'https://chadd.org/' },
                { label: 'NHS — ADHD', url: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/' }
            ],
            tags: ['adhd', 'attention']
        },
        {
            id: 'social-anxiety',
            title: 'Social Anxiety Disorder',
            category: 'Anxiety',
            summary: 'Intense fear or anxiety in social situations where one may be judged, often leading to avoidance and distress.',
            symptoms: ['Fear of embarrassment', 'Avoidance of social events', 'Physical symptoms in social settings'],
            coping: ['Gradual exposure to social situations', 'Practice social skills in safe settings', 'Cognitive strategies to challenge negative thoughts'],
            whenToSeekHelp: ['If avoidance impacts work, education, or relationships', 'If panic or severe anxiety occurs often in social settings'],
            links: [
                { label: 'Anxiety and Depression Association of America — Social Anxiety', url: 'https://adaa.org/understanding-anxiety/social-anxiety-disorder' }
            ],
            tags: ['social', 'anxiety']
        },
        {
            id: 'insomnia',
            title: 'Insomnia & Sleep Problems',
            category: 'Sleep',
            summary: 'Difficulty falling asleep, staying asleep, or non-restorative sleep that affects daytime functioning.',
            symptoms: ['Trouble falling asleep', 'Waking during the night', 'Daytime sleepiness', 'Trouble concentrating'],
            coping: ['Maintain consistent sleep schedule', 'Reduce screen time before bed', 'Create a calming bedtime routine', 'Limit caffeine and heavy meals late in the day'],
            whenToSeekHelp: ['If poor sleep persists for weeks and affects daytime functioning', 'If there are signs of sleep apnea or other sleep disorders'],
            links: [
                { label: 'American Academy of Sleep Medicine', url: 'https://aasm.org/' }
            ],
            tags: ['sleep', 'insomnia']
        },
        {
            id: 'bpd',
            title: 'Borderline Personality Disorder (BPD)',
            category: 'Personality',
            summary: 'Patterns of instability in relationships, self-image, and emotions, often with intense reactions to perceived abandonment.',
            symptoms: ['Intense mood swings', 'Impulsive behaviour', 'Unstable relationships', 'Fear of abandonment'],
            coping: ['DBT skills training (emotion regulation, distress tolerance)', 'Build a crisis plan', 'Therapy with trained clinicians'],
            whenToSeekHelp: ['If mood swings or impulsive actions cause harm or disrupt life', 'If self-harm or suicidal thoughts occur'],
            links: [
                { label: 'NHS — Personality Disorders', url: 'https://www.nhs.uk/mental-health/conditions/personality-disorders/' }
            ],
            tags: ['personality', 'bpd']
        }
];

export default function Resources() {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [expanded, setExpanded] = useState<string | null>(null);

    const categories = useMemo(() => ['All', ...Array.from(new Set(ALL_RESOURCES.map(r => r.category)))], []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return ALL_RESOURCES.filter(r => {
            if (activeCategory !== 'All' && r.category !== activeCategory) return false;
            if (!q) return true;
            const inTitle = r.title.toLowerCase().includes(q);
            const inSummary = r.summary.toLowerCase().includes(q);
            const inTags = r.tags?.some(t => t.toLowerCase().includes(q));
            const inLinks = r.links?.some(l => l.label.toLowerCase().includes(q));
            return inTitle || inSummary || inTags || inLinks;
        });
    }, [query, activeCategory]);

            const [visibleCount, setVisibleCount] = useState<number>(2);

            // Reset visible count when filters/search change
            useEffect(() => {
                setVisibleCount(2);
            }, [query, activeCategory]);

            const loadMore = () => setVisibleCount(prev => Math.min(prev + 2, filtered.length));

    return (
        <div className="min-h-screen pt-24 pb-12 px-4" style={{ background: 'linear-gradient(180deg,#0A0F2A 0%, #6A1E55 45%, #D76F86 75%, #FFA54C 90%)' }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">Resources</h1>
                    <p className="text-white/80 text-lg">Information, strategies, and places to get help for common mental health concerns.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search conditions, strategies, or keywords..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-2 items-center">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`text-sm px-4 py-2 rounded-full transition-all ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {filtered.length === 0 ? (
                            <div className="bg-white/5 rounded-2xl p-8 text-center text-white/70">No resources matched your search.</div>
                        ) : (
                            <>
                                {filtered.slice(0, visibleCount).map(item => (
                                    <article key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl hover:bg-white/15 transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                            <p className="text-white/70 mb-3">{item.summary}</p>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {item.tags?.map(t => (
                                                    <span key={t} className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full">#{t}</span>
                                                ))}
                                            </div>

                                            <div className="text-white/80 text-sm space-y-2">
                                                <div>
                                                    <strong className="text-white">Coping strategies:</strong>
                                                    <ul className="list-disc ml-5 mt-2 text-white/70">
                                                        {item.coping?.slice(0, expanded === item.id ? 100 : 3).map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <strong className="text-white">When to seek help:</strong>
                                                    <ul className="list-disc ml-5 mt-2 text-white/70">
                                                        {item.whenToSeekHelp?.slice(0, expanded === item.id ? 100 : 2).map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 flex flex-col items-end gap-3">
                                            <div className="text-white/60 text-sm">{item.category}</div>
                                            <button
                                                onClick={() => setExpanded(prev => prev === item.id ? null : item.id)}
                                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 px-3 py-2 rounded-full text-sm"
                                            >
                                                <span>{expanded === item.id ? 'Hide' : 'Learn more'}</span>
                                                <ChevronDown size={16} className={`transition-transform ${expanded === item.id ? 'rotate-180' : 'rotate-0'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {expanded === item.id && (
                                        <div className="mt-4 border-t border-white/5 pt-4 text-white/80">
                                            {item.symptoms && (
                                                <div className="mb-3">
                                                    <strong className="text-white">Common symptoms:</strong>
                                                    <ul className="list-disc ml-5 mt-2 text-white/70">
                                                        {item.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {item.links && (
                                                <div className="mb-3">
                                                    <strong className="text-white">More resources:</strong>
                                                    <ul className="mt-2 space-y-2">
                                                        {item.links.map((l, i) => (
                                                            <li key={i}>
                                                                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-white/90 hover:underline flex items-center gap-2">
                                                                    <ExternalLink size={14} />
                                                                    <span className="text-sm">{l.label}</span>
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="mt-2 bg-white/5 p-3 rounded-lg">
                                                <div className="flex items-center gap-3 text-white">
                                                    <Phone size={18} />
                                                    <div>
                                                        <div className="text-sm font-semibold">Immediate help</div>
                                                        <div className="text-xs text-white/80">If you are in danger or thinking of harming yourself, call your local emergency number immediately.</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </article>
                                ))}

                                {filtered.length > visibleCount && (
                                    <div className="mt-4">
                                        <button onClick={loadMore} className="w-full bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-full py-3 transition-all border border-white/10">View more resources</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-2">Quick Help</h3>
                            <p className="text-white/70 text-sm">If you or someone is in immediate danger, call emergency services now.</p>
                            <div className="mt-4">
                                <a href="tel:911" className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full">Call Emergency</a>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-2">Self-care tools</h3>
                            <ul className="text-white/70 text-sm space-y-2">
                                <li>• Breathing exercises and grounding</li>
                                <li>• Sleep hygiene and routine</li>
                                <li>• Small achievable goals</li>
                                <li>• Peer support and hotlines</li>
                            </ul>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-2">Find professional help</h3>
                            <p className="text-white/70 text-sm">Search for local therapists, clinics, or telehealth services. Consider contacting your primary care provider for referrals.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
