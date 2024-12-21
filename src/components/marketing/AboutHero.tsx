/**
 * WriteCareNotes.com
 * @fileoverview About Hero Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export function AboutHero() {
  return (
    <div className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Transforming Care Home Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            We're on a mission to revolutionize care home operations through innovative digital solutions,
            empowering care providers to deliver exceptional resident care.
          </p>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Care Homes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50,000+</div>
              <div className="text-sm text-muted-foreground">Residents Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 