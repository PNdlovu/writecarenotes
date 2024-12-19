export type Region = 
  // UK Regions
  | 'ENGLAND'
  | 'WALES'
  | 'SCOTLAND'
  | 'NORTHERN_IRELAND'
  // Ireland
  | 'IRELAND'
  // Channel Islands
  | 'JERSEY'
  | 'GUERNSEY'
  // Isle of Man
  | 'ISLE_OF_MAN';

export type Language =
  | 'en-GB'    // British English
  | 'cy'       // Welsh
  | 'gd'       // Scottish Gaelic
  | 'ga'       // Irish
  | 'gv';      // Manx Gaelic

export interface RegionalSettings {
  region: Region;
  language: Language;
  timezone: string;
  dateFormat: string;
  currencyCode: string;
  measurementSystem: 'METRIC' | 'IMPERIAL';
  regulatoryBody: string;
  emergencyNumbers: string[];
}


