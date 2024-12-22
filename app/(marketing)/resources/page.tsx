'use client';

import ResourcesContent from '@/components/marketing/ResourcesContent';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fcfc]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            Resources & Support
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Everything you need to succeed with Write Care Notes
          </p>
        </div>
        <ResourcesContent />
      </div>
    </div>
  )
}
