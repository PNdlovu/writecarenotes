import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ofsted Compliance Details | Write Care Notes",
  description: "Detailed information about our compliance with Children's Home Regulations 2015 and Quality Standards",
}

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
