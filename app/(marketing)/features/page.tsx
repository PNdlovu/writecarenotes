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
  Activity,
  Headphones,
  Network,
  KeyRound,
  Cog,
  Quote,
  Heart,
  Settings,
  Zap,
  Star,
  LinkIcon,
  Tablet,
  Globe
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Features } from "@/components/marketing/Features"

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

export default function FeaturesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section with Features Component */}
      <Features />

      {/* Core Features Overview - 3 cards */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Core Features</Badge>
            <h2 className="text-3xl font-bold mb-4">Complete Care Home Management</h2>
            <p className="text-gray-600">
              An all-in-one solution designed to streamline your care home operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Resident Care */}
            <Card className="p-6">
              <div className="mb-4">
                <Heart className="h-10 w-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Resident Care</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Care Planning & Assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Medication Management (eMAR)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Health Monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Incident Reporting</span>
                </li>
              </ul>
            </Card>

            {/* Operations Management */}
            <Card className="p-6">
              <div className="mb-4">
                <Settings className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Operations</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Staff Scheduling & Rota</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Bed Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Visitor Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Maintenance Tracking</span>
                </li>
              </ul>
            </Card>

            {/* Administration */}
            <Card className="p-6">
              <div className="mb-4">
                <FileText className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Administration</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Financial Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>HR & Training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Document Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Compliance & Auditing</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Medication Management - 4 cards */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Medication Management</Badge>
            <h2 className="text-3xl font-bold mb-4">Advanced eMAR and Medication Safety</h2>
            <p className="text-gray-600">
              Comprehensive medication management with advanced safety features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="mb-4">
                <Tablets className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Medication Safety</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Barcode verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Drug interactions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Allergy alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Photo identification</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <ClipboardCheck className="h-10 w-10 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Stock Control</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Stock levels</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Expiry tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Reorder automation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Waste management</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <FileText className="h-10 w-10 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">eMAR Reporting</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>MAR charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Missed doses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>PRN tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Audit reports</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Shield className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Access Control</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Role-based access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Digital signatures</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Controlled drugs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Emergency access</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Portal Features - 4 cards */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Portal Features</Badge>
            <h2 className="text-3xl font-bold mb-4">Secure Multi-Portal Access</h2>
            <p className="text-gray-600">
              Dedicated portals for all stakeholders with enterprise-grade security
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="mb-4">
                <Users className="h-10 w-10 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Family Portal</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Care updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Photo sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Visit scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Message staff</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Stethoscope className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Portal</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>GP access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Clinical notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Test results</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Care collaboration</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <UserCog className="h-10 w-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Staff Portal</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Shift management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Training access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Document library</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Performance reviews</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Shield className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Portal Security</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Role permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Access controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Audit logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>2FA support</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Features - 3 cards */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Integration</Badge>
            <h2 className="text-3xl font-bold mb-4">Seamless Integration</h2>
            <p className="text-gray-600">
              Connect with your existing systems and third-party services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="mb-4">
                <Network className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Healthcare Systems</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>NHS Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>GP Systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Pharmacy Systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Lab Results</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Wallet className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Systems</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Accounting Software</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Payroll Systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>HR Platforms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Analytics Tools</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Cog className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Custom Solutions</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>REST API</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Data Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Custom Fields</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-12 border-y border-gray-200 w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">256-bit</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">GDPR</div>
              <div className="text-sm text-gray-600">Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Enterprise Features - 3 cards */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Enterprise Platform</Badge>
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Care Management</h2>
            <p className="text-gray-600">
              Comprehensive solution designed for multi-site care organizations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Core Operations */}
            <Card className="p-6">
              <div className="mb-4">
                <Building2 className="h-10 w-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Core Operations</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Multi-Site Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Advanced Bed Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Asset Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Incident Management</span>
                </li>
              </ul>
            </Card>

            {/* Staff Management */}
            <Card className="p-6">
              <div className="mb-4">
                <Users className="h-10 w-10 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Staff Management</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Advanced Scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Performance Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Training Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Compliance Monitoring</span>
                </li>
              </ul>
            </Card>

            {/* Financial Management */}
            <Card className="p-6">
              <div className="mb-4">
                <Wallet className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Financial Suite</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Advanced Accounting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Integrated Payroll</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Multi-Currency Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Financial Reporting</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Clinical Features - 4 cards */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Clinical Excellence</Badge>
            <h2 className="text-3xl font-bold mb-4">Advanced Clinical Management</h2>
            <p className="text-gray-600">
              Comprehensive clinical tools for superior care delivery
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Assessment Management */}
            <Card className="p-6">
              <div className="mb-4">
                <ClipboardCheck className="h-10 w-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Assessment Suite</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Care Need Assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Risk Assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Custom Assessment Forms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Progress Tracking</span>
                </li>
              </ul>
            </Card>

            {/* Medication Management */}
            <Card className="p-6">
              <div className="mb-4">
                <Tablets className="h-10 w-10 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced eMAR</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Barcode Scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Real-time Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Medication Reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>PRN Protocols</span>
                </li>
              </ul>
            </Card>

            {/* Wellness Management */}
            <Card className="p-6">
              <div className="mb-4">
                <Activity className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Wellness Activities</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Activity Planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Health Monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Nutrition Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Wellness Reports</span>
                </li>
              </ul>
            </Card>

            {/* Care Planning */}
            <Card className="p-6">
              <div className="mb-4">
                <FileText className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Care Planning</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Person-Centered Plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Dynamic Updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Family Collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Outcome Tracking</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Features - 4 cards */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Enterprise Features</Badge>
            <h2 className="text-3xl font-bold mb-4">Advanced Platform Capabilities</h2>
            <p className="text-gray-600">
              Enterprise-grade features for complex care organizations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Access Management */}
            <Card className="p-6">
              <div className="mb-4">
                <KeyRound className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Access Management</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Role-Based Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Emergency Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Audit Logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>SSO Integration</span>
                </li>
              </ul>
            </Card>

            {/* Customization */}
            <Card className="p-6">
              <div className="mb-4">
                <Settings className="h-10 w-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customization</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Brand Customization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Email Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Custom Reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Dark Mode Support</span>
                </li>
              </ul>
            </Card>

            {/* Regional Support */}
            <Card className="p-6">
              <div className="mb-4">
                <Globe className="h-10 w-10 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Regional Support</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>UK & Ireland Coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Multi-Language Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Regional Compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Local Support Teams</span>
                </li>
              </ul>
            </Card>

            {/* Mobile Access */}
            <Card className="p-6">
              <div className="mb-4">
                <Tablet className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mobile & Offline</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Mobile Apps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Tablet Optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Offline Capability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Auto-Sync</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration & Security - 3 cards */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Integration & Security</Badge>
            <h2 className="text-3xl font-bold mb-4">Enterprise Integration</h2>
            <p className="text-gray-600">
              Secure integration with healthcare and business systems
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="mb-4">
                <Network className="h-10 w-10 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Healthcare Systems</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>NHS Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>GP Connect</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Pharmacy Systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Healthcare APIs</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <LinkIcon className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Systems</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Accounting Software</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Payroll Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>HR Systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>CRM Integration</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <Shield className="h-10 w-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Security & Compliance</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>GDPR Compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Data Encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Regular Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Backup & Recovery</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Module - 4 cards */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4" variant="outline">Documentation</Badge>
            <h2 className="text-3xl font-bold mb-4">Advanced Documentation Module</h2>
            <p className="text-gray-600">
              Comprehensive documentation management with regulatory compliance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Care Documentation */}
            <Card className="p-6">
              <div className="mb-4">
                <FileText className="h-10 w-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Care Documentation</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Care Plans & Reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Risk Assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Daily Notes & Handovers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Incident Reports</span>
                </li>
              </ul>
            </Card>

            {/* Compliance Records */}
            <Card className="p-6">
              <div className="mb-4">
                <BookOpen className="h-10 w-10 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Compliance Records</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Regulatory Documentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Policy Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Audit Trail Records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Inspection Reports</span>
                </li>
              </ul>
            </Card>

            {/* Document Management */}
            <Card className="p-6">
              <div className="mb-4">
                <Laptop className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Management</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Version Control</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Digital Signatures</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Document Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Secure Storage</span>
                </li>
              </ul>
            </Card>

            {/* Advanced Features */}
            <Card className="p-6">
              <div className="mb-4">
                <Zap className="h-10 w-10 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Smart Forms & Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Automated Workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Bulk Document Processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>AI-Powered Analytics</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 text-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Care Home?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of care homes already using our platform to deliver outstanding care
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/demo">Book a Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white hover:bg-blue-500">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 