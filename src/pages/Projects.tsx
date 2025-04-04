
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProjectIdeas from '@/components/projects/ProjectIdeas';

const Projects = () => {
  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <ProjectIdeas />
      </main>
      
      <Footer />
    </div>
  );
};

export default Projects;
