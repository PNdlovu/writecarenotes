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
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CalendarClock } from "lucide-react"

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
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-100 to-blue-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-6 sm:pb-24 lg:flex lg:px-8 lg:py-12">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-4">
            <div className="mt-4 sm:mt-8 lg:mt-4">
              <Badge className="mb-4" variant="outline">Book a Demo</Badge>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Experience the Future of Care Home Management
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Schedule a personalized demo to see how Write Care Notes can transform your care home operations and improve resident care quality.
              </p>
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
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      Request Demo
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                      Fill out the form below and one of our care home specialists will get in touch to schedule your demo.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg">
                    <DemoRequestForm />
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    <p>Your data is secure and will never be shared with third parties.</p>
                    <p>Typical response time: Within 24 hours</p>
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