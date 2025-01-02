/**
 * WriteCareNotes.com
 * @fileoverview Nutrition & Dietary Documentation - Meal planning and dietary management resources
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { Button } from "@/components/ui/Button/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge/Badge"
import Link from "next/link"
import { 
  FileText,
  Download,
  ClipboardList,
  FileCheck,
  ArrowLeft,
  Apple,
  Clock,
  Utensils,
  ClipboardCheck,
  Scale,
  BookOpen,
  HeartPulse,
  Leaf
} from "lucide-react"

export const metadata: Metadata = {
  title: "Nutrition & Dietary Documentation | Write Care Notes",
  description: "Access meal planning templates, dietary assessment tools, and nutritional guidance for care home residents.",
  keywords: "care home nutrition, meal planning, dietary management, nutritional assessment, special diets",
}

const nutritionForms = [
  {
    title: "Menu Planning Template",
    description: "4-week rotating menu planning framework",
    format: "XLSX",
    size: "345 KB",
    category: "Planning",
    lastUpdated: "March 2024"
  },
  {
    title: "Dietary Assessment Form",
    description: "Comprehensive nutritional needs assessment",
    format: "DOCX",
    size: "275 KB",
    category: "Assessment",
    lastUpdated: "March 2024"
  },
  {
    title: "Food Preferences Record",
    description: "Resident dietary preferences and restrictions",
    format: "DOCX",
    size: "245 KB",
    category: "Preferences",
    lastUpdated: "March 2024"
  },
  {
    title: "MUST Assessment Tool",
    description: "Malnutrition Universal Screening Tool",
    format: "PDF",
    size: "312 KB",
    category: "Screening",
    lastUpdated: "March 2024"
  }
]

const dietaryTools = [
  {
    title: "Meal Tracker",
    description: "Monitor food and fluid intake",
    icon: Utensils,
    category: "Monitoring"
  },
  {
    title: "Weight Management",
    description: "Weight monitoring and BMI tracking",
    icon: Scale,
    category: "Assessment"
  },
  {
    title: "Special Diets Guide",
    description: "Managing dietary requirements",
    icon: Leaf,
    category: "Guidance"
  },
  {
    title: "Nutrition Care Plan",
    description: "Nutritional support planning",
    icon: HeartPulse,
    category: "Planning"
  }
]

const nutritionGuides = [
  {
    title: "Menu Planning",
    description: "Guide to balanced meal planning",
    icon: Apple,
    href: "/resources/documentation/nutrition/menu-planning"
  },
  {
    title: "Dietary Requirements",
    description: "Managing special dietary needs",
    icon: ClipboardCheck,
    href: "/resources/documentation/nutrition/dietary-requirements"
  },
  {
    title: "Nutritional Standards",
    description: "Care home nutrition guidelines",
    icon: BookOpen,
    href: "/resources/documentation/nutrition/standards"
  }
]

export default function NutritionPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/resources/documentation">
              <ArrowLeft className="h-4 w-4" />
              Back to Documentation Center
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Nutrition & Dietary Care
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Essential resources for managing resident nutrition and dietary needs
          </p>
        </div>

        {/* Update Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            Updated with latest nutritional guidelines
          </div>
        </div>

        {/* Nutrition Forms */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Nutrition Forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential documentation for dietary management
          </p>
          
          <div className="mt-8 space-y-4">
            {nutritionForms.map((form) => (
              <Card key={form.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {form.title}
                        </h3>
                        <Badge variant="secondary">{form.category}</Badge>
                      </div>
                      <p className="mt-1 text-gray-600">
                        {form.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        Last updated: {form.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {form.format} • {form.size}
                    </span>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Dietary Tools */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Dietary Tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tools for managing nutritional care
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dietaryTools.map((tool) => (
              <Card key={tool.title} className="p-6">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <tool.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {tool.title}
                    </h3>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {tool.description}
                  </p>
                  <Button variant="link" className="mt-4 p-0">
                    Access tool →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Nutrition Guides */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Nutrition Guides
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Best practice guidance for nutritional care
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {nutritionGuides.map((guide) => (
              <Card key={guide.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="rounded-lg bg-blue-50 p-3 w-fit">
                  <guide.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {guide.description}
                  </p>
                  <Button variant="link" asChild className="mt-4 p-0">
                    <Link href={guide.href}>View guide →</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Need help with nutritional care?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Our nutrition specialists can help optimize your dietary management processes
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/demo">Book Consultation</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white hover:bg-blue-500" asChild>
              <Link href="/resources/documentation/nutrition/consultation">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 