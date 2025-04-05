
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 py-12 px-6 md:px-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-950 to-black opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-xl font-bold text-gradient">MakeIt</span>
            </Link>
            <p className="text-gray-400 max-w-md">
              Transform your random items into creative DIY projects with AI and AR guidance. 
              Join our community of makers and upcyclers today.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="http://github.com/FrenzyVJN/flashlearnardevhouse/" className="text-gray-400 hover:text-electric-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} MakeIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
