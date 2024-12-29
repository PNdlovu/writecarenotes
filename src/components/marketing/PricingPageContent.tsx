'use client'

import dynamic from 'next/dynamic'
import { PricingPlans } from "./PricingPlans"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { 
  Zap, 
  Shield, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  GraduationCap,
  Clock,
  Award,
  HeartPulse
} from "lucide-react"

const regions = [
  {
    name: "England",
    regulator: "CQC",
    icon: Shield
  },
  {
    name: "Wales",
    regulator: "CIW",
    icon: Shield
  },
  {
    name: "Scotland",
    regulator: "Care Inspectorate",
    icon: Shield
  },
  {
    name: "Northern Ireland",
    regulator: "RQIA",
    icon: Shield
  }
]

const trustSignals = [
  { 
    number: "99.9%", 
    label: "Uptime SLA", 
    icon: Clock,
    description: "Enterprise-grade reliability you can count on"
  },
  { 
    number: "24/7", 
    label: "Support", 
    icon: HeartPulse,
    description: "Round-the-clock assistance when you need it"
  },
  { 
    number: "GDPR", 
    label: "Compliant", 
    icon: Shield,
    description: "Highest level of data security standards"
  },
  { 
    number: "UK Only", 
    label: "Data Storage", 
    icon: Building2,
    description: "Your data never leaves the UK"
  }
]

const complianceFeatures = [
  {
    title: "Regional Compliance",
    description: "Tailored compliance tools for CQC, CIW, Care Inspectorate, and RQIA standards",
    icon: Shield,
    included: "All plans"
  },
  {
    title: "Data Protection",
    description: "GDPR-compliant with role-based access control and audit trails",
    icon: Shield,
    included: "All plans"
  },
  {
    title: "Healthcare Integration",
    description: "NHS Digital compliance and secure integration with healthcare systems",
    icon: Shield,
    included: "Professional & Enterprise"
  },
  {
    title: "Accessibility",
    description: "WCAG 2.1 AA compliant, ensuring access for all staff members",
    icon: Shield,
    included: "All plans"
  }
]

const keyBenefits = [
  {
    icon: Users,
    title: "Staff Management",
    description: "Streamline rotas, training records, and certifications in one place"
  },
  {
    icon: HeartPulse,
    title: "Care Planning",
    description: "Person-centered care plans with risk assessments and outcomes tracking"
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description: "Built-in audits and compliance monitoring for regulatory standards"
  },
  {
    icon: Zap,
    title: "Digital Transformation",
    description: "Reduce paperwork and improve accuracy with digital care records"
  },
  {
    icon: HeartPulse,
    title: "Mobile Ready",
    description: "Work seamlessly across all devices with offline capabilities"
  },
  {
    icon: GraduationCap,
    title: "Knowledge Base",
    description: "Comprehensive resources and best practice guidelines"
  }
]

