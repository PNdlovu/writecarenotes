import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
