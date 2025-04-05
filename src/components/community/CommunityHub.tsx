
import { useState, useEffect } from 'react';
import { Search, MessageCircle, Star, Filter, Users, Heart, Share2 } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

const CommunityHub = () => {
  const [posts, setPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:8000/projects');
        const data = await res.json();
        if (data && data.projects) {
          setPosts(data.projects);
          setVisiblePosts(data.projects);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
  useEffect(() => {
    if (activeFilter === 'all') {
      setVisiblePosts(posts);
    } else if (activeFilter === 'questions') {
      setVisiblePosts(posts.filter(post => post.tags.includes('help')));
    } else if (activeFilter === 'projects') {
      setVisiblePosts(posts.filter(post => !post.tags.includes('help')));
    }
  }, [activeFilter]);
  
  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gradient mb-6">Community Hub</h2>
        <p className="text-gray-400 mb-8">
          Connect with other makers, share your creations, ask questions, and get inspired.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                activeFilter === 'all' 
                  ? 'bg-electric-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All Posts
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                activeFilter === 'projects' 
                  ? 'bg-electric-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setActiveFilter('projects')}
            >
              Projects
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                activeFilter === 'questions' 
                  ? 'bg-electric-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setActiveFilter('questions')}
            >
              Questions
            </button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-electric-500 text-gray-300"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(item => (
            <div 
              key={item} 
              className="bg-midnight-900/50 rounded-xl h-[320px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {visiblePosts.map((post, index) => (
            <AnimatedCard 
              key={post.id} 
              withBorder 
              withHover
              className="overflow-hidden"
              delay={index * 150}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden h-48 mb-4 md:mb-0">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="flex items-center mb-4">
                    <img 
                      src={post.user.avatar} 
                      alt={post.user.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-white">{post.user.name}</h4>
                        {post.tags.includes('help') ? (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-600 text-white rounded-full">
                            Needs Help
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">
                            Showcase
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        <span className="font-medium text-electric-400">{post.user.level}</span> · 
                        Project: <span className="text-gray-300">{post.projectName}</span>
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-3">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="flex items-center text-gray-400 hover:text-electric-400 transition-colors">
                      <Heart className="w-4 h-4 mr-1" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center text-gray-400 hover:text-electric-400 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center text-gray-400 hover:text-electric-400 transition-colors">
                      <Share2 className="w-4 h-4 mr-1" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
      
      <div className="mt-10 flex justify-center">
        <div className="glass-morphism p-6 rounded-xl flex items-center max-w-xl text-center animate-fade-in">
          <div>
            <Users className="w-10 h-10 text-electric-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Join Our Growing Community</h3>
            <p className="text-gray-400 mb-4">
              Share your own projects, ask questions, and connect with creative makers from around the world.
            </p>
            <button className="px-6 py-2 bg-electric-600 hover:bg-electric-700 text-white rounded-lg transition-colors">
              Create a Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
