/**
 * @writecarenotes.com
 * @fileoverview Centralized icon exports for consistent icon usage
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
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
  Building
} from "lucide-react"

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
  analytics: BarChart
}