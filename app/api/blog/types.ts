/**
 * @writecarenotes.com
 * @fileoverview Blog types and interfaces
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for blog posts, comments, and related entities.
 */

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum CategoryType {
  REGULATION = 'REGULATION',
  BEST_PRACTICE = 'BEST_PRACTICE',
  NEWS = 'NEWS',
  TRAINING = 'TRAINING',
  WEBINAR = 'WEBINAR',
  CASE_STUDY = 'CASE_STUDY',
  INTERVIEW = 'INTERVIEW',
}

export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Region {
  ENGLAND = 'ENGLAND',
  WALES = 'WALES',
  SCOTLAND = 'SCOTLAND',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  IRELAND = 'IRELAND',
}

export enum RegulatoryBody {
  CQC = 'CQC',
  OFSTED = 'OFSTED',
  CIW = 'CIW',
  CARE_INSPECTORATE = 'CARE_INSPECTORATE',
  HIQA = 'HIQA',
  RQIA = 'RQIA',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  expertise: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  postId: string;
  author: User;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: PostStatus;
  region: Region[];
  regulatoryBodies?: RegulatoryBody[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  authorId: string;
  categories: Category[];
  comments: Comment[];
  metadata?: Record<string, unknown>;
} 