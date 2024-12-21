/**
 * WriteCareNotes.com
 * @fileoverview About Team Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Card } from '@/components/ui/card'
import { Linkedin, Twitter } from 'lucide-react'

const team = [
  {
    name: 'Dr. Sarah Thompson',
    role: 'Chief Executive Officer',
    bio: '20+ years experience in healthcare technology and care home management.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'James Wilson',
    role: 'Chief Technology Officer',
    bio: 'Former NHS Digital architect with expertise in healthcare systems.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Emma Roberts',
    role: 'Head of Care Standards',
    bio: 'Registered nurse with 15 years of care home management experience.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'David Chen',
    role: 'Head of Product',
    bio: 'Specialist in user-centered design for healthcare applications.',
    linkedin: '#',
    twitter: '#',
  },
]

export function AboutTeam() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
        <p className="text-lg text-muted-foreground">
          Meet the experienced professionals dedicated to transforming care home management.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, index) => (
          <Card key={index} className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10" />
              <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-primary mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
              <div className="flex justify-center space-x-4">
                <a href={member.linkedin} className="text-muted-foreground hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={member.twitter} className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 