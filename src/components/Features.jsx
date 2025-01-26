export default function Features() 
{
    return (
        <>
            <section id="features" className="mt-16">
                <h3 className="text-4xl font-bold mb-6">Features</h3>
                <ul className="grid md:grid-cols-2 gap-8">
                    <li className="bg-gray-800 p-6 rounded-xl shadow-md">
                    <h4 className="text-2xl font-semibold mb-2">Real-Time Collaboration</h4>
                    <p>Work with your team on the same codebase in real-time with instant updates and no conflicts.</p>
                    </li>
                    <li className="bg-gray-800 p-6 rounded-xl shadow-md">
                    <h4 className="text-2xl font-semibold mb-2">Intuitive Interface</h4>
                    <p>A user-friendly design ensures smooth navigation and interaction for all developers.</p>
                    </li>
                    <li className="bg-gray-800 p-6 rounded-xl shadow-md">
                    <h4 className="text-2xl font-semibold mb-2">Live Debugging</h4>
                    <p>Fix issues in real-time as you collaborate with team members.</p>
                    </li>
                    <li className="bg-gray-800 p-6 rounded-xl shadow-md">
                    <h4 className="text-2xl font-semibold mb-2">Seamless Integration</h4>
                    <p>Integrate easily with popular tools and frameworks to enhance productivity.</p>
                    </li>
                </ul>
            </section>
        </>
    );
}