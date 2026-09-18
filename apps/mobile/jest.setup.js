// Jest setup file
// Add any global test setup here

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  GeoPoint: jest.fn((lat, lng) => ({ latitude: lat, longitude: lng })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  },
}));
