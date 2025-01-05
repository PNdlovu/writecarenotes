/**
 * WriteCareNotes.com
 * @fileoverview Demo Request Page - Book a demo of our platform
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Metadata } from "next"
import { DemoRequestForm } from "@/components/marketing/DemoRequestForm"
import { DemoFeatures } from "@/components/marketing/DemoFeatures"
import { Badge } from "@/components/ui/Badge/Badge"
import { Card } from "@/components/ui/Card"
import { Shield, HeadphonesIcon, Users, CalendarClock } from "lucide-react"

export const metadata: Metadata = {
  title: "Request Demo | Write Care Notes - Care Home Management Software",
  description: "Book a personalized demo of Write Care Notes care home management software. See how we can help streamline your care home operations.",
  keywords: "care home software demo, healthcare software demonstration, care management demo",
  openGraph: {
    title: "Request Demo | Write Care Notes",
    description: "Get a personalized demo of our care home software",
    type: "website"
  }
}

export default function DemoPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-blue-100">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-blue-100 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-6 sm:pb-24 lg:flex lg:px-8 lg:py-12">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-4">
            <div className="mt-4 sm:mt-8 lg:mt-4">
              <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-100">Enterprise Care & Children's Home Software</Badge>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Why Choose Write Care Notes?
              </h1>
              <p className="mt-6 text-base leading-7 text-gray-600 max-w-2xl">
                Experience how our platform streamlines operations for both care homes and children's homes while improving care quality.
              </p>
              
              {/* Trust Indicators */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium">Fully Compliant</p>
                    <p className="text-gray-500">CQC, Ofsted, CIW & More</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HeadphonesIcon className="h-6 w-6 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium">24/7 Support</p>
                    <p className="text-gray-500">UK-based experts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium">500+ Facilities</p>
                    <p className="text-gray-500">Trust our platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Features */}
          <div className="lg:order-1">
            <DemoFeatures />
          </div>

          {/* Right Column - Form */}
          <div className="lg:order-2">
            <div className="sticky top-8">
              <Card className="p-8 shadow-lg border-2 border-blue-100">
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-blue-50 mb-4">
                      <CalendarClock className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                      Book Your Demo
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                      Get a personalized walkthrough of how Write Care Notes can help your care home.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg">
                    <DemoRequestForm />
                  </div>
                  <div className="space-y-3 text-center text-sm">
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Shield className="h-4 w-4" />
                      <p>ISO 27001 certified & GDPR compliant</p>
                    </div>
                    <p className="text-gray-500">Typical response time: Within 24 hours</p>
                    <p className="text-gray-500">Available across England, Wales, Scotland, Northern Ireland, and Republic of Ireland</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
