
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ArrowRight, Camera, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    // For scroll reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950 overflow-x-hidden">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        
        {/* How It Works Section */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 to-black z-0" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-electric-600/10 filter blur-[80px] animate-float" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 reveal">
              <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">See It In Action</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Watch how MakeIt transforms everyday items into amazing projects with AI and AR.
              </p>
            </div>
            
            <div className="relative glass-morphism rounded-xl overflow-hidden shadow-2xl mb-16 reveal">
              <div className="absolute inset-0 bg-gradient-to-tr from-electric-600/20 to-transparent pointer-events-none z-10" />
              <div className="aspect-video relative">
                <img 
                  src="https://images.unsplash.com/photo-1617886322168-72b886573c5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                  alt="MakeIt Demo" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 rounded-full bg-electric-600/90 flex items-center justify-center transition-transform hover:scale-110 shadow-glow">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal">
              <div className="glass-morphism p-8 rounded-xl text-center">
                <div className="rounded-full w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Snap a Photo</h3>
                <p className="text-gray-400">
                  Take a picture of items you already have, and our AI will identify them.
                </p>
              </div>
              
              <div className="glass-morphism p-8 rounded-xl text-center">
                <div className="rounded-full w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Get Inspired</h3>
                <p className="text-gray-400">
                  Choose from AI-generated project ideas customized to the items you have.
                </p>
              </div>
              
              <div className="glass-morphism p-8 rounded-xl text-center">
                <div className="rounded-full w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Connect & Share</h3>
                <p className="text-gray-400">
                  Join our community to share your creations and help others with their projects.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-midnight-950 z-0" />
          <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-electric-700/10 filter blur-[100px] animate-float animation-delay-1000" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="glass-morphism p-10 md:p-16 rounded-2xl reveal">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="md:w-2/3">
                  <div className="flex items-center mb-4">
                    <RefreshCw className="w-6 h-6 text-electric-400 mr-3" />
                    <span className="text-sm text-electric-400 uppercase tracking-wide">AI-Powered Learning</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
                    Ready to Transform Your Random Items?
                  </h2>
                  <p className="text-xl text-gray-400 mb-8">
                    Start creating amazing DIY projects from things you already have. 
                    The more you use MakeIt, the better it gets at suggesting projects just for you.
                  </p>
                  
                  <AnimatedButton 
                    variant="electric" 
                    size="lg"
                    withGlow
                    className="group"
                  >
                    <Link to="/scan" className="flex items-center">
                      Get Started Today
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </AnimatedButton>
                </div>
                
                <div className="md:w-1/3 relative">
                  <div className="relative w-64 h-64 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-electric-500/20 to-electric-700/20 animate-pulse"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1633424974356-1211a83f11af?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                      alt="DIY Creation" 
                      className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-cover rounded-full shadow-glow"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

// Missing import for Play component
import { Play } from 'lucide-react';
