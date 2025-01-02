import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features | Write Care Notes - Enterprise Care Home Management Platform",
  description: "Comprehensive care home management features supporting UK & Ireland care providers with full regulatory compliance, offline capabilities, and multi-site management.",
  keywords: "care home software, care management system, CQC compliance, HIQA compliance, offline care software, multi-site care management",
  openGraph: {
    title: "Enterprise Care Home Management Features | Write Care Notes",
    description: "Complete care home management platform with full regulatory compliance for UK & Ireland",
    type: "website"
  }
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 