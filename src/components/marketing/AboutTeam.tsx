/**
 * WriteCareNotes.com
 * @fileoverview About Team Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import { Card } from '@/components/ui/Card'
import { Linkedin, Twitter, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'

const team = [
  {
    name: 'Dr. Sarah Thompson',
    role: 'Chief Executive Officer',
    bio: '20+ years experience in healthcare technology and care home management.',
    image: '/team/sarah-thompson.jpg',
    linkedin: '#',
    twitter: '#',
    email: 'sarah.thompson@writecarenotes.com',
    delay: 0
  },
  {
    name: 'James Wilson',
    role: 'Chief Technology Officer',
    bio: 'Former NHS Digital architect with expertise in healthcare systems.',
    image: '/team/james-wilson.jpg',
    linkedin: '#',
    twitter: '#',
    email: 'james.wilson@writecarenotes.com',
    delay: 0.2
  },
  {
    name: 'Emma Roberts',
    role: 'Head of Care Standards',
    bio: 'Registered nurse with 15 years of care home management experience.',
    image: '/team/emma-roberts.jpg',
    linkedin: '#',
    twitter: '#',
    email: 'emma.roberts@writecarenotes.com',
    delay: 0.4
  },
  {
    name: 'David Chen',
    role: 'Head of Product',
    bio: 'Specialist in user-centered design for healthcare applications.',
    image: '/team/david-chen.jpg',
    linkedin: '#',
    twitter: '#',
    email: 'david.chen@writecarenotes.com',
    delay: 0.6
  },
]

export function AboutTeam() {
  return (
    <div className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Our Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground">
              Meet the experienced professionals dedicated to transforming care home management.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {team.map((member) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: member.delay }}
            >
              <Card className="group relative overflow-hidden">
                <div className="aspect-square relative overflow-hidden">
                  <PlaceholderImage
                    src={member.image}
                    alt={member.name}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                  <div className="flex gap-4">
                    <a
                      href={member.linkedin}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s LinkedIn profile`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={member.twitter}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name}'s Twitter profile`}
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}