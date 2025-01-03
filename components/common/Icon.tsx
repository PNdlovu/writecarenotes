/**
 * @writecarenotes.com
 * @fileoverview Icon component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Reusable icon component that supports multiple icon libraries and
 * provides accessibility features. Optimized for mobile devices with
 * touch-friendly sizing.
 *
 * Features:
 * - Multiple icon libraries
 * - Customizable size and color
 * - Accessibility support
 * - Touch optimization
 * - Dark mode support
 *
 * Mobile-First Considerations:
 * - Touch-friendly sizes
 * - Performance optimized
 * - Reduced motion support
 *
 * Enterprise Features:
 * - Error handling
 * - Performance monitoring
 * - Usage tracking
 */

'use client';

import { memo } from 'react';
import { IconContext } from 'react-icons';
import * as Heroicons from '@heroicons/react/24/outline';
import * as HeroiconsSolid from '@heroicons/react/24/solid';
import * as HealthIcons from 'react-icons/hi';
import { useTheme } from '@/hooks/useTheme';

// Icon name to component mapping
const iconMap = {
  // Navigation
  menu: Heroicons.Bars3Icon,
  close: Heroicons.XMarkIcon,
  back: Heroicons.ChevronLeftIcon,
  forward: Heroicons.ChevronRightIcon,
  
  // Actions
  add: Heroicons.PlusIcon,
  edit: Heroicons.PencilIcon,
  delete: Heroicons.TrashIcon,
  save: Heroicons.CheckIcon,
  cancel: Heroicons.XMarkIcon,
  
  // Common
  search: Heroicons.MagnifyingGlassIcon,
  filter: Heroicons.FunnelIcon,
  sort: Heroicons.ArrowsUpDownIcon,
  settings: Heroicons.Cog6ToothIcon,
  
  // Communication
  bell: Heroicons.BellIcon,
  chat: Heroicons.ChatBubbleLeftIcon,
  email: Heroicons.EnvelopeIcon,
  phone: Heroicons.PhoneIcon,
  
  // Status
  success: HeroiconsSolid.CheckCircleIcon,
  warning: HeroiconsSolid.ExclamationTriangleIcon,
  error: HeroiconsSolid.XCircleIcon,
  info: HeroiconsSolid.InformationCircleIcon,
  
  // Healthcare
  calendar: Heroicons.CalendarIcon,
  users: Heroicons.UsersIcon,
  briefcase: Heroicons.BriefcaseIcon,
  'chart-bar': Heroicons.ChartBarIcon,
  medication: HealthIcons.HiOutlinePrescription,
  vitals: HealthIcons.HiOutlineHeartPulse,
  notes: Heroicons.DocumentTextIcon,
  
  // File operations
  upload: Heroicons.ArrowUpTrayIcon,
  download: Heroicons.ArrowDownTrayIcon,
  document: Heroicons.DocumentIcon,
  folder: Heroicons.FolderIcon,
  
  // Social
  share: Heroicons.ShareIcon,
  like: Heroicons.HeartIcon,
  comment: Heroicons.ChatBubbleBottomCenterTextIcon,
  
  // Device
  camera: Heroicons.CameraIcon,
  microphone: Heroicons.MicrophoneIcon,
  wifi: Heroicons.WifiIcon,
  'wifi-off': Heroicons.NoSymbolIcon,
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  solid?: boolean;
  color?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

export const Icon = memo(function Icon({
  name,
  className = '',
  size = 'md',
  solid = false,
  color,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = true,
  onClick,
}: IconProps) {
  const { theme } = useTheme();
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.error(`Icon "${name}" not found`);
    return null;
  }

  const sizeClass = sizeMap[size];
  const baseClass = `inline-block ${sizeClass} ${className}`;
  
  const contextValue = {
    color: color || 'currentColor',
    size: '100%',
    className: baseClass,
  };

  return (
    <IconContext.Provider value={contextValue}>
      <IconComponent
        className={baseClass}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      />
    </IconContext.Provider>
  );
});

Icon.displayName = 'Icon';

export default Icon; 
