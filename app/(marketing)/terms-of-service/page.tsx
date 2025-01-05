/**
 * WriteCareNotes.com
 * @fileoverview Terms of Service Page - Enterprise legal terms and conditions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Write Care Notes - Legal Terms & Conditions",
  description: "Legal terms and conditions for using Write Care Notes care home management platform.",
  keywords: "terms of service, legal agreement, care home software terms, healthcare software terms",
  openGraph: {
    title: "Terms of Service | Write Care Notes",
    description: "Legal terms and conditions for our care home management platform",
    type: "website"
  }
}

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

export default function TermsOfServicePage() {
  const lastUpdated = "March 21, 2024"
  const effectiveDate = "April 1, 2024"

  const sections: Section[] = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing or using Write Care Notes services ("Services"), a product of Phibu Cloud Solutions Ltd 
      ("we", "our", "us", "the Company"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, 
      and any additional terms and conditions that may apply. If you are using the Services on behalf of an organization, 
      you represent and warrant that you have authority to bind that organization to these Terms.`
    },
    {
      id: "definitions",
      title: "2. Definitions",
      content: [
        "In these Terms:",
        "• 'Service(s)' refers to Write Care Notes, a care home management platform by Phibu Cloud Solutions Ltd",
        "• 'User(s)' means any individual or entity using the Services",
        "• 'Content' means all information and data submitted through the Services",
        "• 'Care Home' means any residential care facility using the Services",
        "• 'Resident Data' means any personal or health information about care home residents",
        "• 'Company' means Phibu Cloud Solutions Ltd"
      ]
    },
    {
      id: "compliance",
      title: "3. Regulatory Compliance",
      content: [
        "The Services are designed to help you comply with:",
        "• CQC requirements (England)",
        "• Ofsted regulations (Children's Services)",
        "• Care Inspectorate standards (Scotland)",
        "• CIW regulations (Wales)",
        "• RQIA standards (Northern Ireland)",
        "• HIQA requirements (Republic of Ireland)",
        "• GDPR and Data Protection Act 2018"
      ],
      subsections: [
        {
          title: "Children's Services Compliance",
          content: [
            "For children's services, we ensure compliance with:",
            "• Social Care Common Inspection Framework (SCCIF)",
            "• Children's Homes Regulations 2015",
            "• Quality Standards for Children's Homes",
            "• Record keeping requirements",
            "• Staff qualification tracking",
            "• Safeguarding procedures",
            "• Incident reporting protocols"
          ]
        },
        {
          title: "Additional Requirements",
          content: [
            "We maintain compliance with:",
            "• Local Authority requirements",
            "• NHS Digital Standards",
            "• Safeguarding protocols",
            "• Professional standards",
            "• Industry best practices"
          ]
        }
      ]
    },
    {
      id: "data-protection",
      title: "4. Data Protection",
      content: [
        "You agree to:",
        "• Comply with all applicable data protection laws",
        "• Maintain confidentiality of resident data",
        "• Implement appropriate security measures",
        "• Report any security incidents promptly",
        "• Train staff on data protection requirements",
        "• Maintain accurate and up-to-date records"
      ]
    },
    {
      id: "termination",
      title: "5. Termination",
      content: [
        "We may terminate or suspend your access to the Services:",
        "• For breach of these Terms",
        "• For non-payment of fees",
        "• For regulatory compliance reasons",
        "• If required by law",
        "",
        "Upon termination:",
        "• Access will be revoked",
        "• Data will be retained per regulatory requirements",
        "• You may request data export within 30 days"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Terms of Service</h1>
            <div className="text-gray-600 space-y-1">
              <p className="text-lg">Last updated: {lastUpdated}</p>
              <p className="text-lg">Effective: {effectiveDate}</p>
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
                For any questions about these Terms of Service, please contact our Legal Team:
              </p>
              <div className="bg-gray-50 p-8 rounded-xl shadow-inner">
                <div className="space-y-3 text-lg">
                  <p className="flex items-center">
                    <span className="font-medium w-24">Email:</span>
                    <a href="mailto:legal@writecarenotes.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                      legal@writecarenotes.com
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
