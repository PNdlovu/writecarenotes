import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Best Practices | Write Care Notes",
  description: "Discover recommended workflows and care documentation standards.",
}

const practices = [
  {
    title: "Care Plan Documentation",
    description: "Guidelines for creating detailed and person-centered care plans",
    category: "Care Planning",
    link: "/resources/best-practices/care-plans"
  },
  {
    title: "Daily Notes Recording",
    description: "Best practices for maintaining accurate and comprehensive daily notes",
    category: "Daily Operations",
    link: "/resources/best-practices/daily-notes"
  },
  {
    title: "Risk Assessment",
    description: "Standard procedures for conducting and documenting risk assessments",
    category: "Safety",
    link: "/resources/best-practices/risk-assessment"
  }
]

export default function BestPracticesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">
          Best Practices
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Industry-leading standards and guidelines for exceptional care
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {practices.map((practice) => (
          <Link key={practice.title} href={practice.link}>
            <Card className="p-6 group hover:border-brand-teal transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="h-8 w-8 text-brand-green" />
                <h3 className="text-xl font-semibold">{practice.title}</h3>
              </div>
              <p className="text-muted-foreground">{practice.description}</p>
              <div className="mt-4 text-sm font-medium text-brand-blue">
                {practice.category}
              </div>
              <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-brand-teal opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
