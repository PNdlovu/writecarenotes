/**
 * WriteCareNotes.com
 * @fileoverview Staff Management Resources - Tools and guides for care home staff management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { 
  Users,
  GraduationCap,
  ClipboardList,
  Calendar,
  Award,
  FileText,
  Clock,
  ChartBar,
  UserPlus,
  BookOpen,
  Medal
} from "lucide-react"

export const metadata: Metadata = {
  title: "Staff Management Resources | Write Care Notes",
  description: "Access comprehensive tools and resources for care home staff recruitment, training, and development.",
  keywords: "care staff management, staff training, recruitment, staff development, care home HR",
}

const staffingTools = [
  {
    title: "Recruitment Toolkit",
    description: "Templates and guides for effective care staff recruitment",
    icon: UserPlus,
    href: "/resources/staff-management/recruitment"
  },
  {
    title: "Training Matrix",
    description: "Track and manage staff training requirements and certifications",
    icon: GraduationCap,
    href: "/resources/staff-management/training-matrix"
  },
  {
    title: "Performance Management",
    description: "Tools for staff appraisals and performance tracking",
    icon: ChartBar,
    href: "/resources/staff-management/performance"
  },
  {
    title: "Rota Management",
    description: "Best practices for staff scheduling and rota planning",
    icon: Calendar,
    href: "/resources/staff-management/rota"
  }
]

const trainingResources = [
  {
    title: "Core Skills Framework",
    description: "Essential skills training for care home staff",
    category: "Mandatory",
    icon: BookOpen
  },
  {
    title: "Specialist Care Training",
    description: "Advanced training for specific care needs",
    category: "Advanced",
    icon: Medal
  },
  {
    title: "Leadership Development",
    description: "Management and leadership training resources",
    category: "Management",
    icon: Award
  }
]

const complianceGuides = [
  {
    title: "CQC Staff Requirements",
    description: "Guide to meeting CQC staffing regulations",
    icon: ClipboardList,
    link: "/resources/staff-management/cqc-requirements"
  },
  {
    title: "Safe Staffing Levels",
    description: "Tools for calculating and maintaining safe staffing levels",
    icon: Users,
    link: "/resources/staff-management/safe-staffing"
  },
  {
    title: "Mandatory Training Guide",
    description: "Overview of required training for care home staff",
    icon: FileText,
    link: "/resources/staff-management/mandatory-training"
  }
]

export default function StaffManagementPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Staff Management Resources
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Comprehensive tools and resources to help you recruit, train, and develop outstanding care home staff
          </p>
        </div>

        {/* Stats Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Save up to 10 hours per week on staff management tasks
          </div>
        </div>

        {/* Staffing Tools Grid */}
        <div className="mx-auto mt-16 grid gap-8 sm:mt-20 lg:mx-0 lg:grid-cols-2">
          {staffingTools.map((tool) => (
            <Card key={tool.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <tool.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {tool.description}
                  </p>
                  <Button variant="link" asChild className="mt-4 p-0">
                    <Link href={tool.href}>Access tool →</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Training Resources */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Training Resources
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comprehensive training materials for all staff levels
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {trainingResources.map((resource) => (
              <Card key={resource.title} className="p-6">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <resource.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium text-blue-600">
                    {resource.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-gray-900">
                    {resource.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {resource.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Compliance Guides */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Compliance Guides
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential guidance for regulatory compliance
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {complianceGuides.map((guide) => (
              <Link key={`${guide.title}-${guide.link}`} href={guide.link}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="rounded-lg bg-blue-50 p-3 w-fit">
                    <guide.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {guide.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Need help with staff management?
          </p>
          <Button variant="link" asChild className="text-blue-500 hover:text-blue-600">
            <Link href="/support">Contact our support team</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}