import { MarketingNavbar } from "@/components/marketing/Navbar";
import { MarketingFooter } from "@/components/marketing/Footer";
import { AboutValues } from "@/components/marketing/AboutValues";
import { PricingPlans } from "@/components/marketing/PricingPlans";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1 min-h-screen bg-gradient-to-b from-white to-[#e6f7f1]">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Simplify Your Care Home Management
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive digital solutions for modern care homes
            </p>
          </div>
        </section>
        <AboutValues />
        <PricingPlans />
      </main>
      <MarketingFooter />
    </div>
  );
}
