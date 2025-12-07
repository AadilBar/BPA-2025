
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
        <div className="border border-gray-400 px-4 py-4 rounded-[16px] bg-gray-800/50 flex flex-col"> 
        <div className="border rounded-[16px] w-fit px-2 py-2 bg-purple-500/40">
            <h2 className="text-purple-200/90 text-sm font-bold">{category}</h2>
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