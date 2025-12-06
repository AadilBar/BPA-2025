

function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Welcome to the Home Page!
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                    This is a simple home page built with React and Tailwind CSS.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200">
                    Get Started
                </button>
            </div>
        </div>
    );
}

export default Home;