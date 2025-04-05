import ProjectPublishForm from "@/components/community/PublishForm"
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-midnight-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <ProjectPublishForm />
      </main>
      
      <Footer />
    </div>
  )
}
