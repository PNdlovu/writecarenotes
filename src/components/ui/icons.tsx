/**
 * @writecarenotes.com
 * @fileoverview Centralized icon exports for consistent icon usage
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A centralized collection of icon components used throughout the application.
 * Re-exports icons from Lucide React with consistent naming conventions and
 * organization. Helps maintain icon consistency and simplifies icon management
 * across the application.
 */

import {
  Stethoscope,
  Pill,
  Activity,
  Shield,
  FileCheck,
  Star,
  Users,
  Wallet,
  Building2,
  Network,
  BarChart,
  Building,
  Plus,
  Loader2,
  MoreVertical,
  type LucideIcon
} from "lucide-react"

export type Icon = LucideIcon;

export const Icons = {
  medical: Stethoscope,
  medication: Pill,
  health: Activity,
  security: Shield,
  compliance: FileCheck,
  quality: Star,
  staff: Users,
  finance: Wallet,
  facilities: Building2,
  multisite: Building,
  integration: Network,
  analytics: BarChart,
  plus: Plus,
  spinner: Loader2,
  moreVertical: MoreVertical
}
