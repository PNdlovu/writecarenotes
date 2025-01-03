/**
 * WriteCareNotes.com
 * @fileoverview Careers Page - Job opportunities and company culture
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Careers } from "@/components/marketing/Careers"

export const metadata: Metadata = {
  title: "Careers | Write Care Notes - Join Our Team",
  description: "Join our mission to transform care home management. Explore career opportunities at Write Care Notes and help us improve care delivery across the UK.",
  keywords: "care home software careers, healthcare technology jobs, care management careers",
  openGraph: {
    title: "Careers at Write Care Notes",
    description: "Join our mission to transform care home management",
    type: "website"
  }
}

export default function CareersPage() {
  return <Careers />
} 
