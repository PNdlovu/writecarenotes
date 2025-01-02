/**
 * WriteCareNotes.com
 * @fileoverview Training Library - Comprehensive training resources for care home staff
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
  Award,
  BookOpen,
  Brain,
  Clock,
  FileText,
  Heart,
  Pill,
  Shield,
  Stethoscope,
  Users,
  Video,
  GraduationCap
} from "lucide-react"

export const metadata: Metadata = {
  title: "Training Library | Write Care Notes",
  description: "Access comprehensive training resources and courses for care home staff development.",
  keywords: "care home training, staff development, healthcare courses, care certificates, mandatory training",
}

const mandatoryCourses = [
  {
    title: "Care Certificate",
    description: "Essential skills and knowledge for care workers",
    icon: GraduationCap,
    category: "Core"
  },
  {
    title: "Care Certificate Standards",
    description: "Complete training covering all 15 care certificate standards",
    duration: "15 hours",
    icon: GraduationCap,
    level: "Foundation",
    href: "/resources/training/care-certificate"
  },
  {
    title: "Health & Safety Essentials",
    description: "Core health and safety training for care environments",
    duration: "4 hours",
    icon: Shield,
    level: "Foundation",
    href: "/resources/training/health-safety"
  },
  {
    title: "Medication Management",
    description: "Safe handling and administration of medications",
    duration: "6 hours",
    icon: Pill,
    level: "Intermediate",
    href: "/resources/training/medication"
  },
  {
    title: "Infection Prevention & Control",
    description: "Latest IPC protocols and best practices",
    duration: "3 hours",
    icon: Stethoscope,
    level: "Foundation",
    href: "/resources/training/infection-control"
  }
]

const specialistCourses = [
  {
    title: "Dementia Care",
    description: "Specialized training in dementia care and support",
    duration: "8 hours",
    icon: Brain,
    level: "Advanced"
  },
  {
    title: "End of Life Care",
    description: "Compassionate palliative care training",
    duration: "6 hours",
    icon: Heart,
    level: "Advanced"
  },
  {
    title: "Mental Health Awareness",
    description: "Understanding and supporting mental health needs",
    duration: "4 hours",
    icon: Users,
    level: "Intermediate"
  }
]

const learningResources = [
  {
    title: "Video Tutorials",
    description: "Step-by-step guidance on care procedures",
    format: "Video",
    icon: Video,
    count: "50+ videos"
  },
  {
    title: "Care Guides",
    description: "Detailed written guides and procedures",
    format: "PDF",
    icon: FileText,
    count: "100+ documents"
  },
  {
    title: "Interactive Modules",
    description: "Engaging e-learning content",
    format: "Online",
    icon: BookOpen,
    count: "30+ modules"
  }
]

export default function TrainingLibraryPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Training Library
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Comprehensive training resources to develop skilled and confident care home staff
          </p>
        </div>

        {/* Certification Banner */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <Award className="h-4 w-4" />
            CPD Certified Training Courses
          </div>
        </div>

        {/* Mandatory Courses */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Mandatory Training
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Essential courses required for all care home staff
          </p>
          
          <div className="mx-auto mt-8 grid gap-8 sm:mt-10 lg:mx-0 lg:grid-cols-2">
            {mandatoryCourses.map((course) => {
              const IconComponent = course.icon;
              return (
                <Card key={course.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {course.title}
                        </h3>
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>
                      <p className="mt-2 text-gray-600">
                        {course.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <Button variant="link" asChild className="p-0">
                          <Link href={course.href}>Start course →</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Specialist Courses */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Specialist Training
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Advanced courses for specialized care needs
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {specialistCourses.map((course) => {
              const IconComponent = course.icon;
              return (
                <Card key={course.title} className="p-6">
                  <div className="rounded-lg bg-blue-50 p-3 w-fit">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    <p className="mt-2 text-gray-600">{course.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Learning Resources */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Additional Resources
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Supplementary learning materials and guides
          </p>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {learningResources.map((resource) => {
              const IconComponent = resource.icon;
              return (
                <Card key={resource.title} className="p-6">
                  <div className="rounded-lg bg-blue-50 p-3 w-fit">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                    <p className="mt-2 text-gray-600">{resource.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <Badge>{resource.format}</Badge>
                      <span>{resource.count}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}