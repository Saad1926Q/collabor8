export default function Navbar() 
{
    return (
        <>
            <header className="py-6 shadow-lg bg-blue-800">
                <div className="container mx-auto flex justify-between items-center px-4">
                <h1 className="text-3xl font-bold text-white">Collabor8</h1>
                <nav>
                    <ul className="flex space-x-6">
                    <li><a href="#getStarted" className="hover:text-gray-300">Get Started</a></li>
                    <li><a href="#features" className="hover:text-gray-300">Features</a></li>
                    <li><a href="#about" className="hover:text-gray-300">About</a></li>
                    </ul>
                </nav>
                </div>
            </header>
        </>
    );
}