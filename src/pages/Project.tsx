
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProjectDetails from '@/components/projects/ProjectDetails';

const Project = () => {
  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <ProjectDetails />
      </main>
      
      <Footer />
    </div>
  );
};

export default Project;
