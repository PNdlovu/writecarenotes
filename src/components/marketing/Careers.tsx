/**
 * WriteCareNotes.com
 * @fileoverview Careers Component - Displays career opportunities and company culture
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Code2, 
  HeartHandshake, 
  Laptop, 
  LineChart, 
  MessageSquare, 
  Users2,
  Check,
  Building2,
  GraduationCap,
  Globe2,
  Shield,
  Heart,
  MapPin,
  Clock,
  Briefcase,
  Star,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const positions = [
  {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote (UK)",
    type: "Full-time",
    level: "Senior",
    salary: "£65,000 - £85,000",
    description: "Join our core team building the next generation of care home management software. You'll be working on critical features that directly impact the quality of care delivery across the UK.",
    requirements: [
      "5+ years of experience with React, Node.js, and TypeScript",
      "Experience with healthcare software or regulated industries",
      "Strong understanding of security and data protection",
      "Excellent problem-solving and communication skills",
      "Experience with cloud infrastructure (AWS/Azure)",
      "Knowledge of healthcare data standards (HL7/FHIR)"
    ],
    responsibilities: [
      "Lead development of core platform features",
      "Design and implement secure, scalable solutions",
      "Mentor junior developers and review code",
      "Work closely with product and design teams",
      "Drive technical architecture decisions",
      "Ensure compliance with healthcare regulations"
    ],
    techStack: ["React", "TypeScript", "Node.js", "Next.js", "PostgreSQL", "AWS"]
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "London/Remote",
    type: "Full-time",
    level: "Mid-Senior",
    salary: "£55,000 - £75,000",
    description: "Lead product strategy and development for our care home management platform. Shape the future of healthcare technology while working with care homes across the UK.",
    requirements: [
      "3+ years of product management experience",
      "Healthcare or care home industry experience preferred",
      "Strong analytical and communication skills",
      "Experience with agile methodologies",
      "Data-driven decision making background",
      "Understanding of healthcare regulations"
    ],
    responsibilities: [
      "Define product strategy and roadmap",
      "Work with care homes to understand needs",
      "Lead feature prioritization and delivery",
      "Analyze data to drive product decisions",
      "Collaborate with cross-functional teams",
      "Drive product innovation and growth"
    ],
    techStack: ["Jira", "Figma", "Analytics", "Product Strategy", "Agile"]
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "London",
    type: "Full-time",
    level: "Mid-Senior",
    salary: "£45,000 - £60,000",
    description: "Help our care home customers succeed with our platform. Drive adoption, ensure customer satisfaction, and contribute to the growth of healthcare technology.",
    requirements: [
      "3+ years of customer success experience",
      "Healthcare or SaaS experience preferred",
      "Excellent communication and presentation skills",
      "Strong problem-solving abilities",
      "Experience with CRM systems",
      "Understanding of care home operations"
    ],
    responsibilities: [
      "Onboard and train new customers",
      "Drive platform adoption and success",
      "Provide strategic guidance to customers",
      "Gather and relay customer feedback",
      "Monitor customer health metrics",
      "Build strong customer relationships"
    ],
    techStack: ["Salesforce", "Customer Success Tools", "Training", "Support"]
  }
]

const values = [
  {
    icon: <HeartHandshake className="h-8 w-8 text-blue-600" />,
    title: "Care First",
    description: "We put care at the heart of everything we do, focusing on improving outcomes for residents and staff."
  },
  {
    icon: <Code2 className="h-8 w-8 text-blue-600" />,
    title: "Innovation",
    description: "We embrace new technologies and ideas to solve complex healthcare challenges."
  },
  {
    icon: <Users2 className="h-8 w-8 text-blue-600" />,
    title: "Collaboration",
    description: "We work closely with care homes to understand their needs and build better solutions."
  },
  {
    icon: <LineChart className="h-8 w-8 text-blue-600" />,
    title: "Impact",
    description: "We measure our success by the positive impact we have on care quality and efficiency."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
    title: "Transparency",
    description: "We believe in open communication and honest feedback with our team and customers."
  },
  {
    icon: <Laptop className="h-8 w-8 text-blue-600" />,
    title: "Remote-First",
    description: "We support flexible working arrangements while maintaining strong team connections."
  }
]

const benefits = [
  {
    icon: <Building2 className="h-6 w-6 text-blue-600" />,
    title: "Competitive Package",
    items: [
      "Industry-leading salary",
      "Share options scheme",
      "Performance bonus",
      "Regular salary reviews"
    ]
  },
  {
    icon: <Heart className="h-6 w-6 text-blue-600" />,
    title: "Health & Wellbeing",
    items: [
      "Private healthcare (Bupa)",
      "Dental & Vision coverage",
      "Mental health support",
      "Annual wellness budget"
    ]
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
    title: "Growth & Development",
    items: [
      "£2,000 learning budget",
      "Conference allowance",
      "Mentorship program",
      "Career progression"
    ]
  },
  {
    icon: <Globe2 className="h-6 w-6 text-blue-600" />,
    title: "Work-Life Balance",
    items: [
      "Remote-first culture",
      "Flexible hours",
      "25 days holiday + bank holidays",
      "Paid sabbatical after 3 years"
    ]
  }
]

const stats = [
  { number: "500+", label: "Care Homes Using Our Platform", icon: <Building2 className="h-6 w-6 text-blue-600" /> },
  { number: "98%", label: "Employee Satisfaction", icon: <Star className="h-6 w-6 text-blue-600" /> },
  { number: "£2.5M", label: "Investment in R&D", icon: <Target className="h-6 w-6 text-blue-600" /> },
  { number: "4.8/5", label: "Glassdoor Rating", icon: <Zap className="h-6 w-6 text-blue-600" /> }
]

export function Careers() {
  return (
    <div className="bg-white">
      {/* Hero Section with Stats */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-100 to-blue-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a href="#positions" className="inline-flex space-x-6">
                <Badge className="rounded-full px-3 py-1 text-sm font-semibold leading-6 bg-blue-600 text-white">
                  We're hiring
                </Badge>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                  <span>View open positions</span>
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </span>
              </a>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Join our mission to transform care home management
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're building the future of care home software, improving lives of residents and staff across the UK. Join our team and make a real difference.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="#positions">View Open Positions</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full">
                <Link href="#about">Learn About Us</Link>
              </Button>
            </div>
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
                  <div className="mt-4 text-base text-gray-600">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 bg-gray-50" id="about">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl -z-10" />
        <div className="mx-auto max-w-2xl lg:text-center">
          <Badge className="mb-4" variant="outline">Our Culture</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Values
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            These core values guide everything we do, from product development to customer support.
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

      {/* Benefits Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <Badge className="mb-4" variant="outline">Benefits</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Benefits & Perks
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We offer comprehensive benefits to support our team's well-being and growth.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((category) => (
                <Card key={category.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                    <ul className="space-y-3">
                      {category.items.map((item) => (
                        <li key={item} className="flex items-center gap-x-3">
                          <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 bg-gray-50" id="positions">
        <div className="mx-auto max-w-2xl lg:text-center">
          <Badge className="mb-4" variant="outline">Careers</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Open Positions
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join our growing team and help us transform care home management.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8">
            {positions.map((position) => (
              <Card key={position.title} className="group p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                          {position.level}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-x-4 text-sm">
                        <span className="flex items-center gap-x-1 text-gray-500">
                          <Briefcase className="h-4 w-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-x-1 text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-x-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-blue-600 font-medium">
                        {position.salary}
                      </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href={`mailto:careers@writecarenotes.com?subject=Application for ${position.title}`}>
                        Apply Now
                      </Link>
                    </Button>
                  </div>
                  <p className="text-gray-600">{position.description}</p>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Requirements:</h4>
                      <ul className="space-y-3">
                        {position.requirements.map((requirement) => (
                          <li key={requirement} className="flex items-start gap-x-3">
                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                            <span className="text-gray-600">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Responsibilities:</h4>
                      <ul className="space-y-3">
                        {position.responsibilities.map((responsibility) => (
                          <li key={responsibility} className="flex items-start gap-x-3">
                            <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                            <span className="text-gray-600">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {position.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="bg-gray-100">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white -z-10" />
        <div className="relative mx-auto max-w-2xl text-center">
          <Badge className="mb-4" variant="outline">Get in Touch</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Don't see the right role?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We're always looking for talented individuals to join our team. Send us your CV and let us know how you can contribute.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="mailto:careers@writecarenotes.com?subject=General Application">
                Send Us Your CV
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 