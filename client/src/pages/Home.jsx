import About from "../components/About";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import { io } from 'socket.io-client';
import Navbar from "../components/Navbar";

const socket = io('http://localhost:5000'); 

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-gray-900 to-black text-white">
        <Navbar/>
        <main className="container mx-auto px-4 py-12">
            <Hero/>
            <Features/>
            <About/>
            
            <section id="updates" className="mt-16">
            <h3 className="text-4xl font-bold mb-6">Stay Tuned</h3>
            <p className="text-lg">
                Stay updated as Collabor8 comes to life! We are constantly working on bringing new features and improvements.
            </p>
            </section>
        </main>

        <Footer/>
    </div>
  );
};

export default Home;
