'use client';

/**
 * WriteCareNotes.com
 * @fileoverview Features Page - Enterprise Care Home Management Platform
 * @version 2.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/Tabs"
import { FeatureCard } from '@/components/ui/FeatureCard'
import { 
  Stethoscope, 
  Pill, 
  Activity, 
  Shield, 
  FileCheck, 
  Star, 
  Users, 
  Wallet, 
  Building2, 
  Network, 
  BarChart,
  Lock,
  HeadphonesIcon,
  GraduationCap,
  Heart,
  Calendar,
  FileText,
  ClipboardCheck,
  UserCog,
  ClipboardList
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function FeaturesPage() {
  return (
    <main className="flex min-h-screen flex-col" role="main">
      {/* Hero Section */}
      <section 
        className="py-16 bg-gradient-to-br from-blue-50 to-white"
        aria-labelledby="hero-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Enterprise Platform</Badge>
            <h1 
              id="hero-heading"
              className="text-4xl font-bold mb-6 tracking-tight"
            >
              Complete Care Home Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Supporting care providers across UK & Ireland with full regulatory compliance
            </p>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <Tabs defaultValue="care" className="w-full">
        <div className="container mx-auto px-4 py-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="care">Resident Management</TabsTrigger>
            <TabsTrigger value="children">Children's Home</TabsTrigger>
            <TabsTrigger value="clinical">Clinical</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          </TabsList>

          {/* Care Management Features */}
          <TabsContent value="care">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Resident Management</h2>
              <p className="text-xl text-muted-foreground">
                Comprehensive resident care and monitoring system
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Users}
                title="Core Management"
                description="Comprehensive resident management features"
                details={[
                  "Digital resident profiles",
                  "Care plan integration",
                  "Capacity assessments",
                  "Real-time dashboard",
                  "Family portal access"
                ]}
                index={0}
              />
              <FeatureCard
                icon={ClipboardCheck}
                title="Daily Care"
                description="Daily care and task management"
                details={[
                  "Digital care notes",
                  "Task management",
                  "Handover reports",
                  "Incident logging",
                  "Care reviews"
                ]}
                index={1}
              />
              <FeatureCard
                icon={Shield}
                title="Safety & Compliance"
                description="Safety and compliance management"
                details={[
                  "DoLS management",
                  "Restrictions logging",
                  "Hospital passes",
                  "Risk assessments",
                  "Compliance tracking"
                ]}
                index={2}
              />
            </div>
          </TabsContent>

          {/* Children's Home Features */}
          <TabsContent value="children">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Children's Home Management</h2>
              <p className="text-xl text-muted-foreground">
                Specialized tools for supporting young people's care and development
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={GraduationCap}
                title="Education Support"
                description="Comprehensive education support tracking"
                details={[
                  "School liaison tracking",
                  "Education meeting records",
                  "Academic progress tracking",
                  "SEN documentation",
                  "Homework support logs",
                  "Educational needs notes",
                  "School report storage",
                  "Learning assessments"
                ]}
                index={0}
              />
              <FeatureCard
                icon={Heart}
                title="Young Person Care"
                description="Complete young person care management"
                details={[
                  "Daily care records",
                  "Behavioral monitoring",
                  "Mental health support",
                  "Medication management",
                  "Health & wellbeing",
                  "Life skills development",
                  "Individual support plans",
                  "Therapeutic interventions"
                ]}
                index={1}
              />
              <FeatureCard
                icon={Users}
                title="Placement Management"
                description="Comprehensive placement management"
                details={[
                  "Placement records",
                  "Placement history",
                  "Transition planning",
                  "Social worker updates",
                  "Family contact logs",
                  "Visit management",
                  "Care authority liaison",
                  "Outcome tracking"
                ]}
                index={2}
              />
              <FeatureCard
                icon={Shield}
                title="Safeguarding"
                description="Complete safeguarding management"
                details={[
                  "Incident recording",
                  "Risk management",
                  "DBS verification",
                  "Missing from care",
                  "Safeguarding alerts",
                  "Training records",
                  "Policy compliance",
                  "Audit trails"
                ]}
                index={3}
              />
              <FeatureCard
                icon={Calendar}
                title="Daily Living"
                description="Daily living and activity management"
                details={[
                  "Activity planning",
                  "Independent living",
                  "House meetings",
                  "Keyworker sessions",
                  "Recreation tracking",
                  "Life skills assessment",
                  "Community engagement",
                  "Personal development"
                ]}
                index={4}
              />
              <FeatureCard
                icon={ClipboardList}
                title="Care Planning"
                description="Comprehensive care planning"
                details={[
                  "Care plans",
                  "Placement goals",
                  "Health records",
                  "Therapeutic notes",
                  "Progress reviews",
                  "Development tracking",
                  "Intervention plans",
                  "Outcome measurements"
                ]}
                index={5}
              />
            </div>

            {/* Ofsted Compliance Banner */}
            <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <Badge className="bg-indigo-100 text-indigo-700 mr-4">Ofsted Compliant</Badge>
                  <p className="text-sm text-gray-600">
                    Fully aligned with Children's Home Regulations 2015 and Quality Standards
                  </p>
                </div>
                <Link href="/features/compliance">
                  <Button
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Compliance Details
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* Clinical Features */}
          <TabsContent value="clinical">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Clinical Management</h2>
              <p className="text-xl text-muted-foreground">
                Advanced clinical and medication management tools
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Pill}
                title="Medication Management"
                description="Advanced medication management system"
                details={[
                  "Digital MAR charts",
                  "Medication tracking",
                  "PRN protocols",
                  "Stock management",
                  "Pharmacy integration"
                ]}
                index={0}
              />
              <FeatureCard
                icon={Activity}
                title="Health Monitoring"
                description="Comprehensive health monitoring tools"
                details={[
                  "Vital signs tracking",
                  "Wound management",
                  "Weight monitoring",
                  "Nutrition tracking",
                  "Health alerts"
                ]}
                index={1}
              />
              <FeatureCard
                icon={FileText}
                title="Documentation"
                description="Clinical documentation management"
                details={[
                  "Care plan reviews",
                  "Clinical assessments",
                  "Healthcare records",
                  "Treatment tracking",
                  "Audit trails"
                ]}
                index={2}
              />
            </div>
          </TabsContent>

          {/* Staff Features */}
          <TabsContent value="staff">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Staff Management</h2>
              <p className="text-xl text-muted-foreground">
                Complete workforce and training management
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={UserCog}
                title="Staff Administration"
                description="Complete staff administration system"
                details={[
                  "Staff profiles",
                  "Rota management",
                  "Training records",
                  "Performance tracking",
                  "Document storage"
                ]}
              />
              <FeatureCard
                icon={GraduationCap}
                title="Training & Development"
                description="Comprehensive training and development tools"
                details={[
                  "Training matrix",
                  "Certification tracking",
                  "Skills assessment",
                  "CPD monitoring",
                  "Compliance training"
                ]}
              />
              <FeatureCard
                icon={ClipboardList}
                title="Task Management"
                description="Comprehensive task management system"
                details={[
                  "Task allocation",
                  "Handover notes",
                  "Daily schedules",
                  "Team messaging",
                  "Progress tracking"
                ]}
              />
            </div>
          </TabsContent>

          {/* Compliance Features */}
          <TabsContent value="compliance" className="space-y-8">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Regulatory Compliance</h2>
              <p className="text-xl text-muted-foreground">
                Full compliance with UK & Ireland care regulations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Shield}
                title="Compliance Management"
                description="Complete compliance management system"
                details={[
                  "CQC evidence gathering",
                  "HIQA compliance",
                  "Audit trails",
                  "Policy management",
                  "Inspection readiness"
                ]}
                index={0}
              />
              <FeatureCard
                icon={FileCheck}
                title="Data Protection"
                description="Comprehensive data protection features"
                details={[
                  "End-to-end encryption",
                  "Access controls",
                  "Data retention",
                  "Subject access",
                  "Audit logging"
                ]}
                index={1}
              />
              <FeatureCard
                icon={Star}
                title="Quality Assurance"
                description="Quality assurance and improvement tools"
                details={[
                  "Quality metrics",
                  "Feedback management",
                  "Incident reporting",
                  "Improvement plans",
                  "Outcomes tracking"
                ]}
                index={2}
              />
            </div>
          </TabsContent>

          {/* Enterprise Features */}
          <TabsContent value="enterprise" className="space-y-8">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Enterprise Features</h2>
              <p className="text-xl text-muted-foreground">
                Advanced features for multi-site operations and enterprise management
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Building2}
                title="Multi-Site Management"
                description="Enterprise multi-site management"
                details={[
                  "Centralized control",
                  "Site-specific settings",
                  "Cross-site reporting",
                  "Resource sharing",
                  "Performance analytics"
                ]}
                index={0}
              />
              <FeatureCard
                icon={Shield}
                title="Access Management"
                description="Enterprise access control"
                details={[
                  "Role-based access",
                  "Custom permissions",
                  "Access audit logs",
                  "Single sign-on",
                  "Two-factor auth"
                ]}
                index={1}
              />
              <FeatureCard
                icon={Activity}
                title="Advanced Analytics"
                description="Enterprise analytics and reporting"
                details={[
                  "Custom dashboards",
                  "KPI tracking",
                  "Trend analysis",
                  "Financial insights",
                  "Performance metrics"
                ]}
                index={2}
              />
              <FeatureCard
                icon={Network}
                title="Integration Hub"
                description="Enterprise system integration"
                details={[
                  "API access",
                  "Third-party integration",
                  "Data import/export",
                  "Custom workflows",
                  "Automation tools"
                ]}
                index={3}
              />
              <FeatureCard
                icon={FileCheck}
                title="Documentation"
                description="Enterprise documentation management"
                details={[
                  "Digital forms",
                  "Template library",
                  "Document workflow",
                  "E-signatures",
                  "Audit trails"
                ]}
                index={4}
              />
              <FeatureCard
                icon={Stethoscope}
                title="Telehealth"
                description="Enterprise telehealth solutions"
                details={[
                  "Video consultations",
                  "Remote monitoring",
                  "Health tracking",
                  "Secure messaging",
                  "Family portal"
                ]}
                index={5}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Offline Capabilities */}
      <section 
        className="py-16 bg-gradient-to-br from-slate-50 to-white"
        aria-labelledby="offline-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 id="offline-heading" className="text-3xl font-bold mb-4">
              Offline Capabilities
            </h2>
            <p className="text-xl text-muted-foreground">
              Continue working without internet connection
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Care Delivery</h3>
              <p className="text-muted-foreground">Access care plans and record care notes offline</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Medication</h3>
              <p className="text-muted-foreground">Complete medication rounds without internet</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Assessments</h3>
              <p className="text-muted-foreground">Conduct and save assessments offline</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Daily Records</h3>
              <p className="text-muted-foreground">Record daily notes and observations offline</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Compliance */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fully Compliant</h3>
              <p className="text-sm text-muted-foreground">
                CQC, CIW, Care Inspectorate, RQIA & HIQA approved
              </p>
            </div>
            {/* Security */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Lock className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                ISO 27001 certified, GDPR compliant
              </p>
            </div>
            {/* Support */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <HeadphonesIcon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                UK-based care home experts
              </p>
            </div>
            {/* Reliability */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">99.9% Uptime</h3>
              <p className="text-sm text-muted-foreground">
                Regional data centers for optimal performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 border-white/30 text-white">Trusted by Leading Care Providers</Badge>
            <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">
              Ready to Transform Your Care Home?
            </h2>
            <p className="text-xl mb-4 text-blue-100">
              Join hundreds of care homes using Write Care Notes to deliver outstanding care
            </p>
            <p className="text-sm mb-10 text-blue-100">
              Available across England, Wales, Scotland, Northern Ireland, and Republic of Ireland
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="min-w-[160px] text-blue-700 bg-white hover:bg-blue-50"
              >
                <Link href="/demo">Request Demo</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[160px] text-white border-white/30 hover:bg-white/10"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}