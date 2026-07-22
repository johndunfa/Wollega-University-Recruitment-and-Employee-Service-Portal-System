import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HRTeamSection from '../../components/HRTeamSection';

export default function HRTeamPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white/80 to-[#e0f7fa]/60">
      <Navbar />
      <main className="flex-1 w-full">
        <HRTeamSection />
      </main>
      <Footer />
    </div>
  );
} 