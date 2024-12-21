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
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-100 to-blue-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <Badge className="mb-4" variant="outline">About Us</Badge>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transforming Care Home Management
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Write Care Notes is building the future of care home management software. Our platform helps care providers deliver exceptional care while ensuring compliance and efficiency.
            </p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
      </div>

      {/* Stats Grid */}
      <div className="mx-auto -mt-12 max-w-7xl px-6 lg:px-8 mb-24">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="relative p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute right-0 top-0 h-24 w-24 transform translate-x-8 -translate-y-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  {stat.icon}
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-blue-600">{stat.number}</div>
                  <div className="mt-2 text-base font-medium text-gray-900">{stat.label}</div>
                  <div className="mt-1 text-sm text-gray-600">{stat.description}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mission and Vision */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 bg-gray-50">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl -z-10" />
        <div className="mx-auto max-w-2xl lg:text-center">
          <Badge className="mb-4" variant="outline">Our Purpose</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why We Exist
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We're on a mission to revolutionize care home management through innovative technology and user-centered design.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <Badge className="mb-4" variant="outline">Our Approach</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Sets Us Apart
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform is built on four core principles that ensure we deliver the best possible solution for care homes.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 