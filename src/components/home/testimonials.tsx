interface TestimonialProps {
    profileImageUrl?: string;
    authorName: string;
    content: string; 
}

export default function Testimonial({profileImageUrl, authorName, content}: TestimonialProps) {
    return (
        <div className=" bg-gray-800/50 flex flex-col rounded-lg px-4 py-6 items-center border border-gray-400">

            <img src={profileImageUrl} alt={`${authorName}'s profile`} className="w-16 h-16 object-cover rounded-full mt-4" />

            <h2 className="mt-4 text-lg font-semibold">{authorName}</h2>
            <p className="mt-2 text-center">{content}</p>


        </div>

    )
}