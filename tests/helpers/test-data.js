/**
 * Test Data Helpers
 * Provides consistent test data across all test suites
 */

export const mockTraining = {
  id: 1,
  name: 'Parkour Anfänger',
  beschreibung: 'Grundlagen des Parkour für Einsteiger',
  wochentag: 'Montag',
  zeit: '18:00 - 19:30',
  ort: 'Sporthalle München',
  adresse: 'Teststraße 123, 80333 München',
  lat: 48.1351,
  lng: 11.582,
  altersgruppe: '10-14',
  trainer: 'Max Mustermann',
  anmeldelink: 'https://example.com/anmelden',
  kategorie: 'Parkour',
  level: 'Anfänger',
  features: ['Indoor', 'Anfänger geeignet']
}

export const mockTrainings = [
  mockTraining,
  {
    id: 2,
    name: 'Trampolin Fortgeschritten',
    beschreibung: 'Fortgeschrittene Trampolin-Techniken',
    wochentag: 'Dienstag',
    zeit: '17:00 - 18:30',
    ort: 'Trampolinhalle Süd',
    adresse: 'Südstraße 456, 80331 München',
    lat: 48.1171,
    lng: 11.5753,
    altersgruppe: '14-18',
    trainer: 'Anna Schmidt',
    anmeldelink: 'https://example.com/trampolin',
    kategorie: 'Trampolin',
    level: 'Fortgeschritten',
    features: ['Indoor', 'Fortgeschritten']
  },
  {
    id: 3,
    name: 'Tricking Workshop',
    beschreibung: 'Acrobatische Kicks und Flips',
    wochentag: 'Mittwoch',
    zeit: '19:00 - 21:00',
    ort: 'Fitnessstudio Nord',
    adresse: 'Nordweg 789, 80335 München',
    lat: 48.1549,
    lng: 11.5418,
    altersgruppe: '16+',
    trainer: 'Tom Weber',
    anmeldelink: null,
    kategorie: 'Tricking',
    level: 'Alle Level',
    features: ['Indoor', 'Workshop']
  }
]

export const mockMetadata = {
  version: '2.4.0',
  lastUpdate: '2025-01-15T10:00:00Z',
  kategorien: ['Parkour', 'Trampolin', 'Tricking'],
  orte: ['Sporthalle München', 'Trampolinhalle Süd', 'Fitnessstudio Nord'],
  wochentage: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
}

export const mockUserPosition = {
  lat: 48.1371,
  lng: 11.5754
}

export const mockFilters = {
  clean: {
    suchbegriff: '',
    kategorie: [],
    wochentag: [],
    altersgruppe: [],
    ort: [],
    nurFavoriten: false,
    nurHeute: false
  },
  withCategory: {
    suchbegriff: '',
    kategorie: ['Parkour'],
    wochentag: [],
    altersgruppe: [],
    ort: [],
    nurFavoriten: false,
    nurHeute: false
  },
  withMultipleFilters: {
    suchbegriff: 'Anfänger',
    kategorie: ['Parkour'],
    wochentag: ['Montag'],
    altersgruppe: ['10-14'],
    ort: [],
    nurFavoriten: false,
    nurHeute: false
  }
}

/**
 * Creates a deep copy of mock data to prevent test pollution
 */
export function createMockTrainings() {
  return JSON.parse(JSON.stringify(mockTrainings))
}

export function createMockTraining(overrides = {}) {
  return { ...mockTraining, ...overrides }
}

export function createMockMetadata(overrides = {}) {
  return { ...mockMetadata, ...overrides }
}

export function createMockFilters(type = 'clean') {
  return JSON.parse(JSON.stringify(mockFilters[type] || mockFilters.clean))
}
