
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ChevronDown } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = container.getBoundingClientRect();
      
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      
      const elems = container.querySelectorAll('.parallax-item');
      elems.forEach((elem) => {
        const factor = parseFloat((elem as HTMLElement).dataset.factor || '0.1');
        const rotateX = y * 10 * factor;
        const rotateY = -x * 10 * factor;
        (elem as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-10" ref={containerRef}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 to-black z-0" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-electric-500/10 to-transparent z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-electric-500/5 to-transparent z-0" />
      
      {/* Animated circles */}
      <div className="absolute top-1/4 right-1/6 w-56 h-56 rounded-full bg-electric-600/10 filter blur-[80px] animate-float" />
      <div className="absolute bottom-1/4 left-1/6 w-72 h-72 rounded-full bg-electric-700/10 filter blur-[100px] animate-float animation-delay-1000" />
      
      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="flex justify-center mb-8">
          <span className="inline-block px-4 py-2 rounded-full text-sm glass-morphism text-electric-400 animate-fade-in-down">
            Turn Your Junk Drawer Into Something Amazing
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient leading-tight parallax-item" data-factor="0.05">
          Transform Everyday <span className="text-gradient-electric">Items</span> Into Amazing <span className="text-gradient-electric">DIY Projects</span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '200ms'}}>
          Just snap a photo of items you have, and our AI will suggest creative projects. 
          Follow AR-guided steps to create something new and amazing.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 animate-fade-in-up" style={{animationDelay: '400ms'}}>
          <AnimatedButton 
            variant="electric" 
            size="lg"
            withGlow
            className="group"
          >
            <Link to="/scan" className="flex items-center">
              <Camera className="mr-2 w-5 h-5 group-hover:animate-pulse" />
              Scan Items
            </Link>
          </AnimatedButton>
          <Link to="#how-it-works" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <span className="mr-2">How It Works</span>
            <ChevronDown className="animate-bounce" />
          </Link>
        </div>
      </div>
      
      {/* Preview image */}
      <div className="relative w-full max-w-5xl mx-auto mt-16 animate-fade-in-up parallax-item" data-factor="0.1" style={{animationDelay: '600ms'}}>
        <div className="relative glass-morphism rounded-xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-electric-600/20 to-transparent pointer-events-none" />
          <img 
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80" 
            alt="AR DIY Project" 
            className="w-full h-auto opacity-90 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 flex items-center justify-center">
              <div className="w-full h-1 bg-electric-500/50 rounded-full animate-scanning" />
            </div>
          </div>
        </div>
        
        {/* Floating cards */}
        <div className="absolute -right-4 top-1/4 w-64 glass-morphism p-4 rounded-lg animate-float shadow-glow" style={{animationDelay: '1s'}}>
          <div className="flex items-start">
            <div className="rounded-full w-10 h-10 bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center mr-3">
              <span className="text-white font-bold">AI</span>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-white">AI-Powered Identification</h3>
              <p className="text-xs text-gray-400 mt-1">Instantly recognizes household items</p>
            </div>
          </div>
        </div>
        
        <div className="absolute -left-4 top-2/3 w-64 glass-morphism p-4 rounded-lg animate-float" style={{animationDelay: '1.5s'}}>
          <div className="flex items-start">
            <div className="rounded-full w-10 h-10 bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center mr-3">
              <span className="text-white font-bold">AR</span>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-white">AR-Guided Creation</h3>
              <p className="text-xs text-gray-400 mt-1">Step-by-step augmented reality instructions</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-gray-500" />
      </div>
    </div>
  );
};

export default Hero;
