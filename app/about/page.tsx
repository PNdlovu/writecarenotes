import { About } from '@/components/landing/About';
import { Button } from '@/components/ui/button';
import {
  Users,
  Heart,
  Target,
  Award,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import Link from 'next/link';

const values = [
  {
    icon: Heart,
    title: 'Person-Centered Care',
    description: 'We believe in putting residents first, ensuring their dignity, independence, and individual needs are always prioritized.'
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'Continuously improving our platform with the latest technology to provide better care management solutions.'
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Working closely with care homes, staff, and families to create solutions that work for everyone.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Committed to maintaining the highest standards in both our software and support services.'
  }
];

const achievements = [
  {
    number: '500+',
    label: 'Care Homes',
    description: 'Trust our platform across the UK'
  },
  {
    number: '20,000+',
    label: 'Care Staff',
    description: 'Use our system daily'
  },
  {
    number: '50,000+',
    label: 'Residents',
    description: 'Receiving better care'
  },
  {
    number: '99.9%',
    label: 'Uptime',
    description: 'System reliability'
  }
];

const contactInfo = [
  {
    icon: Building,
    title: 'Main Office',
    details: '123 Care Tech Park, Innovation District'
  },
  {
    icon: MapPin,
    title: 'Location',
    details: 'London, EC2A 1NQ, United Kingdom'
  },
  {
    icon: Phone,
    title: 'Phone',
    details: '+44 (0) 20 1234 5678'
  },
  {
    icon: Mail,
    title: 'Email',
    details: 'contact@carehometech.com'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transforming Care Home Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're on a mission to revolutionize care home management through innovative technology,
              enabling care providers to focus on what matters most - providing exceptional care.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/demo">Book a Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background" aria-labelledby="our-values">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" id="our-values">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-all">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-primary/5" aria-labelledby="our-impact">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" id="our-impact">Our Impact</h2>
            <p className="text-xl text-muted-foreground">
              Making a difference in care homes across the UK
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-background">
                <div className="text-4xl font-bold text-primary mb-2">
                  {achievement.number}
                </div>
                <div className="text-lg font-semibold mb-2">{achievement.label}</div>
                <p className="text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-background" aria-labelledby="our-journey">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" id="our-journey">Our Journey</h2>
            <p className="text-xl text-muted-foreground">
              Key milestones in our mission to improve care home management
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <TimelineItem year="2020" title="Company Founded" 
                description="Started with a vision to transform care home management" />
              <TimelineItem year="2021" title="First 100 Care Homes" 
                description="Reached our first major milestone of serving 100 care homes" />
              <TimelineItem year="2022" title="Mobile App Launch" 
                description="Launched our mobile application for better accessibility" />
              <TimelineItem year="2023" title="UK Expansion" 
                description="Expanded operations across the entire United Kingdom" />
              <TimelineItem year="2024" title="Next Generation Platform" 
                description="Launched our next-generation care management platform" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-primary/5" aria-labelledby="contact-us">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" id="contact-us">Contact Us</h2>
            <p className="text-xl text-muted-foreground">
              Get in touch with our team
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg bg-background">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                  <p className="text-muted-foreground">{info.details}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/demo">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineItem({ year, title, description }: { year: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 w-px bg-border"></div>
      </div>
      <div className="pb-8">
        <div className="text-sm text-muted-foreground mb-1">{year}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
