/**
 * WriteCareNotes.com
 * @fileoverview Resources Page - Professional resources for care home owners and managers
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  FileVideo, 
  Download,
  Calculator,
  BarChart,
  Shield,
  Users,
  BookCheck,
  HeartPulse
} from "lucide-react"

export const metadata: Metadata = {
  title: "Professional Resources | Write Care Notes - Care Home Management Software",
  description: "Access professional resources, regulatory updates, and industry insights for care home owners and managers.",
  keywords: "care home resources, CQC updates, care management guides, healthcare compliance, care home training",
}

const resources = [
  {
    title: "Regulatory Updates",
    description: "Latest CQC, CIW, RQIA, and HIQA guidelines and compliance requirements",
    icon: Shield,
    href: "/resources/regulatory-updates",
    color: "text-blue-600",
    badge: "Updated Weekly"
  },
  {
    title: "Care Quality Hub",
    description: "Best practices for person-centered care and quality improvement",
    icon: HeartPulse,
    href: "/resources/care-quality",
    color: "text-red-600",
    badge: "Essential"
  },
  {
    title: "Staff Management",
    description: "Tools and guides for recruitment, training, and staff development",
    icon: Users,
    href: "/resources/staff-management",
    color: "text-green-600",
    badge: "Popular"
  },
  {
    title: "Business Growth",
    description: "Strategic insights and tools for care home business development",
    icon: Briefcase,
    href: "/resources/business-growth",
    color: "text-purple-600"
  },
  {
    title: "Training Library",
    description: "Comprehensive training materials for all care home staff levels",
    icon: GraduationCap,
    href: "/resources/training",
    color: "text-orange-600",
    badge: "CPD Certified"
  },
  {
    title: "Documentation Center",
    description: "Essential templates, policies, and procedures for care homes",
    icon: FileText,
    href: "/resources/documentation",
    color: "text-teal-600"
  },
  {
    title: "Implementation Guide",
    description: "Step-by-step guide to implementing Write Care Notes in your care home",
    icon: BookCheck,
    href: "/resources/implementation",
    color: "text-indigo-600"
  },
  {
    title: "Performance Analytics",
    description: "Tools and insights for measuring and improving care home performance",
    icon: BarChart,
    href: "/resources/analytics",
    color: "text-pink-600"
  }
]

const quickLinks = [
  {
    title: "CQC Provider Portal",
    href: "https://services.cqc.org.uk/public/providers",
    external: true
  },
  {
    title: "NHS Capacity Tracker",
    href: "https://capacitytracker.com/",
    external: true
  },
  {
    title: "Skills for Care",
    href: "https://www.skillsforcare.org.uk/",
    external: true
  },
  {
    title: "Care Quality Matters",
    href: "/resources/quality-matters",
    external: false
  }
]

export default function ResourcesPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Professional Resources for Care Homes
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Access up-to-date resources, tools, and insights to help you deliver outstanding care and grow your care home business
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {link.title}
              {link.external && (
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </Link>
          ))}
        </div>

        {/* Main Resources Grid */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.title} className="relative overflow-hidden rounded-lg p-8 hover:shadow-lg transition-shadow">
              <Link href={resource.href} className="block">
                <div className="flex items-center justify-between">
                  <div className={cn("inline-flex rounded-lg p-3 ring-1 ring-gray-900/10", resource.color)}>
                    <resource.icon className="h-6 w-6" />
                  </div>
                  {resource.badge && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                      {resource.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {resource.title}
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  {resource.description}
                </p>
              </Link>
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-20 rounded-2xl bg-gray-50 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Need Personalized Guidance?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our care home specialists are here to help you implement best practices and improve your care quality
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/support">Schedule Consultation</Link>
            </Button>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 