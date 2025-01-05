import { describe, it, expect, beforeEach } from '@jest/globals';
import { LanguageService } from '../services/language-service';

describe('Language Service', () => {
  let languageService: LanguageService;

  beforeEach(() => {
    languageService = new LanguageService();
  });

  describe('Language Configuration', () => {
    it('should support English (UK)', async () => {
      await languageService.setLanguage('en-GB');
      const term = languageService.getTerminology('PERSONAL_CARE', 'en-GB');
      expect(term).toBe('Personal Care');
    });

    it('should support Welsh', async () => {
      await languageService.setLanguage('cy-GB');
      const term = languageService.getTerminology('PERSONAL_CARE', 'cy-GB');
      expect(term).toBe('Gofal Personol');
    });

    it('should handle unsupported languages gracefully', async () => {
      await expect(languageService.setLanguage('xx-XX')).rejects.toThrow();
    });
  });

  describe('Care Terminology', () => {
    it('should provide children\'s home terminology in English', () => {
      const terms = [
        'EDUCATION_SUPPORT',
        'SAFEGUARDING',
        'EMOTIONAL_SUPPORT',
        'LIFE_SKILLS',
      ];

      terms.forEach(term => {
        const translation = languageService.getTerminology(term, 'en-GB');
        expect(translation).toBeTruthy();
      });
    });

    it('should provide children\'s home terminology in Welsh', () => {
      const terms = [
        'EDUCATION_SUPPORT',
        'SAFEGUARDING',
        'EMOTIONAL_SUPPORT',
        'LIFE_SKILLS',
      ];

      terms.forEach(term => {
        const translation = languageService.getTerminology(term, 'cy-GB');
        expect(translation).toBeTruthy();
      });
    });
  });

  describe('Regional Terminology', () => {
    it('should provide correct terminology for England', () => {
      const terms = languageService.getRegionalTerminology('ENGLAND');
      expect(terms.get('CARE_HOME')).toBe('Care Home');
      expect(terms.get('RESIDENT')).toBe('Resident');
    });

    it('should provide correct terminology for Wales', () => {
      const terms = languageService.getRegionalTerminology('WALES');
      expect(terms.get('CARE_HOME')).toBe('Cartref Gofal');
      expect(terms.get('RESIDENT')).toBe('Preswylydd');
    });
  });

  describe('Formatting', () => {
    it('should format dates according to regional preferences', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = languageService.formatDate(date, 'en-GB');
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should format currency according to regional preferences', () => {
      const amount = 100.50;
      const formatted = languageService.formatCurrency(amount, 'en-GB');
      expect(formatted).toBe('£100.50');
    });

    it('should format time according to regional preferences', () => {
      const time = new Date('2024-01-01T14:30:00Z');
      const formatted = languageService.formatTime(time, 'en-GB');
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });
});
