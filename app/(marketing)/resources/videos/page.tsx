import { Metadata } from "next"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button/Button"
import { Video, Play, Clock, Tag } from "lucide-react"

export const metadata: Metadata = {
  title: "Training Videos | Write Care Notes",
  description: "Watch step-by-step tutorials and training videos for Write Care Notes.",
}

const videos = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of Write Care Notes in 10 minutes",
    duration: "10:25",
    category: "Beginner",
    thumbnail: "/videos/getting-started.jpg"
  },
  {
    title: "Daily Care Documentation",
    description: "Best practices for recording daily care activities",
    duration: "15:30",
    category: "Core Skills",
    thumbnail: "/videos/daily-care.jpg"
  },
  {
    title: "Care Plan Management",
    description: "Creating and managing effective care plans",
    duration: "20:15",
    category: "Advanced",
    thumbnail: "/videos/care-plans.jpg"
  }
]

export default function VideosPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">
          Training Videos
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Learn through our comprehensive video tutorials
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.title} className="overflow-hidden group">
            <div className="relative aspect-video bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-12 h-12 rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {video.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {video.category}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
