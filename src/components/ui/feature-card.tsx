import { LucideIcon } from "lucide-react"
import { Card } from "./card"
import { CheckCircle2 } from "lucide-react"

interface FeatureCardProps {
  title: string
  icon: LucideIcon
  iconClassName?: string
  capabilities: string[]
}

export function FeatureCard({ title, icon: Icon, iconClassName, capabilities }: FeatureCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <Icon className={`h-10 w-10 ${iconClassName}`} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ul className="space-y-2">
        {capabilities.map((capability, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>{capability}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
} 