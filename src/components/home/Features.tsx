
import { useEffect, useRef } from 'react';
import { Camera, Cpu, Layers, Smartphone, Users, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

const features = [
  {
    icon: <Camera className="w-6 h-6 text-electric-400" />,
    title: "Photo-based Identification",
    description: "Snap a photo of items, and our AI recognizes what you have to work with."
  },
  {
    icon: <Cpu className="w-6 h-6 text-electric-400" />,
    title: "AI-powered Ideas",
    description: "Get customized project suggestions based on the items you already have."
  },
  {
    icon: <Layers className="w-6 h-6 text-electric-400" />,
    title: "Step-by-step Guides",
    description: "Detailed instructions created by AI to help you complete your DIY project."
  },
  {
    icon: <Smartphone className="w-6 h-6 text-electric-400" />,
    title: "AR Guidance",
    description: "Augmented reality overlays show you exactly what to do at each step."
  },
  {
    icon: <Users className="w-6 h-6 text-electric-400" />,
    title: "Community Support",
    description: "Connect with other makers who can help when you get stuck."
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-electric-400" />,
    title: "Q&A Functionality",
    description: "Ask questions and get answers from AI or community members."
  },
  {
    icon: <Star className="w-6 h-6 text-electric-400" />,
    title: "Project Sharing",
    description: "Share your completed projects and see what others have created."
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-electric-400" />,
    title: "Evolving Knowledge",
    description: "Our system learns from user interactions to provide better recommendations."
  }
];

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    <section id="how-it-works" className="py-20 px-6 relative overflow-hidden" ref={featuresRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-black to-midnight-950 z-0" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-electric-600/10 filter blur-[100px] animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-electric-700/10 filter blur-[80px] animate-float animation-delay-1000" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">How It Works</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our platform uses cutting-edge technology to help you create amazing DIY projects from everyday items.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <AnimatedCard 
              key={index}
              withGlow
              withHover
              withBorder
              delay={index * 100}
              className="reveal"
            >
              <div className="rounded-full w-12 h-12 glass-morphism flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
