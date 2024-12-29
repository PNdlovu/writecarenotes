import {
  Building,
  Wrench,
  BoxSelect,
  Users,
  ClipboardCheck,
  BarChart,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  building: Building,
  wrench: Wrench,
  boxes: BoxSelect,
  users: Users,
  clipboardCheck: ClipboardCheck,
  chartBar: BarChart,
  arrowRight: ArrowRight,
  externalLink: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
} as const;
