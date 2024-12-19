import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva(
  "font-sans font-bold tracking-tight",
  {
    variants: {
      variant: {
        h1: "text-4xl lg:text-5xl",
        h2: "text-3xl lg:text-4xl",
        h3: "text-2xl lg:text-3xl",
        h4: "text-xl lg:text-2xl",
        h5: "text-lg lg:text-xl",
        h6: "text-base lg:text-lg",
      },
    },
    defaultVariants: {
      variant: "h1",
    },
  }
)

const textVariants = cva(
  "font-sans",
  {
    variants: {
      variant: {
        default: "text-base",
        lead: "text-xl text-muted-foreground",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        muted: "text-sm text-muted-foreground",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      weight: "normal",
    },
  }
)

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = as || (variant as keyof JSX.IntrinsicElements) || "h1"
    return (
      <Comp
        className={cn(headingVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, weight, ...props }, ref) => {
    return (
      <p
        className={cn(textVariants({ variant, weight, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { headingVariants, textVariants } 


