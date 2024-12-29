/**
 * @fileoverview Regional Configuration for Pain Management
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { Region } from '@/lib/region/types';

export const painScaleConfig = {
  [Region.ENGLAND]: {
    scales: ['NUMERIC', 'VISUAL', 'WONG_BAKER', 'ABBEY'],
    requiresDoubleSignOff: true,
    escalationThreshold: 7,
  },
  [Region.WALES]: {
    scales: ['NUMERIC', 'VISUAL', 'WONG_BAKER', 'ABBEY'],
    requiresWelshLanguage: true,
    escalationThreshold: 7,
  },
  [Region.SCOTLAND]: {
    scales: ['NUMERIC', 'VISUAL', 'WONG_BAKER', 'ABBEY', 'PAINAD'],
    requiresScottishGuidelines: true,
    escalationThreshold: 6,
  },
  [Region.NORTHERN_IRELAND]: {
    scales: ['NUMERIC', 'VISUAL', 'WONG_BAKER', 'ABBEY'],
    requiresRQIACompliance: true,
    escalationThreshold: 7,
  },
  [Region.IRELAND]: {
    scales: ['NUMERIC', 'VISUAL', 'WONG_BAKER', 'ABBEY'],
    requiresHIQACompliance: true,
    escalationThreshold: 7,
  }
}; 