/**
 * WriteCareNotes.com
 * @fileoverview Regulatory Updates - Latest care home regulations and compliance requirements
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  AlertCircle, 
  Calendar, 
  FileText, 
  ExternalLink,
  Clock,
  CheckCircle2
} from "lucide-react"

export const metadata: Metadata = {
  title: "Regulatory Updates | Write Care Notes",
  description: "Stay up to date with the latest CQC, CIW, RQIA, and HIQA regulatory changes and compliance requirements for care homes.",
  keywords: "CQC updates, care home regulations, HIQA guidelines, CIW requirements, RQIA standards",
}

const regulatoryUpdates = [
  {
    title: "CQC Assessment Framework Changes",
    description: "New updates to the CQC assessment framework affecting how care homes are inspected and rated.",
    date: "March 2024",
    authority: "CQC",
    type: "Major Update",
    link: "https://www.cqc.org.uk/guidance-providers",
    status: "Active"
  },
  {
    title: "Medication Management Guidelines",
    description: "Updated guidance on medication management and administration in care settings.",
    date: "February 2024",
    authority: "HIQA",
    type: "Guidance",
    link: "https://www.hiqa.ie/guidance",
    status: "Active"
  },
  {
    title: "Staff Training Requirements",
    description: "New mandatory training requirements for care home staff in Wales.",
    date: "March 2024",
    authority: "CIW",
    type: "Requirement",
    link: "https://www.careinspectorate.wales",
    status: "Upcoming"
  },
  {
    title: "Infection Prevention & Control",
    description: "Updated IPC guidelines incorporating latest health protection protocols.",
    date: "January 2024",
    authority: "RQIA",
    type: "Guidance",
    link: "https://www.rqia.org.uk/guidance",
    status: "Active"
  }
]

const complianceResources = [
  {
    title: "Self-Assessment Tool",
    description: "Evaluate your compliance with the latest regulatory requirements",
    href: "/resources/compliance/self-assessment"
  },
  {
    title: "Policy Templates",
    description: "Updated policy templates aligned with current regulations",
    href: "/resources/compliance/templates"
  },
  {
    title: "Training Records",
    description: "Staff training compliance tracking and management",
    href: "/resources/compliance/training"
  }
]

export default function RegulatoryUpdatesPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Regulatory Updates
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Stay informed about the latest regulatory changes and compliance requirements for care homes across the UK and Ireland
          </p>
        </div>

        {/* Last Updated Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <Clock className="h-4 w-4" />
            Last Updated: March 21, 2024
          </div>
        </div>

        {/* Updates Grid */}
        <div className="mx-auto mt-16 grid gap-8 sm:mt-20 lg:mx-0 lg:grid-cols-2">
          {regulatoryUpdates.map((update) => (
            <Card key={update.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={update.status === 'Active' ? 'default' : 'secondary'}>
                    {update.status}
                  </Badge>
                  <Badge variant="outline">{update.authority}</Badge>
                  <Badge variant="outline">{update.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {update.date}
                </div>
              </div>
              
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {update.title}
              </h3>
              <p className="mt-2 text-gray-600">
                {update.description}
              </p>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={update.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    View Details
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Compliance Tools Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Compliance Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Resources to help you maintain compliance with current regulations
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {complianceResources.map((resource) => (
              <Card key={resource.title} className="p-6">
                <h3 className="font-semibold text-gray-900">
                  {resource.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {resource.description}
                </p>
                <Button variant="link" asChild className="mt-4 p-0">
                  <Link href={resource.href}>Learn more →</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Alert Section */}
        <div className="mt-16 rounded-xl bg-blue-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">
                Stay Updated
              </h3>
              <p className="mt-2 text-blue-700">
                Subscribe to our regulatory updates newsletter to receive the latest changes and compliance requirements directly in your inbox.
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Subscribe to Updates
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 