import { Metadata } from 'next';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Mic, Smartphone, Clock, Check, Star, ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Daily Care Recording | Write Care Notes',
  description: 'Quick and easy daily notes with voice input support and mobile-friendly interface',
};

const features = [
  {
    title: 'Voice-to-Text',
    description: 'Record notes hands-free while providing care. Perfect for busy caregivers.',
    icon: Mic,
  },
  {
    title: 'Mobile First',
    description: 'Full functionality on any device. Work seamlessly between desktop and mobile.',
    icon: Smartphone,
  },
  {
    title: 'Quick Templates',
    description: 'Pre-made templates for common scenarios save time and ensure consistency.',
    icon: Clock,
  },
  {
    title: 'Smart Suggestions',
    description: 'AI-powered suggestions help complete notes faster and more accurately.',
    icon: Star,
  },
];

const accessibilityFeatures = [
  'Voice control support',
  'High contrast mode',
  'Screen reader optimized',
  'Adjustable text size',
  'Keyboard shortcuts',
  'Color blind friendly',
];

const testimonials = [
  {
    quote: "The voice input feature has been a game-changer. I can record notes while focusing on the person I'm caring for.",
    author: "Sarah, Care Assistant",
    age: "58"
  },
  {
    quote: "As someone with arthritis, the voice control and easy-to-use interface make documentation so much easier.",
    author: "James, Home Carer",
    age: "62"
  }
];

export default function DailyRecordingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Daily Care Recording Made Simple</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Document care notes quickly and easily, with accessibility features that work for everyone.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/demo">Try It Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/resources/documentation/daily-notes">View Examples</Link>
            </Button>
          </div>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-6">
                <div className="flex gap-4">
                  <Icon className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Accessibility Section */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Accessibility for All</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {accessibilityFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">What Caregivers Say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.quote} className="p-6">
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <p className="font-semibold">{testimonial.author}, {testimonial.age}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you every step of the way.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/demo">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