const faqs = [
  {
    question: "How does the free basic plan work?",
    answer: "Our free basic plan includes essential care home management features for up to 10 residents. You get access to core functionality including basic care planning, staff management, and compliance tools. No credit card is required, and you can upgrade to a paid plan anytime as your needs grow."
  },
  {
    question: "Can I switch between plans?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to additional features. If you downgrade, you'll maintain access to your current features until the end of your billing period."
  },
  {
    question: "Is there a minimum contract period?",
    answer: "No, we offer monthly billing with no long-term commitment required. You can cancel your subscription at any time."
  },
  {
    question: "What integrations are available?",
    answer: "Our Standard and Premium plans include integrations with NHS Spine, GP Connect, hospitals, and pharmacies. These integrations help streamline communication and ensure accurate resident information across healthcare providers."
  },
  {
    question: "How does the multi-home management work?",
    answer: "For care groups, our platform offers a comprehensive multi-home dashboard where you can manage all your care homes in one place. This includes resident transfers between homes, cross-home reporting, and resource sharing. The Premium plan offers advanced features like custom analytics and reporting across all homes."
  },
  {
    question: "What's included in the Professional Access portal?",
    answer: "The Professional Access portal provides secure access for families, CQC inspectors, and social services. Each stakeholder gets role-specific views and permissions, ensuring they see only the information relevant to them. Emergency access is also available for healthcare professionals when needed."
  },
  {
    question: "How secure is my data?",
    answer: "Your data is hosted on Microsoft Azure in UK-based data centers (South UK and Dublin), ensuring data sovereignty and compliance with UK regulations. We use bank-grade encryption, role-based access control, and maintain GDPR compliance. All data is backed up regularly, with real-time backups available in Premium plans."
  },
  {
    question: "Can I export my data?",
    answer: "Yes, all plans include data export capabilities. The Free plan supports CSV exports, Standard adds Excel exports, and Premium supports all formats including custom exports. You maintain full ownership of your data at all times."
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "You'll have 30 days to export your data after cancellation. After this period, your data will be securely deleted from our systems in accordance with our data retention policies and GDPR requirements."
  },
  {
    question: "What training is provided?",
    answer: "Free plans include access to our documentation. Standard plans include online group training sessions. Premium plans offer custom training programs and on-site training options. All plans have access to our comprehensive help center."
  },
  {
    question: "How do I get support?",
    answer: "Free plans have access to community support. Standard plans include email and phone support during business hours. Premium plans get priority 24/7 support and a dedicated account manager."
  },
  {
    question: "Do you help with implementation?",
    answer: "Yes, we offer different levels of implementation support. Free plans include self-service setup guides. Standard plans include guided implementation support. Premium plans receive full-service implementation with dedicated project managers."
  },
  {
    question: "How do you ensure medication safety?",
    answer: "Our medication management system includes multiple safety features: PIN verification for staff, mandatory witness requirements for certain medications, and barcode scanning to verify correct medication and dosage. These features work together to prevent errors and ensure safe medication administration."
  }
]

