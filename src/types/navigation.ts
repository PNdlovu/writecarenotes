/**
 * @fileoverview Navigation type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

export interface SubNavItem {
  name: string;
  href: string;
  pattern: RegExp;
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  pattern: RegExp;
  subItems?: SubNavItem[];
} 


