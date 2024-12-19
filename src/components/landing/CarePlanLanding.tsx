import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function CarePlanLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Care Home Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Enterprise-grade care plan management system designed specifically for care homes across the UK and Ireland.
            Compliant, secure, and built for the way you work.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Start Free Trial
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="Regional Compliance"
            description="Built-in compliance with CQC, CIW, Care Inspectorate, HIQA, and RQIA standards. Stay compliant across all UK and Irish regions."
          />
          <FeatureCard
            title="Offline-First"
            description="Continue working without internet. Automatic sync when connection returns. Never lose critical care data."
          />
          <FeatureCard
            title="Multi-Language Support"
            description="Full support for English, Welsh, Scottish Gaelic, and Irish. Serve your diverse staff and residents."
          />
        </div>

        {/* Key Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Write Care Notes?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <BenefitList
              title="Care Quality"
              benefits={[
                "Evidence-based care planning",
                "Real-time risk assessments",
                "Goal tracking and outcomes",
                "Family involvement portal",
              ]}
            />
            <BenefitList
              title="Operational Excellence"
              benefits={[
                "Automated compliance reporting",
                "Secure audit trails",
                "Multi-device accessibility",
                "Integrated staff management",
              ]}
            />
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-semibold mb-6">Trusted by Leading Care Providers</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <ComplianceBadge name="CQC Registered" />
            <ComplianceBadge name="GDPR Compliant" />
            <ComplianceBadge name="ISO 27001" />
            <ComplianceBadge name="Cyber Essentials+" />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Care Home?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Join hundreds of care homes already using Write Care Notes to deliver outstanding care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Request Demo
            </Button>
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="text-center p-6">
      <CardContent>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function BenefitList({ title, benefits }: { title: string; benefits: string[] }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComplianceBadge({ name }: { name: string }) {
  return (
    <div className="bg-white shadow rounded-full px-6 py-2 text-sm font-medium text-gray-700">
      {name}
    </div>
  );
} 


