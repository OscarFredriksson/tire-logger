import { formatDate } from './dateUtils';

describe('dateUtils', () => {
  it('should format today correctly', () => {
    const today = new Date();
    expect(formatDate(today)).toContain('Today at');
  });

  it('should format yesterday correctly', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatDate(yesterday)).toContain('Yesterday at');
  });

  it('should format date from earlier on a generalized format', () => {
    const earlierDate = new Date('2025-03-10');
    expect(formatDate(earlierDate)).toContain('Mar 10, 2025 at');
  });
});
