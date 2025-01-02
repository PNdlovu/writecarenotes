import { type VisualContainer } from '../../../types/hydration'

export interface HydrationVisual3DProps {
  /**
   * Container configuration for visualization
   */
  container: VisualContainer

  /**
   * Current amount of liquid in the container
   */
  currentAmount: number

  /**
   * Whether the container can be interactively manipulated
   * @default true
   */
  interactive?: boolean

  /**
   * Callback when amount changes through interaction
   */
  onAmountChange?: (amount: number) => void

  /**
   * Additional CSS classes
   */
  className?: string
}
