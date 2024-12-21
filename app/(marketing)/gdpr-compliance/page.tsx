/**
 * WriteCareNotes.com
 * @fileoverview GDPR Compliance Page - Enterprise data protection standards
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
  title: "GDPR Compliance | Write Care Notes - Data Protection Standards",
  description: "Our commitment to GDPR compliance and data protection standards for care home management.",
  keywords: "GDPR compliance, data protection, healthcare data security, care home software compliance",
  openGraph: {
    title: "GDPR Compliance | Write Care Notes",
    description: "Learn about our GDPR compliance and data protection measures",
    type: "website"
  }
}

export default function GDPRCompliancePage() {
  const lastUpdated = "March 21, 2024"

  const sections: Section[] = [
    {
      id: "overview",
      title: "GDPR Compliance Overview",
      content: `Write Care Notes, a product of Phibu Cloud Solutions Ltd, is fully committed to compliance 
      with the General Data Protection Regulation (GDPR) and the UK Data Protection Act 2018. We maintain 
      the highest standards of data protection and privacy for all our users, particularly in handling 
      sensitive healthcare information.`
    },
    {
      id: "principles",
      title: "Data Protection Principles",
      content: [
        "We adhere to the following GDPR principles:",
        "• Lawfulness, fairness, and transparency",
        "• Purpose limitation",
        "• Data minimization",
        "• Accuracy",
        "• Storage limitation",
        "• Integrity and confidentiality",
        "• Accountability"
      ]
    },
    {
      id: "measures",
      title: "Technical & Organizational Measures",
      content: [
        "Our GDPR compliance is supported by:"
      ],
      subsections: [
        {
          title: "Security Measures",
          content: [
            "• End-to-end encryption of all data",
            "• Regular security audits and penetration testing",
            "• Multi-factor authentication",
            "• Access control and monitoring",
            "• Secure data centers within the UK/EU",
            "• Regular backup and disaster recovery testing"
          ]
        },
        {
          title: "Organizational Controls",
          content: [
            "• Dedicated Data Protection Officer",
            "• Regular staff training on data protection",
            "• Written security policies and procedures",
            "• Incident response plans",
            "• Data protection impact assessments",
            "• Regular compliance audits"
          ]
        }
      ]
    },
    {
      id: "data-processing",
      title: "Data Processing Activities",
      content: [
        "Our data processing activities include:",
        "• Resident care documentation",
        "• Staff management and training records",
        "• Medical records management",
        "• Care plan administration",
        "• Quality assurance monitoring",
        "• Regulatory compliance reporting"
      ]
    },
    {
      id: "rights",
      title: "Data Subject Rights",
      content: [
        "We support all GDPR data subject rights:",
        "• Right to be informed",
        "• Right of access",
        "• Right to rectification",
        "• Right to erasure",
        "• Right to restrict processing",
        "• Right to data portability",
        "• Right to object",
        "• Rights regarding automated decision making"
      ]
    },
    {
      id: "international",
      title: "International Data Transfers",
      content: `We ensure that any international transfer of personal data is conducted in compliance 
      with GDPR requirements. Our primary data processing activities are conducted within the UK and EU, 
      with appropriate safeguards in place for any necessary international transfers.`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">GDPR Compliance</h1>
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
                For any questions about our GDPR compliance or data protection practices, please contact our Data Protection Officer:
              </p>
              <div className="bg-gray-50 p-8 rounded-xl shadow-inner">
                <div className="space-y-3 text-lg">
                  <p className="flex items-center">
                    <span className="font-medium w-24">Email:</span>
                    <a href="mailto:dpo@writecarenotes.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                      dpo@writecarenotes.com
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