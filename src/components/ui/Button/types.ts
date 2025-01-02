/**
 * @writecarenotes.com
 * @fileoverview Type definitions for the Button component
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions and interfaces for the Button component including
 * props, variants, and sizes.
 */

import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "./variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export type ButtonVariant = 
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "emergency"
  | "care"
  | "success"
  | "warning";

export type ButtonSize = "default" | "sm" | "lg" | "icon"; 