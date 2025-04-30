export default function Hero() 
{
    return (
        <>
        <section className="text-center">
            <h2 className="text-5xl font-extrabold mb-6">Empower Collaborative Coding</h2>
            <p className="text-lg mb-8">
                Collabor8 is a real-time collaborative code editor that empowers developers to work seamlessly on coding projects.
            </p>
            <a
                href="/login"
                className="px-6 py-3 bg-blue-600 rounded-full text-white text-lg shadow-lg hover:bg-blue-700"
            >
                Get Started
            </a>
        </section>
        </>
    );
}