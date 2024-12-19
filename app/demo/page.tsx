import { DemoRequestForm } from '@/components/demo/DemoRequestForm';

export default function DemoPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Request a Demo</h1>
            <p className="text-xl text-muted-foreground">
              See how our care home management system can transform your facility.
              Schedule a personalized demo with our team.
            </p>
          </div>
          <DemoRequestForm />
        </div>
      </div>
    </div>
  );
}
