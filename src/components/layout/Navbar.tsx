
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Camera, Image, Layers, Users, User, Share2 } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Scan', path: '/scan', icon: <Camera className="w-4 h-4 mr-2" /> },
    { name: 'Projects', path: '/projects', icon: <Layers className="w-4 h-4 mr-2" /> },
    { name: 'Community', path: '/community', icon: <Users className="w-4 h-4 mr-2" /> },
    { name: 'Publish', path: '/publish', icon: <Share2 className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 transition-all duration-300 ${
      isScrolled ? 'py-3 backdrop-blur-lg bg-black/60 shadow-md' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center">
            <Image className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold text-gradient">MakeIt</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-300 ${
                location.pathname === link.path 
                  ? 'text-electric-400 font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/auth" className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <User className="w-5 h-5 text-gray-400 hover:text-white" />
          </Link>
          <AnimatedButton 
            variant="electric" 
            size="sm"
            withGlow
            className="hidden md:flex"
          >
            Start Creating
          </AnimatedButton>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
