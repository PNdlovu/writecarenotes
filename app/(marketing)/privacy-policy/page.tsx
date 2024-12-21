/**
 * WriteCareNotes.com
 * @fileoverview Privacy Policy Page - Enterprise data protection and privacy information
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"

type SubSection = {
  title: string
  content: string[]
}

type Section = {
  id: string
  title: string
  content: string | string[]
  subsections?: SubSection[]
}

export const metadata: Metadata = {
  title: "Privacy Policy | Write Care Notes - Data Protection & Privacy",
  description: "Our comprehensive privacy policy and data protection practices for care home management software.",
  keywords: "healthcare data privacy, GDPR compliance, data protection, care home data security",
  openGraph: {
    title: "Privacy Policy | Write Care Notes",
    description: "Learn about our commitment to protecting your data and privacy",
    type: "website"
  }
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 21, 2024"

  const sections: Section[] = [
    {
      id: "introduction",
      title: "Introduction",
      content: `Write Care Notes, a product of Phibu Cloud Solutions Ltd ("we", "our", "us", "the Company") is committed to protecting 
      the privacy and security of your personal information. This Privacy Policy describes how we collect, 
      use, store, and protect information in accordance with the UK General Data Protection Regulation 
      (UK GDPR), the Data Protection Act 2018, and other applicable data protection laws.`
    },
    {
      id: "scope",
      title: "Scope and Application",
      content: [
        "This Privacy Policy applies to:",
        "• All users of Write Care Notes software and services",
        "• Care home staff and administrators",
        "• Healthcare professionals",
        "• Residents and their representatives",
        "• Website visitors and prospective clients",
        "• Job applicants and employees"
      ]
    },
    {
      id: "data-collection",
      title: "Information We Collect",
      content: [
        "We collect various types of information to provide and improve our services:"
      ],
      subsections: [
        {
          title: "Personal Information",
          content: [
            "• Names and contact details",
            "• Professional credentials and qualifications",
            "• Employment information",
            "• Login credentials and activity logs",
            "• Training and certification records"
          ]
        },
        {
          title: "Resident Information",
          content: [
            "• Medical and health records",
            "• Care plans and assessments",
            "• Medication records",
            "• Dietary requirements",
            "• Emergency contacts",
            "• Personal preferences"
          ]
        },
        {
          title: "Technical Data",
          content: [
            "• IP addresses",
            "• Browser type and version",
            "• Device information",
            "• Usage patterns and analytics",
            "• Cookies and similar technologies"
          ]
        }
      ]
    },
    {
      id: "legal-basis",
      title: "Legal Basis for Processing",
      content: [
        "We process personal data under the following legal bases:",
        "• Contract performance",
        "• Legal obligations",
        "• Legitimate interests",
        "• Consent (where required)",
        "• Vital interests (in emergency situations)",
        "• Public interest (healthcare purposes)"
      ]
    },
    {
      id: "data-protection",
      title: "Data Protection Measures",
      content: [
        "We implement robust security measures including:",
        "• End-to-end encryption",
        "• Multi-factor authentication",
        "• Regular security audits",
        "• Access controls and monitoring",
        "• Staff training and awareness",
        "• Incident response procedures",
        "• Secure data backups"
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      content: `We retain personal data only for as long as necessary to fulfill the purposes 
      for which it was collected, including legal, accounting, or reporting requirements. 
      Healthcare records are retained in accordance with NHS and regulatory guidelines.`
    },
    {
      id: "your-rights",
      title: "Your Rights",
      content: [
        "Under data protection law, you have rights including:",
        "• The right to be informed",
        "• The right of access",
        "• The right to rectification",
        "• The right to erasure",
        "• The right to restrict processing",
        "• The right to data portability",
        "• The right to object",
        "• Rights related to automated decision making"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
            <div className="text-gray-600 space-y-1">
              <p className="text-lg">Last updated: {lastUpdated}</p>
            </div>
          </header>

          {/* Quick Navigation */}
          <nav className="mb-12 p-6 bg-blue-50 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Navigation</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <a 
                    href={`#${section.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
              <li>
                <a 
                  href="#contact"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Contact Information
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose max-w-none">
            {sections.map((section) => (
              <section 
                key={section.id} 
                className="mb-12 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" 
                id={section.id}
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 border-b pb-2">
                  {section.title}
                </h2>
                
                {typeof section.content === 'string' ? (
                  <p className="mb-4 text-lg leading-relaxed text-gray-700">
                    {section.content}
                  </p>
                ) : (
                  <ul className="list-none space-y-3 mb-4">
                    {section.content.map((item, index) => (
                      <li key={index} className="text-gray-700 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && (
                  <div className="mt-8 space-y-8">
                    {section.subsections.map((subsection, index) => (
                      <div key={index} className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-medium mb-4 text-gray-900">
                          {subsection.title}
                        </h3>
                        <ul className="list-none space-y-3">
                          {subsection.content.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-700 leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <section 
              className="mb-12 p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow" 
              id="contact"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 border-b pb-2">
                Contact Information
              </h2>
              <p className="mb-6 text-lg text-gray-700">
                For any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer:
              </p>
              <div className="bg-gray-50 p-8 rounded-xl shadow-inner">
                <div className="space-y-3 text-lg">
                  <p className="flex items-center">
                    <span className="font-medium w-24">Email:</span>
                    <a href="mailto:privacy@writecarenotes.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                      privacy@writecarenotes.com
                    </a>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-24">Phone:</span>
                    <a href="tel:02034421373" className="text-blue-600 hover:text-blue-800 transition-colors">
                      0203 442 1373
                    </a>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-24">Website:</span>
                    <a href="https://www.writecarenotes.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                      www.writecarenotes.com
                    </a>
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    Phibu Cloud Solutions Ltd<br />
                    Write Care Notes<br />
                    4th Floor Silverstream House<br />
                    45 Fitzroy Street<br />
                    Fitzrovia, London, W1T 6EB<br />
                    United Kingdom
                  </p>
                  <p className="mt-4 text-gray-600">
                    Company Registration Number: 15719165
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 