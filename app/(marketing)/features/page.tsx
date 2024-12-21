/**
 * WriteCareNotes.com
 * @fileoverview Features Page - Product features and capabilities
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Bed,
  CalendarClock,
  ClipboardCheck,
  Users,
  FileText,
  Bell,
  Shield,
  LineChart,
  Stethoscope,
  Building2,
  Wallet,
  UserCog,
  BookOpen,
  Laptop,
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Tablets,
  Brain,
  HeartPulse,
  Scale,
  Activity
} from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Features | Write Care Notes - Care Home Management Software",
  description: "Explore the comprehensive features of Write Care Notes care home management software. From care planning to compliance management, discover how we help care homes deliver better care.",
  keywords: "care home software features, care management features, healthcare software capabilities, care home compliance, care planning software",
  openGraph: {
    title: "Features | Write Care Notes",
    description: "Comprehensive care home management features",
    type: "website"
  }
}

const mainFeatures = [
  {
    icon: <Bed className="h-12 w-12 text-blue-600" />,
    title: "Bed Management",
    description: "Real-time bed occupancy tracking, admissions management, and capacity planning across multiple facilities.",
    benefits: [
      "Live occupancy dashboard",
      "Automated bed allocation",
      "Waiting list management",
      "Multi-facility overview"
    ]
  },
  {
    icon: <CalendarClock className="h-12 w-12 text-blue-600" />,
    title: "Staff Rota & Scheduling",
    description: "Intelligent staff scheduling system that ensures optimal coverage while managing skills mix and compliance.",
    benefits: [
      "AI-powered scheduling",
      "Skills matrix integration",
      "Real-time gap analysis",
      "Mobile shift swapping"
    ]
  },
  {
    icon: <ClipboardCheck className="h-12 w-12 text-blue-600" />,
    title: "Care Planning",
    description: "Person-centered care planning tools that ensure comprehensive and consistent care delivery.",
    benefits: [
      "Dynamic care plans",
      "Risk assessments",
      "Progress tracking",
      "Family portal access"
    ]
  },
  {
    icon: <Tablets className="h-12 w-12 text-blue-600" />,
    title: "Medication Management",
    description: "Comprehensive medication administration and tracking system with built-in safety checks and barcode scanning.",
    benefits: [
      "eMAR system",
      "Barcode medication verification",
      "Medication rounds",
      "Stock management",
      "Pharmacy integration",
      "Medication error prevention"
    ]
  }
]

const complianceFeatures = [
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: "Regulatory Compliance",
    description: "Built-in compliance with CQC, HIQA, and regional care standards."
  },
  {
    icon: <FileText className="h-8 w-8 text-blue-600" />,
    title: "Documentation",
    description: "Automated document management and version control."
  },
  {
    icon: <Bell className="h-8 w-8 text-blue-600" />,
    title: "Alerts & Notifications",
    description: "Real-time alerts for incidents, tasks, and compliance deadlines."
  },
  {
    icon: <LineChart className="h-8 w-8 text-blue-600" />,
    title: "Analytics & Reporting",
    description: "Comprehensive reporting suite with customizable dashboards."
  }
]

const clinicalFeatures = [
  {
    icon: <Brain className="h-8 w-8 text-blue-600" />,
    title: "Mental Health",
    description: "Specialized assessments and monitoring tools"
  },
  {
    icon: <HeartPulse className="h-8 w-8 text-blue-600" />,
    title: "Clinical Observations",
    description: "Vital signs tracking and early warning scores"
  },
  {
    icon: <Scale className="h-8 w-8 text-blue-600" />,
    title: "Risk Management",
    description: "Comprehensive risk assessment tools"
  },
  {
    icon: <Activity className="h-8 w-8 text-blue-600" />,
    title: "Health Monitoring",
    description: "Continuous health status tracking"
  }
]

const operationalFeatures = [
  {
    icon: <Wallet className="h-8 w-8 text-blue-600" />,
    title: "Financial Management",
    description: "Invoicing, payroll, and financial reporting"
  },
  {
    icon: <UserCog className="h-8 w-8 text-blue-600" />,
    title: "HR Management",
    description: "Staff records, training, and performance management"
  },
  {
    icon: <Building2 className="h-8 w-8 text-blue-600" />,
    title: "Multi-Facility Management",
    description: "Centralized control for multiple locations"
  },
  {
    icon: <Stethoscope className="h-8 w-8 text-blue-600" />,
    title: "GP Integration",
    description: "Seamless communication with healthcare providers"
  }
]

const stats = [
  { number: "99.9%", label: "Uptime", icon: <Clock className="h-6 w-6 text-blue-600" /> },
  { number: "256-bit", label: "Encryption", icon: <Shield className="h-6 w-6 text-blue-600" /> },
  { number: "24/7", label: "Support", icon: <MessageSquare className="h-6 w-6 text-blue-600" /> },
  { number: "GDPR", label: "Certified", icon: <CheckCircle2 className="h-6 w-6 text-blue-600" /> }
]

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-100 to-blue-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-4">
            <div className="mt-8 sm:mt-12 lg:mt-8">
              <Badge className="mb-4" variant="outline">Features</Badge>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Enterprise-Grade Care Home Management
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Discover how our comprehensive suite of features helps care homes deliver exceptional care while maintaining compliance and operational efficiency.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/demo">Book a Demo</Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <Badge className="mb-4" variant="outline">Core Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need to Deliver Outstanding Care
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform combines powerful features with intuitive design to help you manage every aspect of your care home.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {mainFeatures.map((feature) => (
              <Card key={feature.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col gap-6">
                  <div className="p-3 rounded-xl bg-blue-50 w-fit group-hover:bg-blue-100 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-3 text-gray-600">{feature.description}</p>
                  </div>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-x-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Features */}
      <div className="relative bg-gray-50 py-24">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl -z-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <Badge className="mb-4" variant="outline">Compliance & Safety</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for Regulatory Compliance
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Stay compliant with industry regulations while maintaining the highest standards of care.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {complianceFeatures.map((feature) => (
                <Card key={feature.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Features */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <Badge className="mb-4" variant="outline">Clinical Excellence</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Advanced Clinical Tools
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Comprehensive clinical features to support high-quality care delivery.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {clinicalFeatures.map((feature) => (
                <Card key={feature.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Features */}
      <div className="relative bg-gray-50 py-24">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl -z-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <Badge className="mb-4" variant="outline">Operations</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Streamlined Operations
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Efficient tools to manage your care home's day-to-day operations.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {operationalFeatures.map((feature) => (
                <Card key={feature.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="relative p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute right-0 top-0 h-24 w-24 transform translate-x-8 -translate-y-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  {stat.icon}
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-blue-600">{stat.number}</div>
                  <div className="mt-2 text-base text-gray-600">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white -z-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Transform Your Care Home?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Book a demo to see how Write Care Notes can help you deliver better care.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/demo">Book a Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/pricing">View Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 