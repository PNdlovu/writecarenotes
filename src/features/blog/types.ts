/**
 * @writecarenotes.com
 * @fileoverview Types for the blog feature
 * @version 1.0.0
 * @created 2024-01-01
 * @updated 2024-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the blog feature including post types, categories,
 * regions, and regulatory bodies.
 */

export enum CategoryType {
  CARE_QUALITY = 'CARE_QUALITY',
  COMPLIANCE = 'COMPLIANCE',
  BEST_PRACTICES = 'BEST_PRACTICES',
  REGULATORY_UPDATES = 'REGULATORY_UPDATES',
  STAFF_TRAINING = 'STAFF_TRAINING',
  RESIDENT_CARE = 'RESIDENT_CARE',
  DOCUMENTATION = 'DOCUMENTATION',
  HEALTH_SAFETY = 'HEALTH_SAFETY',
  MEDICATION = 'MEDICATION',
  NUTRITION = 'NUTRITION',
  ACTIVITIES = 'ACTIVITIES',
  FAMILY_ENGAGEMENT = 'FAMILY_ENGAGEMENT',
  TECHNOLOGY = 'TECHNOLOGY',
  INDUSTRY_NEWS = 'INDUSTRY_NEWS'
}

export enum Region {
  ENGLAND = 'ENGLAND',
  WALES = 'WALES',
  SCOTLAND = 'SCOTLAND',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  IRELAND = 'IRELAND'
}

export enum RegulatoryBody {
  CQC = 'CQC',
  CIW = 'CIW',
  CARE_INSPECTORATE = 'CARE_INSPECTORATE',
  RQIA = 'RQIA',
  HIQA = 'HIQA',
  OFSTED = 'OFSTED'
}

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  categories: CategoryType[];
  regions: Region[];
  regulatoryBodies: RegulatoryBody[];
  tags: string[];
  slug: string;
  readTime: number;
  views: number;
  likes: number;
  comments: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      role: string;
      avatar?: string;
    };
    createdAt: Date;
    updatedAt?: Date;
    likes: number;
    replies?: {
      id: string;
      content: string;
      author: {
        id: string;
        name: string;
        role: string;
        avatar?: string;
      };
      createdAt: Date;
      updatedAt?: Date;
      likes: number;
    }[];
  }[];
} 