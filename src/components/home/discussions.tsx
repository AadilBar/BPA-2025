
interface DiscussionsProps {
    category: string; 
    title: string; 
    description: string; 
    profileImageUrl?: string;
    authorName: string;
    timestamp?: string;
    commentsCount?: number;

}

export default function Discussions({ category, title, description, profileImageUrl, authorName, timestamp, commentsCount }: DiscussionsProps) {

    return (
        <div className="border border-white/30 px-4 py-4 rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20 flex flex-col hover:bg-white/15 transition-all duration-300"> 
        <div className="border border-white/30 rounded-full w-fit px-3 py-1.5 bg-white/20 backdrop-blur-md">
            <h2 className="text-white/90 text-sm font-bold drop-shadow-md">{category}</h2>
        </div>

            <div className="mt-4">
                <h3 className="text-white font-bold text-[20px]">{title}</h3>
                <p className="leading-tight text-gray-300">{description}</p>
            </div>

            <div className="text-white mt-4 flex items-center gap-4 text-gray-400 text-sm">
                <img src={profileImageUrl} alt={`${authorName}'s profile`} className="w-8 h-8 object-cover rounded-full" />
                <span>{authorName}</span>
                {timestamp && <span>{timestamp}</span>}
                {commentsCount !== undefined && <span>{commentsCount} comments</span>}
            </div>

        </div>
    )

}