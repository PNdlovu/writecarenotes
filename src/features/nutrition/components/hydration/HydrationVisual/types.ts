import { type VisualContainer } from '../../../types/hydration'

export interface HydrationVisualProps {
  /**
   * Container configuration for visualization
   */
  container: VisualContainer

  /**
   * Current amount of liquid in the container
   */
  currentAmount: number

  /**
   * Whether to animate the liquid fill
   * @default true
   */
  animate?: boolean

  /**
   * Whether the container can be interactively filled
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
