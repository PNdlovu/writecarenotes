/**
 * WriteCareNotes.com
 * @fileoverview Ofsted Compliance Details Page
 */

'use client';

import { Badge, Card, Button } from "@/components/ui"
import { ExpandableSection } from "@/components/ui/ExpandableSection"
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Download, 
  BookOpen, 
  Calendar,
  Bell,
  FileText,
  ExternalLink
} from "lucide-react"

export default function CompliancePage() {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-white">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Ofsted Compliant</Badge>
            <h1 className="text-4xl font-bold mb-6 tracking-tight">
              Children's Home Regulations & Quality Standards Compliance
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comprehensive compliance with Ofsted requirements and quality standards
            </p>
          </div>
        </div>
      </section>

      {/* Latest Updates Banner */}
      <section className="py-4 bg-green-50 border-y border-green-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-green-600" />
              <p className="text-green-800">
                <span className="font-semibold">Latest Update:</span> New Ofsted guidance released - {currentDate}
              </p>
            </div>
            <Button variant="link" className="text-green-700">
              Read More <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Compliance Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Regulations Compliance */}
            <div className="space-y-4">
              <ExpandableSection
                title="Regulations Compliance"
                icon={<Shield className="w-6 h-6 text-indigo-600" />}
                defaultOpen={true}
              >
                <ul className="space-y-3">
                  {[
                    {
                      standard: "Quality of Care Standard",
                      details: "Ensuring high-quality, child-centered care that meets individual needs"
                    },
                    {
                      standard: "Children's Views, Wishes and Feelings Standard",
                      details: "Active participation of children in their care planning"
                    },
                    {
                      standard: "Education Standard",
                      details: "Supporting educational achievement and development"
                    },
                    {
                      standard: "Enjoyment and Achievement Standard",
                      details: "Promoting participation in activities and personal interests"
                    },
                    {
                      standard: "Health and Well-being Standard",
                      details: "Ensuring physical, emotional, and mental health needs are met"
                    },
                    {
                      standard: "Positive Relationships Standard",
                      details: "Supporting positive relationships with family and peers"
                    },
                    {
                      standard: "Protection of Children Standard",
                      details: "Comprehensive safeguarding and child protection measures"
                    },
                    {
                      standard: "Leadership and Management Standard",
                      details: "Effective leadership ensuring high-quality care"
                    },
                    {
                      standard: "Care Planning Standard",
                      details: "Detailed, person-centered care planning and review"
                    }
                  ].map(({ standard, details }) => (
                    <li key={standard} className="flex flex-col">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="font-medium">{standard}</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-7 mt-1">{details}</p>
                    </li>
                  ))}
                </ul>
              </ExpandableSection>

              <ExpandableSection
                title="Quality Standards"
                icon={<FileCheck className="w-6 h-6 text-indigo-600" />}
              >
                <ul className="space-y-3">
                  {[
                    {
                      requirement: "Statement of Purpose",
                      details: "Clear documentation of service aims and objectives"
                    },
                    {
                      requirement: "Location Assessment",
                      details: "Comprehensive assessment of premises suitability"
                    },
                    {
                      requirement: "Safeguarding Policies",
                      details: "Robust policies ensuring children's safety"
                    },
                    {
                      requirement: "Behaviour Management",
                      details: "Positive behavior support strategies"
                    },
                    {
                      requirement: "Missing Child Procedures",
                      details: "Clear protocols for missing children incidents"
                    },
                    {
                      requirement: "Staff Recruitment & Training",
                      details: "Safe recruitment and ongoing development"
                    },
                    {
                      requirement: "Record Keeping",
                      details: "Comprehensive and secure documentation"
                    },
                    {
                      requirement: "Notifications & Reports",
                      details: "Timely reporting of significant events"
                    },
                    {
                      requirement: "Financial Viability",
                      details: "Sound financial management practices"
                    }
                  ].map(({ requirement, details }) => (
                    <li key={requirement} className="flex flex-col">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="font-medium">{requirement}</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-7 mt-1">{details}</p>
                    </li>
                  ))}
                </ul>
              </ExpandableSection>
            </div>

            {/* Resources and Downloads */}
            <div className="space-y-4">
              <ExpandableSection
                title="Compliance Resources"
                icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
              >
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Downloadable Resources</h3>
                  {[
                    {
                      title: "Compliance Checklist",
                      description: "Complete checklist for Ofsted requirements",
                      type: "PDF",
                      href: "/resources/compliance/checklist.pdf"
                    },
                    {
                      title: "Policy Templates",
                      description: "Standard policy templates for care homes",
                      type: "DOCX",
                      href: "/resources/compliance/policy-templates.docx"
                    },
                    {
                      title: "Audit Tools",
                      description: "Self-assessment and audit templates",
                      type: "XLSX",
                      href: "/resources/compliance/audit-tools.xlsx"
                    },
                    {
                      title: "Best Practice Guide",
                      description: "Comprehensive guide to compliance",
                      type: "PDF",
                      href: "/resources/compliance/best-practice-guide.pdf"
                    }
                  ].map((resource) => (
                    <div key={resource.title} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                      <a 
                        href={resource.href}
                        download
                        className="no-underline"
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {resource.type}
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </ExpandableSection>

              <ExpandableSection
                title="Compliance Calendar"
                icon={<Calendar className="w-6 h-6 text-indigo-600" />}
              >
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Upcoming Requirements</h3>
                  {[
                    {
                      date: "January 2024",
                      event: "Annual Safeguarding Review",
                      status: "Upcoming"
                    },
                    {
                      date: "February 2024",
                      event: "Staff Training Update",
                      status: "Planning"
                    },
                    {
                      date: "March 2024",
                      event: "Quality Standards Audit",
                      status: "Scheduled"
                    },
                    {
                      date: "April 2024",
                      event: "Policy Reviews",
                      status: "Pending"
                    }
                  ].map((event) => (
                    <div key={event.event} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{event.event}</h4>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                  ))}
                </div>
              </ExpandableSection>

              <ExpandableSection
                title="Latest Updates"
                icon={<Bell className="w-6 h-6 text-indigo-600" />}
              >
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Recent Changes</h3>
                  {[
                    {
                      date: "December 2023",
                      update: "New Safeguarding Guidelines",
                      type: "Regulation Update"
                    },
                    {
                      date: "November 2023",
                      update: "Staff Qualification Requirements",
                      type: "Policy Change"
                    },
                    {
                      date: "October 2023",
                      update: "Record Keeping Standards",
                      type: "Guidance Update"
                    }
                  ].map((update) => (
                    <div key={update.update} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{update.update}</h4>
                        <p className="text-sm text-gray-600">{update.date}</p>
                      </div>
                      <Badge>{update.type}</Badge>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8">
            <Card className="p-6 border-orange-200 bg-orange-50">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    Important Compliance Notice
                  </h3>
                  <p className="text-orange-700">
                    While our system is designed to support compliance with Ofsted requirements,
                    ultimate responsibility for regulatory compliance rests with the care provider.
                    Regular reviews and updates of policies, procedures, and documentation are essential
                    to maintain compliance.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
