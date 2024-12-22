import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Resources - WriteCareNotes',
  description: 'Access professional resources, tools, and insights to help you deliver outstanding care and grow your care home business.',
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
