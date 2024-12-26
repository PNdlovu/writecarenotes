/**
 * WriteCareNotes.com
 * @fileoverview About Us Page - Company information and mission
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Building2, 
  HeartHandshake, 
  Shield, 
  Globe2, 
  Users2, 
  LineChart,
  Award,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react"
import { AboutHero } from "@/components/marketing/AboutHero"
import { AboutMission } from "@/components/marketing/AboutMission"
import { AboutValues } from "@/components/marketing/AboutValues"
import { AboutTeam } from "@/components/marketing/AboutTeam"
import { backgroundPatterns } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About Us | Write Care Notes - Care Home Management Software",
  description: "Learn about Write Care Notes, our mission to transform care home management, and our commitment to improving healthcare outcomes across the UK.",
  keywords: "care home software company, healthcare technology mission, care management vision",
  openGraph: {
    title: "About Write Care Notes",
    description: "Transforming care home management across the UK",
    type: "website"
  }
}

const stats = [
  { 
    number: "500+", 
    label: "Care Homes Using Our Platform",
    description: "Trusted by care homes across the UK",
    icon: <Building2 className="h-6 w-6 text-blue-600" />
  },
  { 
    number: "50,000+", 
    label: "Residents Supported",
    description: "Improving care delivery daily",
    icon: <Users2 className="h-6 w-6 text-blue-600" />
  },
  { 
    number: "99.9%", 
    label: "Platform Uptime",
    description: "Enterprise-grade reliability",
    icon: <CheckCircle2 className="h-6 w-6 text-blue-600" />
  },
  { 
    number: "24/7", 
    label: "Customer Support",
    description: "Always here to help",
    icon: <Clock className="h-6 w-6 text-blue-600" />
  }
]

const values = [
  {
    icon: <HeartHandshake className="h-12 w-12 text-blue-600" />,
    title: "Our Mission",
    description: "To transform care home management through innovative technology, enabling care providers to deliver exceptional care while reducing administrative burden."
  },
  {
    icon: <Target className="h-12 w-12 text-blue-600" />,
    title: "Our Vision",
    description: "To be the leading care home management platform in the UK, setting new standards for efficiency, compliance, and quality of care."
  },
  {
    icon: <Award className="h-12 w-12 text-blue-600" />,
    title: "Our Promise",
    description: "To continuously innovate and improve our platform based on customer feedback, industry best practices, and emerging healthcare standards."
  }
]

const features = [
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: "Compliance First",
    description: "Built around CQC, HIQA, and regional care standards to ensure regulatory compliance across all operations."
  },
  {
    icon: <Globe2 className="h-8 w-8 text-blue-600" />,
    title: "UK-Wide Coverage",
    description: "Supporting care homes across England, Wales, Scotland, Northern Ireland, and the Republic of Ireland."
  },
  {
    icon: <Users2 className="h-8 w-8 text-blue-600" />,
    title: "User-Centered Design",
    description: "Intuitive interface designed for all age groups and technical abilities, with accessibility at its core."
  },
  {
    icon: <LineChart className="h-8 w-8 text-blue-600" />,
    title: "Data-Driven Insights",
    description: "Advanced analytics and reporting to help care homes make informed decisions and improve outcomes."
  }
]

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          backgroundImage: backgroundPatterns.grid,
          opacity: 0.5,
          maskImage: 'linear-gradient(to bottom, white, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, white, transparent)'
        }} 
      />
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
    </main>
  )
} 