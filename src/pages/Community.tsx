
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CommunityHub from '@/components/community/CommunityHub';

const Community = () => {
  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <CommunityHub />
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;
