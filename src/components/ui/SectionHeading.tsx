import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  subtitle: string
  className?: string
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl mx-auto text-center", className)}>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600">
        {subtitle}
      </p>
    </div>
  )
} 