import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutUsSection from '../components/AboutUsSection';
import MinisterMessageSection from '../components/MinisterMessageSection';
import PopularJobsSection from '../components/PopularJobsSection';
//import CompaniesShowcaseSection from '../components/CompaniesShowcaseSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
 //  <CompaniesShowcaseSection />
export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AboutUsSection />
      <MinisterMessageSection />
      <PopularJobsSection />
   
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
