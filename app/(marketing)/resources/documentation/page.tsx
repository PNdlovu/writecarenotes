/**
 * WriteCareNotes.com
 * @fileoverview Unified Documentation Center - Essential templates, policies, and procedures
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-12-23
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Button } from "@/components/ui/Button/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge/Badge"
import Link from "next/link"
import { 
  FileText,
  Download,
  ClipboardList,
  FileCheck,
  Users,
  Shield,
  Clock,
  Folder,
  BookOpen,
  FileSearch,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

export const metadata: Metadata = {
  title: "Documentation Center | Write Care Notes",
  description: "Access essential care home documentation, templates, policies, and procedures.",
  keywords: "care documentation, care policies, care procedures, care templates",
}

interface DocumentCategory {
  title: string
  description: string
  icon: any
  href: string
  badge?: string
}

const documentCategories: DocumentCategory[] = [
  {
    title: "Core Policies",
    description: "Essential policies required for care home operations",
    icon: Shield,
    href: "/documentation/core-policies",
    badge: "Required"
  },
  {
    title: "Care Planning",
    description: "Templates and guides for person-centered care planning",
    icon: ClipboardList,
    href: "/documentation/care-planning"
  },
  {
    title: "Clinical Documentation",
    description: "Medical and nursing documentation templates",
    icon: FileCheck,
    href: "/documentation/clinical"
  },
  {
    title: "Staff Management",
    description: "HR documentation and staff development resources",
    icon: Users,
    href: "/documentation/staff"
  },
  {
    title: "Quality Assurance",
    description: "Audit tools and quality monitoring documents",
    icon: CheckCircle2,
    href: "/documentation/quality"
  },
  {
    title: "Health & Safety",
    description: "Risk assessments and safety procedures",
    icon: AlertCircle,
    href: "/documentation/health-safety"
  }
]

export default function DocumentationCenterPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Documentation Center
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Access comprehensive documentation, templates, and resources for care home operations
          </p>
        </div>

        {/* Quick Access Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Recently updated documents available
          </div>
        </div>

        {/* Document Categories Grid */}
        <div className="mx-auto mt-16 grid gap-8 sm:mt-20 lg:mx-0 lg:grid-cols-3">
          {documentCategories.map((category) => (
            <Card key={category.title} className="p-6 hover:shadow-lg transition-shadow">
              <Link href={category.href}>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <category.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {category.title}
                      </h3>
                      {category.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {category.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Quick Links
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/documentation/templates">
                <Folder className="mr-2 h-4 w-4" />
                Document Templates
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/documentation/downloads">
                <Download className="mr-2 h-4 w-4" />
                Downloads
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/documentation/guides">
                <BookOpen className="mr-2 h-4 w-4" />
                User Guides
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/documentation/search">
                <FileSearch className="mr-2 h-4 w-4" />
                Search Documents
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
