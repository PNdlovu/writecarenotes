/**
 * WriteCareNotes.com
 * @fileoverview Features Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Features } from '@/components/marketing/Features'
import { Bell, ClipboardList, FileCheck, HeartPulse, Lock, Pills, UserCircle, Users, Wifi } from 'lucide-react'

const features = [
  {
    name: 'Care Planning',
    description: "Comprehensive digital care plans that adapt to each resident's unique needs. Real-time updates and easy access for care staff.",
    iconName: 'ClipboardList',
    color: 'text-blue-500',
    gradient: 'from-blue-500/10 to-blue-500/5'
  },
  {
    name: 'Medication Management',
    description: "Secure medication tracking with MAR charts, automated alerts, and comprehensive audit trails.",
    iconName: 'Pills',
    color: 'text-green-500',
    gradient: 'from-green-500/10 to-green-500/5'
  },
  {
    name: 'Staff Management',
    description: "Efficient rota planning, skill matching, and staff allocation. Track training and certifications.",
    iconName: 'Users',
    color: 'text-purple-500',
    gradient: 'from-purple-500/10 to-purple-500/5'
  },
  {
    name: 'Incident Reporting',
    description: "Quick and detailed incident reporting with automatic notifications and follow-up tracking.",
    iconName: 'Bell',
    color: 'text-red-500',
    gradient: 'from-red-500/10 to-red-500/5'
  },
  {
    name: 'Family Portal',
    description: "Keep families connected with secure access to updates, photos, and communications about their loved ones.",
    iconName: 'UserCircle',
    color: 'text-yellow-500',
    gradient: 'from-yellow-500/10 to-yellow-500/5'
  },
  {
    name: 'Compliance & Reporting',
    description: "Built-in compliance checks and automated reporting for CQC, CIW, and other regulatory bodies.",
    iconName: 'FileCheck',
    color: 'text-indigo-500',
    gradient: 'from-indigo-500/10 to-indigo-500/5'
  },
  {
    name: 'Offline Support',
    description: "Continue working even without internet connection. Automatic sync when connection is restored.",
    iconName: 'Wifi',
    color: 'text-cyan-500',
    gradient: 'from-cyan-500/10 to-cyan-500/5'
  },
  {
    name: 'Data Security',
    description: "Enterprise-grade security with encryption, role-based access control, and regular backups.",
    iconName: 'Lock',
    color: 'text-slate-500',
    gradient: 'from-slate-500/10 to-slate-500/5'
  },
  {
    name: 'Health Monitoring',
    description: "Track vital signs, health metrics, and wellness indicators. Early warning system for health changes.",
    iconName: 'HeartPulse',
    color: 'text-rose-500',
    gradient: 'from-rose-500/10 to-rose-500/5'
  }
]

export default function FeaturesPage() {
  return <Features features={features} />
}
