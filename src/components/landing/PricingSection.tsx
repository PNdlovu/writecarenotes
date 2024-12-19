import { PricingCard } from '../pricing/PricingCard';
import { CheckCircle } from 'lucide-react';

const tiers = [
  {
    name: 'Basic',
    price: '£99',
    period: '/month',
    description: 'Perfect for small care homes starting their digital journey',
    features: [
      'Up to 25 residents',
      'Basic care planning',
      'Medication management',
      'Staff scheduling',
      'Incident reporting',
      'Email support',
      '99.9% uptime',
      'Basic analytics'
    ],
    highlighted: false
  },
  {
    name: 'Professional',
    price: '£199',
    period: '/month',
    description: 'Ideal for medium-sized care homes needing advanced features',
    features: [
      'Up to 100 residents',
      'Advanced care planning',
      'Electronic MAR charts',
      'Staff management suite',
      'Family portal access',
      'Custom reporting',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Training sessions'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for large care home groups',
    features: [
      'Unlimited residents',
      'Multi-home management',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom analytics',
      'On-site training',
      'SLA guarantee',
      'Custom features'
    ],
    highlighted: false
  }
];

export function PricingSection() {
  return (
    <section className="py-20 bg-background" aria-labelledby="pricing-plans">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" id="pricing-plans">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your care home. All plans include our core features
            with no hidden costs.
          </p>
        </div>

        {/* Feature Comparison Table for larger screens */}
        <div className="hidden lg:block mb-12">
          <div className="max-w-7xl mx-auto border rounded-lg overflow-hidden">
            <table className="w-full border-collapse bg-background">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Features</th>
                  {tiers.map((tier) => (
                    <th key={tier.name} className="p-4 text-center w-1/4">
                      <div className="font-bold text-lg">{tier.name}</div>
                      <div className="text-2xl font-bold">{tier.price}</div>
                      <div className="text-sm text-muted-foreground">{tier.period}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getAllFeatures(tiers).map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">{feature}</td>
                    {tiers.map((tier) => (
                      <td key={`${tier.name}-${feature}`} className="p-4 text-center">
                        {tier.features.includes(feature) ? (
                          <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Cards for all screen sizes */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              period={tier.period}
              description={tier.description}
              features={tier.features}
              highlighted={tier.highlighted}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FaqItem
              question="Can I switch plans later?"
              answer="Yes, you can upgrade or downgrade your plan at any time. We'll prorate the charges accordingly."
            />
            <FaqItem
              question="Is there a setup fee?"
              answer="No, we don't charge any setup fees. The price you see is what you pay."
            />
            <FaqItem
              question="Do you offer a free trial?"
              answer="Yes, we offer a 30-day free trial for all our plans. No credit card required."
            />
            <FaqItem
              question="What kind of support do you provide?"
              answer="All plans include email support. Professional and Enterprise plans include priority support and additional training."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-muted-foreground">{answer}</p>
    </div>
  );
}

function getAllFeatures(tiers: any[]): string[] {
  const allFeatures = new Set<string>();
  tiers.forEach(tier => {
    tier.features.forEach((feature: string) => {
      allFeatures.add(feature);
    });
  });
  return Array.from(allFeatures);
}
