
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScanItem from '@/components/scan/ScanItem';

const Scan = () => {
  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-6">Scan Your Items</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Take or upload a photo of items you have, and our AI will identify them and 
              suggest creative DIY projects you can make.
            </p>
          </div>
          
          <ScanItem />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Scan;
