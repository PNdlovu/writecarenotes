/**
 * WriteCareNotes.com
 * @fileoverview About Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { AboutHero } from '@/components/marketing/AboutHero'
import { AboutMission } from '@/components/marketing/AboutMission'
import { AboutTeam } from '@/components/marketing/AboutTeam'
import { AboutValues } from '@/components/marketing/AboutValues'

export default function AboutPage() {
  return (
    <div className="space-y-20">
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
    </div>
  )
} 