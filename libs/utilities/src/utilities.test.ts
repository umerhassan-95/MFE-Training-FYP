import { describe, expect, it } from 'vitest';
import { currency } from './index';

describe('utilities', () => {
  it('formats USD currency', () => {
    expect(currency(48)).toBe('$48.00');
  });
});