export function PricingPageContent() {
  return (
    <div className="relative">
      {/* Hero Section - Enhanced */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your Care Delivery
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join over 500 care homes using Write Care Notes to deliver outstanding care, stay compliant, and reduce admin time by 40%
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/demo"
                className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="text-blue-600 text-4xl font-bold">40%</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduced Admin Time</h3>
            <p className="text-gray-600">Streamline your documentation and spend more time caring for residents</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="text-blue-600 text-4xl font-bold">100%</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inspection Ready</h3>
            <p className="text-gray-600">Always be prepared with compliant documentation and instant report generation</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <HeartPulse className="h-8 w-8 text-blue-600" />
              <div className="text-blue-600 text-4xl font-bold">24/7</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">UK Support</h3>
            <p className="text-gray-600">Expert support team available around the clock to help you succeed</p>
          </div>
        </div>
      </div>

      {/* Customer Quote */}
      <div className="bg-blue-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <figure className="mx-auto max-w-4xl">
            <blockquote className="relative text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
              <p>
                "Write Care Notes has transformed how we deliver care. The system is intuitive, reliable, and the support team is exceptional. It's helped us achieve and maintain our Outstanding CQC rating."
              </p>
            </blockquote>
            <figcaption className="mt-8 text-center">
              <div className="text-base font-semibold text-gray-900">Sarah Thompson</div>
              <div className="mt-1 text-gray-600">Care Home Manager, Sunrise Care Group</div>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* UK Regions Section */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Supporting Care Homes Across the UK
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((region) => (
              <div key={region.name} className="bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-blue-50 mb-4">
                  <region.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{region.name}</h3>
                <p className="text-gray-600">{region.regulator}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise-Grade Infrastructure</h2>
            <p className="text-lg text-gray-600">Built for reliability, security, and compliance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Uptime */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">99.9%</h3>
                <p className="font-semibold text-gray-900">Uptime SLA</p>
                <p className="text-sm text-gray-600">Enterprise-grade reliability you can count on</p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 rounded-lg bg-blue-50">
                  <HeartPulse className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">24/7</h3>
                <p className="font-semibold text-gray-900">Support</p>
                <p className="text-sm text-gray-600">Round-the-clock assistance when you need it</p>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Shield className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">GDPR</h3>
                <p className="font-semibold text-gray-900">Compliant</p>
                <p className="text-sm text-gray-600">Enterprise-level security standards</p>
              </div>
            </div>

            {/* Data Storage */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Building2 className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Azure Cloud</h3>
                <p className="font-semibold text-gray-900">UK & Ireland</p>
                <p className="text-sm text-gray-600">Data stored in regional data centers</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600">
              Powered by Microsoft Azure with data centers in South UK and Dublin, ensuring data sovereignty and regional compliance
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise-Grade Security & Compliance</h2>
            <p className="text-lg text-gray-600">Your data security and compliance is our top priority</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Data Centers */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Building2 className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">UK-Based Data Centers</h3>
                  <p className="mt-2 text-sm text-gray-600">Hosted on Microsoft Azure data centers in South UK and Dublin, ensuring data sovereignty and compliance with UK regulations.</p>
                </div>
              </div>
            </div>

            {/* Regional Compliance */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Shield className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Regional Standards Compliance</h3>
                  <p className="mt-2 text-sm text-gray-600">Fully compliant with CQC, CIW, Care Inspectorate, RQIA, and Ofsted requirements for care documentation and record-keeping.</p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Shield className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Enterprise Security</h3>
                  <p className="mt-2 text-sm text-gray-600">Bank-grade encryption, role-based access control, and continuous security monitoring. GDPR compliant with built-in data protection features.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Care Home Management
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to deliver outstanding care
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {keyBenefits.map((benefit) => (
            <Card key={benefit.title} className="p-6 border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <benefit.icon className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="relative z-10 py-16 bg-gray-50" id="compare">
        <div className="text-center mb-12">
          <Badge 
            variant="secondary" 
            className="mb-4 bg-blue-700 text-white"
          >
            Including Free Plan
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600">
            Start with our free basic plan or upgrade for advanced features
          </p>
        </div>
        <PricingPlans />
      </div>

      {/* Detailed Plan Comparison */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50" id="compare">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Compare Plan Features</h2>
            <p className="text-lg text-gray-600">Choose the plan that's right for your care home</p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg border border-blue-100">
              <div className="grid grid-cols-4 gap-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-white">
                <div className="font-semibold text-gray-900">Features</div>
                <div className="font-semibold text-center text-gray-900">Basic<div className="text-sm text-gray-600">Free forever</div></div>
                <div className="font-semibold text-center text-gray-900">Standard<div className="text-sm text-gray-600">£3.75/resident/month</div></div>
                <div className="font-semibold text-center text-gray-900">Premium<div className="text-sm text-gray-600">£4.50/resident/month</div></div>
              </div>

              {/* Core Features */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Core Features</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Number of Residents</div>
                    <div className="text-center">Up to 10</div>
                    <div className="text-center">Unlimited</div>
                    <div className="text-center">Unlimited</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">User Accounts</div>
                    <div className="text-center">3</div>
                    <div className="text-center">Unlimited</div>
                    <div className="text-center">Unlimited</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Storage Space</div>
                    <div className="text-center">5GB</div>
                    <div className="text-center">50GB</div>
                    <div className="text-center">Unlimited</div>
                  </div>
                </div>
              </div>

              {/* Care Planning */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Care Planning</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Care Plan Creation</div>
                    <div className="text-center">Basic Templates</div>
                    <div className="text-center">Full System</div>
                    <div className="text-center">Custom Templates</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Risk Assessments</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Daily Notes</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Care Reviews</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Family Portal</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                </div>
              </div>

              {/* Medication Management */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Medication Management</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">eMAR System</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">PIN Verification</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Witness Requirements</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Barcode Scanning</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Medication Rounds</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Stock Management</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">PRN Protocols</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Custom</div>
                  </div>
                </div>
              </div>

              {/* Staff Management */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Staff Management</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Rota Management</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Training Records</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Staff Communication</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Performance Management</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                </div>
              </div>

              {/* Reporting & Analytics */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Reporting & Analytics</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Standard Reports</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Full</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Custom Reports</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Limited</div>
                    <div className="text-center">Unlimited</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Analytics Dashboard</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Data Export</div>
                    <div className="text-center">CSV Only</div>
                    <div className="text-center">CSV, Excel</div>
                    <div className="text-center">All Formats</div>
                  </div>
                </div>
              </div>

              {/* Reception & Visitors Management */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Reception & Visitors Management</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Digital Visitor Sign-in</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Professional Visit Scheduling</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Maintenance Visit Tracking</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Family Visit Management</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Visitor Analytics & Reporting</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                  </div>
                </div>
              </div>

              {/* Support & Training */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Support & Training</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Support Access</div>
                    <div className="text-center">Community</div>
                    <div className="text-center">Email & Phone</div>
                    <div className="text-center">Priority 24/7</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Training Sessions</div>
                    <div className="text-center">Documentation</div>
                    <div className="text-center">Online Group</div>
                    <div className="text-center">Custom & On-site</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Account Management</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Shared</div>
                    <div className="text-center">Dedicated</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Implementation Support</div>
                    <div className="text-center">Self-service</div>
                    <div className="text-center">Guided</div>
                    <div className="text-center">Full Service</div>
                  </div>
                </div>
              </div>

              {/* Compliance & Security */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Compliance & Security</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Regional Compliance</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Full</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Audit Trails</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Access Controls</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Data Backup</div>
                    <div className="text-center">Daily</div>
                    <div className="text-center">Real-time</div>
                    <div className="text-center">Custom</div>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Healthcare Integrations</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">NHS Spine</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">GP Connect</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Hospital Integration</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Pharmacy Integration</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                </div>
              </div>

              {/* Clinical Modules */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Clinical Modules</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Pain Management</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Telehealth</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Activities Management</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Full</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Nutrition & Hydration</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                </div>
              </div>

              {/* Financial Management */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Financial Management</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Accounting Module</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Payroll System</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Billing Management</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Financial Reporting</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                  </div>
                </div>
              </div>

              {/* Multi-Home Management */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Multi-Home Management</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Group Dashboard</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Resident Transfer</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Cross-Home Reporting</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Resource Sharing</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Advanced</div>
                  </div>
                </div>
              </div>

              {/* Professional Access */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Professional Access</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Family Portal</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">CQC Portal</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Social Services Access</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Emergency Access</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                </div>
              </div>

              {/* Document Management */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Document Management</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Basic Document Storage</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Document Categories</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Document Templates</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Version Control</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Document Workflows</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Document Analytics</div>
                    <div className="text-center">✖</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                  </div>
                </div>
              </div>

              {/* Core Features & Security */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Core Features & Security</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Offline Operation</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Geolocation Tracking</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Magic Link Authentication</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                    <div className="text-center">✓</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Multi-Factor Authentication</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Consent Management</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                </div>
              </div>

              {/* Clinical Features */}
              <div className="mb-8">
                <div className="bg-blue-50 p-4 border-y border-blue-100">
                  <h3 className="font-semibold text-gray-900">Clinical Features</h3>
                </div>
                <div className="bg-white">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Advanced Handover</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
                    <div className="text-gray-700">Incident Management</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Advanced</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="text-gray-700">Assessment Tools</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Advanced</div>
                    <div className="text-center">Custom</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Features */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Enterprise-Grade Security & Compliance
          </h2>
          <p className="text-lg text-gray-600">
            Meeting and exceeding industry standards
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {complianceFeatures.map((feature) => (
            <Card key={feature.title} className="p-6 border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50">
                  <feature.icon className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                  <Badge variant="secondary" className="mt-3 bg-blue-50 text-blue-700">
                    {feature.included}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Care Types Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tailored for All Care Settings
          </h2>
          <p className="text-lg text-gray-600">
            Specialized features for both adult care homes and children's residential services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Adult Care Homes</h3>
            <ul className="text-gray-600 space-y-3">
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                Care planning and assessments
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                Medication management
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                End of life care documentation
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Children's Homes</h3>
            <ul className="text-gray-600 space-y-3">
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                Education tracking & progress reports
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                Safeguarding measures
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                Family contact management
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                Development monitoring
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our care home software
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {/* Pricing & Plans */}
            <AccordionItem 
              value="pricing-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does the free basic plan work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our free basic plan includes essential care home management features for up to 10 residents. You get access to core functionality including basic care planning, staff management, and compliance tools. No credit card is required, and you can upgrade to a paid plan anytime as your needs grow.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="pricing-2"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                Can I switch between plans?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to additional features. If you downgrade, you'll maintain access to your current features until the end of your billing period.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="pricing-3"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                Is there a minimum contract period?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                No, there are no long-term contracts. You can cancel your subscription whenever you want. We believe in earning your business every month.
              </AccordionContent>
            </AccordionItem>

            {/* Features & Integrations */}
            <AccordionItem 
              value="features-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What integrations are available?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our Standard and Premium plans include integrations with NHS Spine, GP Connect, hospitals, and pharmacies. These integrations help streamline communication and ensure accurate resident information across healthcare providers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-2"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does the multi-home management work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                For care groups, our platform offers a comprehensive multi-home dashboard where you can manage all your care homes in one place. This includes resident transfers between homes, cross-home reporting, and resource sharing. The Premium plan offers advanced features like custom analytics and reporting across all homes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-3"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What's included in the Professional Access portal?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                The Professional Access portal provides secure access for families, CQC inspectors, and social services. Each stakeholder gets role-specific views and permissions, ensuring they see only the information relevant to them. Emergency access is also available for healthcare professionals when needed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-4"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                Can the system adapt to different types of care homes?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Yes, our system is highly configurable to support various care settings including residential, nursing, dementia, and specialist care homes. Whether you're a single home or a large group, the system scales to match your needs while maintaining consistent performance and functionality. This includes region-specific inspection frameworks, reporting templates, and compliance analytics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-5"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What does the Reception Assist module include?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our Reception Assist module provides comprehensive visitor management for all types of visitors. Features include digital sign-in, professional visit scheduling (healthcare, CQC, social workers), maintenance visit tracking, family visit management, and detailed visitor analytics. The system helps maintain security, streamline the reception process, and provide valuable insights into visitor patterns.
              </AccordionContent>
            </AccordionItem>

            {/* Medication Safety */}
            <AccordionItem 
              value="medication-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How do you ensure medication safety?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our medication management system includes multiple safety features: PIN verification for staff, mandatory witness requirements for certain medications, and barcode scanning to verify correct medication and dosage. These features work together to prevent errors and ensure safe medication administration.
              </AccordionContent>
            </AccordionItem>

            {/* Security & Compliance */}
            <AccordionItem 
              value="security-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How secure is my data?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Your data is hosted on Microsoft Azure in UK-based data centers (South UK and Dublin), ensuring data sovereignty and compliance with UK regulations. We use bank-grade encryption, role-based access control, and maintain GDPR compliance. All data is backed up regularly, with real-time backups available in Premium plans.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="security-2"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does Write Care Notes ensure compliance with different regional standards?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our system is designed to support care homes across all UK regions with built-in compliance for:
                • CQC (England)
                • CIW (Wales)
                • Care Inspectorate (Scotland)
                • RQIA (Northern Ireland)

                The system automatically adapts forms, assessments, and reports to match your region's specific requirements while maintaining consistent core functionality. This includes region-specific inspection frameworks, reporting templates, and compliance analytics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="security-3"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                Can I export my data?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Yes, all plans include data export capabilities. The Free plan supports CSV exports, Standard adds Excel exports, and Premium supports all formats including custom exports. You maintain full ownership of your data at all times.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="security-4"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What happens to my data if I cancel?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                You'll have 30 days to export your data after cancellation. After this period, your data will be securely deleted from our systems in accordance with our data retention policies and GDPR requirements.
              </AccordionContent>
            </AccordionItem>

            {/* Support & Training */}
            <AccordionItem 
              value="support-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What training and support do you provide?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                We offer different levels of support based on your plan. Free plans include access to documentation and community support. Standard plans add email and phone support during business hours, plus online group training sessions. Premium plans get priority 24/7 support, a dedicated account manager, and custom on-site training options.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="support-2"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                Do you help with implementation?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Yes, we offer different levels of implementation support. Free plans include self-service setup guides. Standard plans include guided implementation support. Premium plans receive full-service implementation with dedicated project managers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="support-3"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What kind of training do you provide?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Free plans include access to our documentation and help center. Standard plans include online group training sessions and video tutorials. Premium plans offer custom training programs, on-site training options, and regular refresher sessions. All plans have access to our comprehensive documentation and best practice guides.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="support-4"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How do you ensure accessibility for all users?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our platform is WCAG 2.1 AA compliant, ensuring accessibility for users of all abilities. Features include: screen reader compatibility, keyboard navigation, adjustable text sizes, high contrast modes, and clear, consistent navigation. We regularly test with diverse user groups to maintain accessibility standards.
              </AccordionContent>
            </AccordionItem>

            {/* Clinical Questions */}
            <AccordionItem 
              value="clinical-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What clinical modules are available?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our platform includes comprehensive clinical modules such as pain management, telehealth consultations, activities planning, and nutrition & hydration tracking. Standard and Premium plans also include advanced features like custom care plan templates and specialized assessment tools.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="clinical-2"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does the medication verification system work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our medication system uses a triple-verification approach: PIN verification for staff identity, mandatory witness requirements for controlled medications, and barcode scanning to verify correct medication and dosage. This comprehensive approach helps prevent medication errors and maintains a complete audit trail.
              </AccordionContent>
            </AccordionItem>

            {/* Regional Compliance */}
            <AccordionItem 
              value="compliance-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does the system handle different regional requirements?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our system is designed to support care homes across all UK regions with built-in compliance for:
                • CQC (England)
                • CIW (Wales)
                • Care Inspectorate (Scotland)
                • RQIA (Northern Ireland)

                The system automatically adapts forms, assessments, and reports to match your region's specific requirements while maintaining consistent core functionality. This includes region-specific inspection frameworks, reporting templates, and compliance analytics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="compliance-2"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How do you keep up with regulatory changes?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                We maintain close relationships with regulatory bodies across all UK regions and continuously update our system to reflect the latest requirements. When regulations change, we automatically update the relevant forms, assessments, and compliance frameworks. This ensures your care home always stays compliant with current standards, regardless of your location in the UK.
              </AccordionContent>
            </AccordionItem>

            {/* Document Management */}
            <AccordionItem 
              value="features-6"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What's included in the Document Management module?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our Document Management module offers comprehensive document handling capabilities. Basic features include secure document storage and organization. Advanced features include customizable templates, version control, automated workflows (like approval processes), and document analytics. Premium users get custom templates, advanced workflows, and detailed analytics for document usage and compliance tracking.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-7"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does document workflow automation work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Document workflows automate common document processes. Standard plan includes basic workflows like document approvals and review reminders. Premium plan adds advanced workflows such as multi-step approvals, conditional routing, automatic document generation based on triggers, and integration with other modules like care planning and staff management.
              </AccordionContent>
            </AccordionItem>

            {/* Core Features */}
            <AccordionItem 
              value="features-8"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does offline operation work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our system is built to work seamlessly offline. Staff can continue recording care notes, accessing resident information, and performing their duties even without internet connection. All data is securely stored locally and automatically syncs when connection is restored, ensuring no data loss and continuous care delivery.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-9"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What security features are included?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                We provide multiple layers of security: Magic Link authentication for passwordless login, Multi-Factor Authentication (MFA) for additional security, and geolocation tracking to ensure system access only from authorized locations. All plans include these core security features, with advanced options available in higher tiers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-10"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How do the advanced clinical features work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our advanced clinical features include sophisticated handover management, comprehensive incident reporting and tracking, and customizable assessment tools. The system supports detailed handover notes, incident investigation workflows, and a wide range of assessment templates. Premium users get access to custom assessment builders and advanced analytics for tracking trends and patterns.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-11"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does consent management work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our consent management system allows you to track and manage all types of consent - from care procedures to data sharing. It includes digital consent forms, consent expiry tracking, and automated renewal reminders. Premium users get custom consent workflows and detailed audit trails for regulatory compliance.
              </AccordionContent>
            </AccordionItem>

            {/* Children's Homes */}
            <AccordionItem 
              value="features-children-1"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                How does Write Care Notes support children's homes?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                Our system includes specialized features for children's residential services including education progress tracking, safeguarding measures, family contact management, and development monitoring. We comply with all Ofsted requirements and provide specific templates and workflows designed for children's homes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="features-children-2"
              className="border rounded-xl px-6 py-2 data-[state=open]:bg-blue-50/50 transition-colors"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-blue-700 py-4 [&[data-state=open]>svg]:text-blue-700">
                What safeguarding features are included for children's homes?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                We provide comprehensive safeguarding tools including incident reporting, risk assessments, behavior monitoring, and secure communication channels. The system helps maintain detailed records for child protection, enables quick reporting to relevant authorities, and ensures all documentation meets regulatory requirements.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="bg-blue-600 rounded-3xl py-24 sm:py-32 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">
            Ready to elevate your care home management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of care homes delivering outstanding care with Write Care Notes
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/demo"
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-8 py-4 text-lg font-semibold text-white ring-1 ring-inset ring-white hover:ring-blue-100 hover:bg-blue-500"
            >
              Talk to Our Team
            </Link>
          </div>
          <p className="mt-8 text-blue-100">
            Free Basic Plan • No credit card required • Up to 10 residents
          </p>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Write Care Notes?
          </h2>
          <p className="text-lg text-gray-600">
            Built for care homes, by care professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Production Ready</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Robust offline functionality</li>
              <li>• Bank-grade security</li>
              <li>• 99.9% uptime guarantee</li>
              <li>• Automatic backups</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance First</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Multi-region support</li>
              <li>• GDPR compliant</li>
              <li>• Regular updates</li>
              <li>• Audit-ready reporting</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Ready</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Multi-home support</li>
              <li>• Custom integrations</li>
              <li>• Dedicated support</li>
              <li>• Migration assistance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Care Homes Across the UK
            </h2>
            <p className="text-lg text-gray-600">
              Join hundreds of care homes delivering outstanding care with Write Care Notes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Care Homes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">UK Based</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Section */}
      <div className="bg-blue-900 text-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-white mb-4">Enterprise Solutions</h2>
              <p className="text-2xl text-blue-100 mb-16">
                Customized solutions for large care groups and organizations
              </p>
              <ul className="space-y-8 text-xl text-blue-100">
                <li className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-800/30 p-1">
                    <CheckCircle2 className="w-6 h-6 text-blue-100" />
                  </div>
                  Custom development and integrations
                </li>
                <li className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-800/30 p-1">
                    <CheckCircle2 className="w-6 h-6 text-blue-100" />
                  </div>
                  Dedicated account management
                </li>
                <li className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-800/30 p-1">
                    <CheckCircle2 className="w-6 h-6 text-blue-100" />
                  </div>
                  Priority 24/7 support
                </li>
                <li className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-800/30 p-1">
                    <CheckCircle2 className="w-6 h-6 text-blue-100" />
                  </div>
                  Custom SLAs and agreements
                </li>
              </ul>
              <div className="mt-16">
                <Link
                  href="/enterprise"
                  className="inline-flex items-center px-8 py-4 bg-white text-lg font-semibold text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Learn More About Enterprise
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-800/20 rounded-lg p-12 text-center">
                <p className="text-blue-100 text-lg">Enterprise Solutions Illustration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}