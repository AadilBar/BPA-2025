interface TestimonialProps {
    profileImageUrl?: string;
    authorName: string;
    content: string; 
}

export default function Testimonial({profileImageUrl, authorName, content}: TestimonialProps) {
    return (
        <div className="bg-white/10 backdrop-blur-xl flex flex-col rounded-3xl px-4 py-6 items-center border border-white/30 shadow-2xl shadow-black/20 hover:bg-white/15 transition-all duration-300">

            <img src={profileImageUrl} alt={`${authorName}'s profile`} className="w-16 h-16 object-cover rounded-full mt-4" />

            <h2 className="mt-4 text-lg font-semibold">{authorName}</h2>
            <p className="mt-2 text-center">{content}</p>


        </div>

    )
}