'use client';

/**
 * @writecarenotes.com
 * @fileoverview Marketing page for domiciliary care services
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Marketing landing page for domiciliary care services showcasing key features,
 * benefits, and service offerings. Implements mobile-first design principles
 * and enterprise-grade UI components for optimal user experience.
 */

// React and Framework imports
import { FC, useEffect } from 'react';
import Link from 'next/link';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ShareButtons } from '@/components/marketing/ShareButtons';

// Analytics hooks
import { usePathname } from 'next/navigation';

// Icons
import {
  Home,
  Heart,
  ShoppingBag,
  Utensils,
  Users,
  Activity,
  Clock,
  Pill,
  LucideIcon
} from 'lucide-react';

// Types and interfaces
interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

// Style constants
const STYLE_CONSTANTS = {
  buttonBase: "w-full sm:w-auto min-w-[200px] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
  buttonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
  buttonSecondary: "border-2 border-white hover:bg-white hover:text-blue-600 text-white",
  sectionPadding: "py-16",
  containerPadding: "container mx-auto px-4",
  headingLarge: "text-4xl md:text-5xl font-bold",
  headingMedium: "text-2xl md:text-3xl font-bold",
} as const;

// Constants and configurations
const features: Feature[] = [
  {
    title: 'Personal Care',
    description: 'Dignified assistance with personal care needs in the comfort of home.',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    title: 'Medication Support',
    description: 'Reliable medication management and administration assistance.',
    icon: Pill,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Household Support',
    description: 'Help with maintaining a clean and organized living environment.',
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Meal Preparation',
    description: 'Nutritious meal planning and preparation services.',
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    title: 'Shopping Assistance',
    description: 'Support with shopping and essential errands.',
    icon: ShoppingBag,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Social Companionship',
    description: 'Regular companionship and social interaction.',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

const benefits: string[] = [
  'Independence at home',
  'Personalized care plans',
  'Flexible support hours',
  'Trained care staff',
  'Regular care reviews',
  'Emergency support'
];

// Reusable button component
const ActionButton: FC<ButtonProps> = ({ href, children, variant = 'primary', className = '' }) => (
  <Button 
    asChild
    size="lg"
    className={`${STYLE_CONSTANTS.buttonBase} ${
      variant === 'primary' ? STYLE_CONSTANTS.buttonPrimary : STYLE_CONSTANTS.buttonSecondary
    } ${className}`}
  >
    <Link href={href}>{children}</Link>
  </Button>
);

// Analytics hook implementation
const useAnalytics = () => {
  const trackPageView = (page: string) => {
    // Implement your analytics tracking here
    console.log(`Page view tracked: ${page}`);
  };

  const trackCTAClick = (page: string, ctaType: string) => {
    // Implement your CTA click tracking here
    console.log(`CTA clicked: ${ctaType} on ${page}`);
  };

  return { trackPageView, trackCTAClick };
};

const DomiciliaryCarePage: FC = () => {
  // Analytics hooks
  const { trackPageView, trackCTAClick } = useAnalytics();

  // Track page view on mount
  useEffect(() => {
    trackPageView('domiciliary-care');
  }, []);

  const handleCTAClick = (ctaType: string) => {
    trackCTAClick('domiciliary-care', ctaType);
  };

  const handleShare = (platform: string) => {
    trackCTAClick('domiciliary-care', `share_${platform}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-24" role="banner">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" aria-hidden="true" />
        </div>
        <div className={STYLE_CONSTANTS.containerPadding}>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className={STYLE_CONSTANTS.headingLarge}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Domiciliary Care Services
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Professional care services delivered in the comfort of your own home, supporting independence and quality of life.
            </p>
            <ShareButtons 
              url={typeof window !== 'undefined' ? window.location.href : 'https://writecarenotes.com/support/domiciliary-care'}
              title="Domiciliary Care Services | Write Care Notes"
              description="Professional care services delivered in the comfort of your own home, supporting independence and quality of life."
              className="justify-center"
              onShare={handleShare}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={STYLE_CONSTANTS.sectionPadding} aria-labelledby="features-heading">
        <div className={STYLE_CONSTANTS.containerPadding}>
          <h2 id="features-heading" className="sr-only">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  role="article"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.bgColor}`} aria-hidden="true">
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${feature.color}`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`${STYLE_CONSTANTS.sectionPadding} bg-white`} aria-labelledby="benefits-heading">
        <div className={STYLE_CONSTANTS.containerPadding}>
          <h2 id="benefits-heading" className={`${STYLE_CONSTANTS.headingMedium} text-center mb-12`}>Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3" role="listitem">
                <div className="flex-shrink-0 h-5 w-5 text-blue-600" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Action Buttons */}
      <section className="py-12 bg-white border-t" role="complementary">
        <div className={STYLE_CONSTANTS.containerPadding}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ActionButton 
              href="/support" 
              variant="primary"
              onClick={() => handleCTAClick('view-care-types')}
            >
              View All Care Types
            </ActionButton>
            <ActionButton 
              href="/demo" 
              variant="primary"
              onClick={() => handleCTAClick('request-demo')}
            >
              Request Demo
            </ActionButton>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50" role="complementary">
        <div className={STYLE_CONSTANTS.containerPadding}>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className={`${STYLE_CONSTANTS.headingMedium} mb-4`}>
              Ready to Learn More?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover how our domiciliary care services can support independent living at home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ActionButton 
                href="/contact" 
                variant="secondary"
                className="bg-white hover:bg-gray-50 text-blue-600"
                onClick={() => handleCTAClick('contact')}
              >
                Contact Our Team
              </ActionButton>
              <ActionButton 
                href="/demo" 
                variant="secondary"
                onClick={() => handleCTAClick('book-demo')}
              >
                Book a Demo
              </ActionButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DomiciliaryCarePage;
