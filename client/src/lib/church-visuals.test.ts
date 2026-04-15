import { describe, it, expect } from 'vitest';

import { getChurchVisualTheme, getChurchMonogram } from './church-visuals';

describe('getChurchVisualTheme', () => {
  it('returns a theme object with surfaceClass, glowClass, outlineClass', () => {
    const theme = getChurchVisualTheme({
      name: 'Grace Baptist',
      slug: 'grace-baptist',
      denomination: 'Baptist',
      neighborhood: 'Downtown',
    });

    expect(theme).toBeDefined();
    expect(theme).toHaveProperty('surfaceClass');
    expect(theme).toHaveProperty('glowClass');
    expect(theme).toHaveProperty('outlineClass');
    expect(typeof theme.surfaceClass).toBe('string');
    expect(typeof theme.glowClass).toBe('string');
    expect(typeof theme.outlineClass).toBe('string');
  });

  it('returns a consistent theme for the same input (deterministic)', () => {
    const input = {
      name: 'San Fernando Cathedral',
      slug: 'san-fernando-cathedral',
      denomination: 'Catholic',
      neighborhood: 'Downtown',
    };

    const theme1 = getChurchVisualTheme(input);
    const theme2 = getChurchVisualTheme(input);

    expect(theme1).toEqual(theme2);
  });

  it('different inputs can produce different themes', () => {
    const themeA = getChurchVisualTheme({
      name: 'Grace Baptist',
      slug: 'grace-baptist',
      denomination: 'Baptist',
      neighborhood: 'Alamo Heights',
    });

    const themeB = getChurchVisualTheme({
      name: 'St. Mark Lutheran',
      slug: 'st-mark-lutheran',
      denomination: 'Lutheran',
      neighborhood: 'Southtown',
    });

    // With only 4 themes some collisions are possible, but these two
    // specific inputs are chosen to produce distinct hashes.
    expect(themeA).not.toEqual(themeB);
  });
});

describe('getChurchMonogram', () => {
  it('returns two initials for a simple two-word name', () => {
    expect(getChurchMonogram('Grace Baptist')).toBe('GB');
  });

  it('filters out stop words', () => {
    expect(getChurchMonogram('The Church of Grace')).toBe('G');
  });

  it('falls back to full words if all words are stop words', () => {
    expect(getChurchMonogram('The Church')).toBe('TC');
  });

  it('returns one initial for a single significant word', () => {
    expect(getChurchMonogram('Grace Church')).toBe('G');
  });

  it('handles names with punctuation', () => {
    expect(getChurchMonogram("St. Mary's")).toBe('SM');
  });
});
