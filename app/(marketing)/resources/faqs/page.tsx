'use client'

import { ArrowRight } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion/Accordion"

const faqs = [
  {
    id: "ofsted-compliance",
    question: "Does Write Care Notes support Ofsted requirements for children's homes?",
    answer: "Yes, Write Care Notes fully supports Ofsted requirements for children's homes. Our system includes specific modules for social care compliance, including care planning, behavior management, safeguarding documentation, and Ofsted-specific reporting templates aligned with the Social Care Common Inspection Framework (SCCIF)."
  },
  {
    id: "childrens-homes",
    question: "What specific support do you offer for children's homes?",
    answer: "We provide comprehensive support for children's homes including: care planning, risk assessments, behavior monitoring, incident reporting, medication management, and safeguarding records. All features are designed to meet Ofsted's quality standards for children's homes and support regulation 44 visits."
  },
  {
    id: "ofsted-reporting",
    question: "How does the system support Ofsted inspections for children's homes?",
    answer: "Our system includes dedicated features for Ofsted inspections including: regulation 44 and 45 reports, quality standards monitoring, outcomes tracking, incident analysis, and comprehensive safeguarding records. Reports can be generated in Ofsted-preferred formats to support both routine and emergency inspections."
  },
  {
    id: "dual-registration",
    question: "How do you handle children's homes with dual registration (Ofsted and CQC)?",
    answer: "For children's homes with dual registration, our system seamlessly integrates both Ofsted and CQC requirements. This includes combined reporting capabilities, unified documentation systems, and compliance tracking for both regulatory frameworks, ensuring all care quality standards are met."
  },
  {
    id: "childrens-features",
    question: "What specific features do you offer for children's homes?",
    answer: "We provide specialized features including: individual care plan tracking, behavior management recording, safeguarding documentation, staff supervision logs, visitor records, medication administration, placement planning, and specific incident reporting templates aligned with Ofsted's children's homes requirements."
  },
  {
    id: "offline-functionality",
    question: "Does Write Care Notes work offline?",
    answer: "Yes, Write Care Notes includes robust offline functionality. Our Progressive Web App (PWA) technology allows staff to continue recording care notes, accessing resident information, and updating care plans even without internet connection. All data automatically syncs when connection is restored."
  },
  {
    id: "offline-sync",
    question: "How does offline synchronization work?",
    answer: "When working offline, all changes are securely stored on your device. Once internet connection is restored, our smart sync technology automatically uploads your changes and downloads any updates from other staff members. The system also handles any potential conflicts to ensure data accuracy."
  },
  {
    id: "offline-security",
    question: "Is offline data secure?",
    answer: "Yes, all offline data is encrypted and securely stored on your device. We use industry-standard encryption for offline storage, and access is protected by the same login credentials as the online system. When devices are logged out, offline data is securely wiped."
  },
  {
    id: "offline-features",
    question: "What features are available offline?",
    answer: "Key features available offline include: daily care notes recording, medication administration records (MAR charts), resident information access, care plan viewing and updating, risk assessments, and incident reporting. Some features requiring real-time communication may be limited offline."
  },
  {
    id: "internet-requirements",
    question: "What happens during internet outages?",
    answer: "Write Care Notes is designed to handle internet outages seamlessly. Staff can continue their work without interruption, and the system will automatically handle data synchronization in the background when connection returns. We also provide backup options for critical functions during extended outages."
  },
  {
    id: "offline-setup",
    question: "How do I set up offline access?",
    answer: "Offline access is automatically enabled for all users. For mobile devices, simply install our PWA by clicking 'Add to Home Screen' in your browser. For desktop computers, the system will automatically cache necessary data for offline use. We recommend performing an initial sync before any planned offline periods."
  },
  {
    id: "getting-started",
    question: "How do I get started with Write Care Notes?",
    answer: "Getting started is easy! First, create your account, then follow our step-by-step setup guide. We'll help you configure your care home settings, add staff members, and set up your first care plans. Our onboarding team will provide a personalized demo and training session."
  },
  {
    id: "training",
    question: "What training resources are available?",
    answer: "We offer comprehensive training resources including video tutorials, written guides, live webinar sessions, and in-person training. Our support team provides personalized training for your staff, CQC compliance training, and regular updates on new features."
  },
  {
    id: "security",
    question: "How secure is my data?",
    answer: "We take data security seriously. All data is encrypted both in transit and at rest, stored in UK-based servers, and compliant with NHS Digital standards, GDPR, and CQC requirements. We perform regular security audits and maintain ISO 27001 certification."
  },
  {
    id: "customization",
    question: "Can I customize care plan templates?",
    answer: "Yes, all our care plan templates are fully customizable. You can modify existing templates or create new ones from scratch. We provide specialized templates for different types of care, including dementia care, end-of-life care, and specialist nursing care."
  },
  {
    id: "support",
    question: "What support options are available?",
    answer: "We provide 24/7 support through multiple channels including phone, email, and live chat. Our UK-based support team is always ready to help. We also offer emergency support for critical issues and regular check-ins with your dedicated account manager."
  },
  {
    id: "compliance",
    question: "How does Write Care Notes help with CQC compliance?",
    answer: "Our system is designed to meet all CQC requirements. We provide built-in compliance checks, automated reporting, audit trails, and regular updates to reflect the latest CQC guidelines. Our templates and workflows are aligned with CQC's Key Lines of Enquiry (KLOEs)."
  },
  {
    id: "integration",
    question: "Can Write Care Notes integrate with other systems?",
    answer: "Yes, we offer integration with various healthcare systems including NHS systems, pharmacy management software, HR systems, and financial software. We also provide API access for custom integrations with your existing tools."
  },
  {
    id: "backup",
    question: "How is my data backed up?",
    answer: "We perform automatic backups every hour and maintain multiple copies across secure UK data centers. You can also export your data at any time. Our disaster recovery system ensures your data is safe and accessible even in emergency situations."
  },
  {
    id: "mobile",
    question: "Can I access Write Care Notes on mobile devices?",
    answer: "Yes, Write Care Notes is fully mobile-responsive and works on smartphones and tablets. We also offer dedicated mobile apps for both iOS and Android, allowing care staff to update records and access information on the go."
  },
  {
    id: "pricing",
    question: "How is Write Care Notes priced?",
    answer: "We offer flexible pricing based on the size of your care home and required features. All plans include core features, training, and support. Contact our sales team for a customized quote that fits your specific needs."
  },
  {
    id: "trial",
    question: "Can I try Write Care Notes before purchasing?",
    answer: "Yes, we offer a 30-day free trial with full access to all features. During the trial, you'll get personalized support and training to help you evaluate how Write Care Notes can benefit your care home."
  },
  {
    id: "updates",
    question: "How often is the system updated?",
    answer: "We regularly update our system with new features and improvements based on user feedback and regulatory changes. Updates are automatic and included in your subscription, with advance notice for major changes and training provided when needed."
  },
  {
    id: "uk-regions",
    question: "Which UK regions does Write Care Notes support?",
    answer: "Write Care Notes fully supports care homes across all UK regions including England (CQC), Scotland (Care Inspectorate), Wales (Care Inspectorate Wales), and Northern Ireland (RQIA). Our system is customized for each region's specific regulatory requirements and reporting standards."
  },
  {
    id: "regional-coverage",
    question: "Which regions does Write Care Notes operate in?",
    answer: "Write Care Notes provides comprehensive coverage across: England (all CQC regions), Wales (regulated by CIW), Scotland (Care Inspectorate), Northern Ireland (RQIA Belfast), and Republic of Ireland (Dublin). Each region has dedicated support teams and region-specific compliance modules."
  },
  {
    id: "regional-offices",
    question: "Where are your regional offices located?",
    answer: "We maintain offices in key regions to provide local support: London and Manchester (England), Cardiff (Wales), Edinburgh (Scotland), Belfast (Northern Ireland), and Dublin (Ireland). Each office has dedicated support staff familiar with local regulations and requirements."
  },
  {
    id: "regional-compliance",
    question: "How do you handle different regional requirements?",
    answer: "Each region has specific compliance modules: CQC frameworks for England, CIW requirements for Wales including Welsh language support, Care Inspectorate standards for Scotland, RQIA requirements for Northern Ireland, and HIQA standards for Ireland. Our system automatically applies the relevant standards based on your location."
  },
  {
    id: "regional-data-centers",
    question: "Where is my data stored based on my region?",
    answer: "Primary data storage is in Azure UK South (England) with disaster recovery in Azure Dublin. For Irish care homes, primary storage is in Dublin with backup in UK South. All data storage complies with UK and EU data protection laws, ensuring data sovereignty requirements are met for each region."
  },
  {
    id: "regional-support-hours",
    question: "What are your support hours across regions?",
    answer: "We provide 24/7 support across all regions: England, Wales, Scotland, Northern Ireland, and Ireland. Each region has local support teams during business hours (9am-5pm local time), with central support covering out-of-hours. Emergency support is available 24/7 for critical issues."
  },
  {
    id: "regional-training",
    question: "How do you handle training across different regions?",
    answer: "We offer region-specific training programs including: in-person training at your facility, virtual training sessions in your local time zone, region-specific webinars, and custom training materials that reflect local care standards and requirements. Training is available in English and Welsh where required."
  },
  {
    id: "regional-compliance",
    question: "How does Write Care Notes handle different regional regulations?",
    answer: "Our system is tailored to meet specific regulatory requirements for each UK region: CQC in England, Care Inspectorate in Scotland, CIW in Wales, and RQIA in Northern Ireland. We provide region-specific templates, workflows, and compliance checks, and automatically update these when regulations change."
  },
  {
    id: "regional-support",
    question: "Do you provide support across all UK regions?",
    answer: "Yes, we provide dedicated support teams familiar with care requirements in England, Scotland, Wales, and Northern Ireland. Our support staff are trained in regional regulations and can assist with region-specific compliance requirements. We also offer local training sessions and workshops across all UK regions."
  },
  {
    id: "language-support",
    question: "Do you support Welsh language requirements?",
    answer: "Yes, in accordance with Welsh language requirements, we provide full Welsh language support for care homes in Wales. This includes Welsh language interfaces, documentation, and care plan templates to meet the Active Offer requirements."
  },
  {
    id: "regional-updates",
    question: "How do you handle regional regulatory changes?",
    answer: "We actively monitor regulatory changes across all UK regions and update our system accordingly. This includes updates for CQC (England), Care Inspectorate (Scotland), CIW (Wales), and RQIA (Northern Ireland) requirements. We provide advance notice of changes and necessary training for new requirements."
  },
  {
    id: "data-hosting",
    question: "Where is Write Care Notes hosted?",
    answer: "Write Care Notes is hosted on Microsoft Azure's enterprise-grade cloud infrastructure. Our primary services run in Azure UK South (England), with blob storage for documents and media in Azure UK South. For redundancy and disaster recovery, we maintain a secondary data center in Azure Dublin (Ireland), ensuring high availability and compliance with UK data protection requirements."
  },
  {
    id: "data-residency",
    question: "Where is my care home's data stored?",
    answer: "Your data is primarily stored in Azure UK South (England) data center, with secure backup storage in Azure Dublin (Ireland). This dual-location approach ensures both data sovereignty and business continuity. All data storage complies with UK and EU data protection regulations, including GDPR and NHS Digital standards."
  },
  {
    id: "data-redundancy",
    question: "How do you ensure data availability?",
    answer: "We use Azure's geo-redundant storage (GRS) between UK South and Dublin regions. Your data is automatically replicated between these locations, ensuring 99.99% availability. The primary data access is always through UK South, with Dublin serving as a failover location in case of any regional issues."
  },
  {
    id: "enterprise-ready",
    question: "Is Write Care Notes suitable for enterprise-scale care organizations?",
    answer: "Yes, Write Care Notes is built for enterprise-scale operations. We support multi-site care organizations with features like centralized management, group-level reporting, cross-facility resource sharing, and enterprise-wide analytics. Our system scales efficiently from single homes to organizations with hundreds of facilities."
  },
  {
    id: "scalability",
    question: "How does Write Care Notes handle large-scale deployments?",
    answer: "Our Azure-based infrastructure automatically scales to meet demand. We use enterprise-grade load balancing, auto-scaling, and content delivery networks (CDN) to ensure consistent performance across all locations. The system comfortably handles thousands of concurrent users and millions of daily transactions."
  },
  {
    id: "enterprise-security",
    question: "What enterprise security features do you offer?",
    answer: "We provide comprehensive enterprise security including: Single Sign-On (SSO) integration, Multi-Factor Authentication (MFA), role-based access control (RBAC), IP whitelisting, audit logging, and advanced threat protection. We maintain ISO 27001, Cyber Essentials Plus, and NHS Data Security standards compliance."
  },
  {
    id: "enterprise-support",
    question: "What level of enterprise support do you provide?",
    answer: "Enterprise clients receive dedicated support including: 24/7 priority support with guaranteed response times, dedicated account manager, technical account manager, regular service reviews, custom training programs, and direct access to our senior technical team for critical issues."
  },
  {
    id: "sla-guarantees",
    question: "What are your SLA guarantees?",
    answer: "We offer enterprise-grade SLAs including: 99.99% uptime guarantee, <2 second response time for critical operations, 15-minute response time for critical support issues, 1-hour resolution time for system-critical issues, and guaranteed recovery time objectives (RTO) of 1 hour."
  },
  {
    id: "enterprise-integration",
    question: "What enterprise integration capabilities are available?",
    answer: "We offer extensive integration options including: REST APIs, FHIR compliance for healthcare interoperability, HL7 integration, SFTP data exchange, Active Directory integration, HR system integration (including major providers like Workday and SAP), and custom integration development."
  },
  {
    id: "data-management",
    question: "How do you handle enterprise data management?",
    answer: "Our enterprise data management includes: automated backup systems, point-in-time recovery, data archiving, custom retention policies, bulk data import/export capabilities, and advanced analytics. We support custom data governance policies and provide tools for GDPR compliance management."
  },
  {
    id: "customization",
    question: "Can Write Care Notes be customized for enterprise needs?",
    answer: "Yes, we offer extensive enterprise customization including: custom workflows, branded interfaces, custom forms and templates, specialized reporting, custom API endpoints, and integration with existing enterprise systems. We also provide a configuration management system for maintaining consistency across multiple sites."
  },
  {
    id: "compliance-standards",
    question: "What compliance standards do you meet?",
    answer: "We maintain compliance with: ISO 27001, Cyber Essentials Plus, NHS Digital Standards, GDPR, DPA 2018, HIPAA (where applicable), WCAG 2.1 AA for accessibility, and regional care standards (CQC, CIW, Care Inspectorate, RQIA). We undergo regular external audits and penetration testing."
  },
  {
    id: "disaster-recovery",
    question: "What disaster recovery measures are in place?",
    answer: "Our comprehensive disaster recovery plan includes: geo-redundant data centers (UK South and Dublin), automated failover systems, regular disaster recovery testing, 15-minute Recovery Point Objective (RPO), 1-hour Recovery Time Objective (RTO), and business continuity planning support."
  },
  {
    id: "enterprise-reporting",
    question: "What enterprise reporting capabilities are available?",
    answer: "We provide comprehensive enterprise reporting including: real-time analytics dashboards, cross-facility comparisons, custom report builders, automated compliance reporting, trend analysis, KPI tracking, and direct data warehouse integration. Reports can be automated and distributed on schedule."
  },
  {
    id: "implementation-support",
    question: "How do you support enterprise-wide implementations?",
    answer: "We provide full enterprise implementation support including: dedicated project management, phased rollout planning, change management support, staff training programs, data migration services, custom configuration setup, and post-implementation support. We also offer best practice guidance based on experience with similar organizations."
  },
  {
    id: "education-support",
    question: "What educational care settings do you support?",
    answer: "We support various educational care settings including: children's homes, residential special schools, boarding schools, further education colleges with residential provision, and residential holiday schemes. Our system is tailored to meet both Ofsted and CQC requirements where dual registration applies."
  },
  {
    id: "education-features",
    question: "What specific features do you offer for educational settings?",
    answer: "We provide specialized features for educational settings including: individual learning plan tracking, educational progress monitoring, behavior management systems, attendance tracking, safeguarding records, staff supervision logs, and specific incident reporting templates aligned with Ofsted requirements."
  }
]

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#7FD02B] to-[#2B95D0] bg-clip-text">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Find answers to common questions about Write Care Notes
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 text-lg">
            Can't find what you're looking for?
          </p>
          <a 
            href="/support" 
            className="inline-flex items-center mt-4 text-lg font-medium text-[#2B95D0] hover:text-[#7FD02B] transition-colors"
          >
            Contact our support team
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
