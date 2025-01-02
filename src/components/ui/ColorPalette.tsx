import * as React from "react"
import { cn } from "@/lib/utils"

interface ColorSwatchProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string
  name: string
  hex: string
}

const ColorSwatch = React.forwardRef<HTMLDivElement, ColorSwatchProps>(
  ({ color, name, hex, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5", className)}
        {...props}
      >
        <div
          className={cn(
            "h-24 w-24 rounded-lg",
            color
          )}
        />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{hex}</p>
        </div>
      </div>
    )
  }
)
ColorSwatch.displayName = "ColorSwatch"

export function ColorPalette() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <ColorSwatch
        color="bg-brand-blue"
        name="Brand Blue"
        hex="#017CFC"
      />
      <ColorSwatch
        color="bg-brand-blue-80"
        name="Brand Blue 80"
        hex="#3496FD"
      />
      <ColorSwatch
        color="bg-brand-blue-60"
        name="Brand Blue 60"
        hex="#67B0FD"
      />
      <ColorSwatch
        color="bg-brand-blue-40"
        name="Brand Blue 40"
        hex="#9ACAFE"
      />
      <ColorSwatch
        color="bg-brand-blue-20"
        name="Brand Blue 20"
        hex="#CCE4FE"
      />
      <ColorSwatch
        color="bg-brand-green"
        name="Brand Green"
        hex="#8FD10A"
      />
      <ColorSwatch
        color="bg-brand-green-80"
        name="Brand Green 80"
        hex="#A5DA38"
      />
      <ColorSwatch
        color="bg-brand-green-60"
        name="Brand Green 60"
        hex="#BBE366"
      />
      <ColorSwatch
        color="bg-brand-green-40"
        name="Brand Green 40"
        hex="#D1EC94"
      />
      <ColorSwatch
        color="bg-brand-green-20"
        name="Brand Green 20"
        hex="#E8F6C2"
      />
    </div>
  )
} 


