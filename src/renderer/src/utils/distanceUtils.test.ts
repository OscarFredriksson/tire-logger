import { formatDistance } from './distanceUtils';

describe('formatDistance', () => {
  it('should format distances less than 1000 meters as meters', () => {
    expect(formatDistance(230)).toBe('230 m');
    expect(formatDistance(999)).toBe('999 m');
  });

  it('should format distances 1000 meters or more as kilometers', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
    expect(formatDistance(2300)).toBe('2.3 km');
    expect(formatDistance(12345)).toBe('12.3 km');
  });
});
