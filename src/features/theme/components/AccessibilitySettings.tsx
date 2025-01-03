/**
 * @writecarenotes.com
 * @fileoverview Accessibility settings component for theme customization
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "next-themes"

export function AccessibilitySettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="dark-mode">Dark Mode</Label>
        <Switch
          id="dark-mode"
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="font-size">Font Size</Label>
        <Select value="medium" onValueChange={() => {}}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="motion">Reduce Motion</Label>
        <Switch id="motion" />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="contrast">High Contrast</Label>
        <Switch id="contrast" />
      </div>
    </div>
  )
} 