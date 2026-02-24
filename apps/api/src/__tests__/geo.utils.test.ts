import { haversineDistance, sortByDistance } from '../utils/geo';

describe('Geo Utils', () => {
  describe('haversineDistance()', () => {
    it('returns 0 for same point', () => {
      const dist = haversineDistance(-17.8292, 31.0522, -17.8292, 31.0522);
      expect(dist).toBe(0);
    });

    it('calculates distance between Harare CBD and Borrowdale (~8km)', () => {
      // Harare CBD to Borrowdale approx 8km
      const dist = haversineDistance(-17.8292, 31.0522, -17.7631, 31.0869);
      expect(dist).toBeGreaterThan(6);
      expect(dist).toBeLessThan(10);
    });

    it('calculates distance between Harare and Bulawayo (~360km)', () => {
      const dist = haversineDistance(-17.8292, 31.0522, -20.1325, 28.6265);
      expect(dist).toBeGreaterThan(340);
      expect(dist).toBeLessThan(400);
    });
  });

  describe('sortByDistance()', () => {
    const mechanics = [
      { id: 'far', latitude: -20.1325, longitude: 28.6265 },   // Bulawayo
      { id: 'near', latitude: -17.83, longitude: 31.05 },       // Harare CBD
      { id: 'mid', latitude: -17.7631, longitude: 31.0869 },    // Borrowdale
    ];

    it('sorts mechanics by distance from a point (nearest first)', () => {
      const sorted = sortByDistance(mechanics, -17.8292, 31.0522);
      expect(sorted[0].id).toBe('near');
      expect(sorted[1].id).toBe('mid');
      expect(sorted[2].id).toBe('far');
    });

    it('attaches distance to each result', () => {
      const sorted = sortByDistance(mechanics, -17.8292, 31.0522);
      expect(sorted[0].distance).toBeDefined();
      expect(sorted[0].distance).toBeLessThan(2); // near is very close
      expect(sorted[2].distance).toBeGreaterThan(340); // far is Bulawayo
    });
  });
});
