import { PricingSection } from '@/components/landing/PricingSection';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Pricing Plans</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Choose the perfect plan for your care home management needs
          </p>
          <PricingSection />
        </div>
      </div>
    </div>
  );
}
