
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { User, Settings, Edit, Camera, Star, Clock, MessageCircle, Heart } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import ProjectCard from '@/components/projects/ProjectCard';

interface ProjectStep {
  title: string;
  description: string;
}

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRequired: string;
  imageUrl: string;
  rating: number;
  materials: string[];
  steps: ProjectStep[];
  index?: number;
}

interface UserData {
  name: string
  username: string
  bio: string
  avatar: string
  level: string
  projects: number
  followers: number
  following: number
  joinedDate: string
  badges: string[]
  completedProjects: ProjectCardProps[]
  savedItems: string[]
  activityFeed: any[]
}
// Mock user data
const mockUserData: UserData = {
  name: "Alex Johnson",
  username: "alexmaker",
  bio: "DIY enthusiast and upcycling advocate. I love turning junk into something beautiful and functional.",
  avatar: "https://i.pravatar.cc/300?img=12",
  level: "Experienced Maker",
  projects: 12,
  followers: 143,
  following: 87,
  joinedDate: "January 2023",
  badges: ["Early Adopter", "Community Helper", "Project Master"],
  completedProjects: [
    {
      id: 1,
      title: "Rocket Pencil Holder",
      description: "My take on the rocket pencil holder, with some extra decorative elements and LED lights added.",
      difficulty: "Easy" as const,
      timeRequired: "1.5 hours",
      imageUrl: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      materials: ["Cardboard tube", "LED lights", "Paint", "Glue"],
      steps: [],
    },
    {
      id: 2,
      title: "LED Bottle Lamp",
      description: "Made this ambient lamp from empty wine bottles with LED string lights inside.",
      difficulty: "Medium" as const,
      timeRequired: "2 hours",
      imageUrl: "https://images.unsplash.com/photo-1564185322734-b75606d3cb7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      materials: ["Wine bottles", "LED string lights", "Drill", "Cork"],
      steps: [],
    },
    {
      id: 5,
      title: "Mini Greenhouse",
      description: "Built this mini greenhouse from plastic bottles to start my herb seeds.",
      difficulty: "Medium" as const,
      timeRequired: "2 hours",
      imageUrl: "https://images.unsplash.com/photo-1466692476655-ab0c26c69cbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      rating: 4.7,
      materials: ["Empty plastic bottles", "Soil", "Seeds", "Scissors"],
      steps: [],
    }
  ],
  savedItems: [
    "Empty jars",
    "Cardboard boxes",
    "Wine corks",
    "Old magazines",
    "Plastic bottles",
    "Bottle caps"
  ],
  activityFeed: [
    {
      type: "completed",
      project: "Mini Greenhouse",
      date: "1 week ago"
    },
    {
      type: "comment",
      project: "LED Bottle Lamp",
      content: "Has anyone tried using colored LEDs for this project?",
      date: "2 weeks ago"
    },
    {
      type: "liked",
      user: "MakerMike",
      project: "Magazine Mosaic Wall Art",
      date: "2 weeks ago"
    },
    {
      type: "completed",
      project: "Rocket Pencil Holder",
      date: "3 weeks ago"
    }
  ]
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(mockUserData);
  
  useEffect(() => {
    if (localStorage.getItem("currentUser") != undefined) {
      let temp = JSON.parse(localStorage.getItem("currentUser"))
      setUserData(temp);
      console.log(userData);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-electric-500 border-t-transparent animate-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Profile header */}
          <div className="relative mb-12">
            {/* Cover image */}
            <div className="h-48 md:h-64 rounded-xl overflow-hidden mb-16 glass-morphism animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-r from-electric-600/30 to-midnight-900/30 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=60" 
                alt="Profile cover" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Profile image and basic info */}
            <div className="absolute -bottom-10 left-8 flex items-end">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-midnight-950 shadow-lg animate-fade-in">
                  <img 
                    src={userData.avatar} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-electric-600 flex items-center justify-center shadow-lg hover:bg-electric-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="ml-4 mb-4 animate-fade-in" style={{animationDelay: '150ms'}}>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{userData.name}</h1>
                <p className="text-gray-400">@{userData.username}</p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="absolute right-4 bottom-4 flex space-x-2 animate-fade-in" style={{animationDelay: '300ms'}}>
              <button className="p-2 rounded-full glass-morphism">
                <Settings className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
              <button className="p-2 rounded-full glass-morphism">
                <Edit className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          
          {/* Profile main content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left sidebar */}
            <div className="md:w-1/3 space-y-6">
              <AnimatedCard withBorder className="animate-fade-in">
                <h2 className="text-lg font-bold mb-4">About</h2>
                <p className="text-gray-400 mb-6">{userData.bio}</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="text-electric-400 font-medium">{userData.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Projects</span>
                    <span>{userData.projects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Followers</span>
                    <span>{userData.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Following</span>
                    <span>{userData.following}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined</span>
                    <span>{userData.joinedDate}</span>
                  </div>
                </div>
              </AnimatedCard>
              
              <AnimatedCard withBorder className="animate-fade-in" delay={150}>
                <h2 className="text-lg font-bold mb-4">Badges</h2>
                <div className="flex flex-wrap gap-2">
                  {userData.badges.map((badge, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-1 bg-electric-600/20 border border-electric-600/40 rounded-full text-sm text-electric-400"
                    >
                      <Star className="w-3 h-3 inline-block mr-1" />
                      {badge}
                    </div>
                  ))}
                </div>
              </AnimatedCard>
              
              <AnimatedCard withBorder className="animate-fade-in" delay={300}>
                <h2 className="text-lg font-bold mb-4">Saved Items</h2>
                <div className="space-y-2">
                  {userData.savedItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <span>{item}</span>
                      <span className="text-xs text-gray-500">Available</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-electric-400 hover:text-electric-300 transition-colors text-sm">
                  + Add Item
                </button>
              </AnimatedCard>
            </div>
            
            {/* Main content */}
            <div className="md:w-2/3">
              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6 animate-fade-in">
                <button 
                  className={`px-4 py-3 font-medium ${
                    activeTab === 'projects' 
                    ? 'text-electric-400 border-b-2 border-electric-400' 
                    : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('projects')}
                >
                  My Projects
                </button>
                <button 
                  className={`px-4 py-3 font-medium ${
                    activeTab === 'activity' 
                    ? 'text-electric-400 border-b-2 border-electric-400' 
                    : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                </button>
              </div>
              
              {/* Tab content */}
              {activeTab === 'projects' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Completed Projects</h2>
                    <AnimatedButton variant="electric" size="sm">
                      Start New Project
                    </AnimatedButton>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.completedProjects.map((project, index) => (
                      <ProjectCard 
                        key={project.id} 
                        {...project} 
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="space-y-4 animate-fade-in">
                  <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
                  
                  {userData.activityFeed.map((activity, index) => (
                    <AnimatedCard 
                      key={index} 
                      withBorder 
                      className="animate-fade-in" 
                      delay={index * 150}
                    >
                      <div className="flex items-start">
                        <div className="rounded-full w-10 h-10 glass-morphism flex items-center justify-center mr-4">
                          {activity.type === 'completed' && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                          {activity.type === 'comment' && (
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                          )}
                          {activity.type === 'liked' && (
                            <Heart className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <div>
                              {activity.type === 'completed' && (
                                <span>
                                  Completed <span className="font-medium text-white">{activity.project}</span> project
                                </span>
                              )}
                              {activity.type === 'comment' && (
                                <span>
                                  Commented on <span className="font-medium text-white">{activity.project}</span>
                                </span>
                              )}
                              {activity.type === 'liked' && (
                                <span>
                                  Liked <span className="font-medium text-white">{activity.user}'s</span> {activity.project}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{activity.date}</span>
                          </div>
                          {activity.content && (
                            <p className="text-gray-400 mt-1 text-sm">"{activity.content}"</p>
                          )}
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;

// Missing import for Check component
import { Check } from 'lucide-react';import { mock } from 'node:test';

