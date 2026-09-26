import { describe, it, expect } from 'vitest';
import { extractRegions } from './geography';

/**
 * p. 179: geography is the subject and places covered, from the text itself.
 * The first three cases are the live mis-tags on the board (L829).
 */
describe('coverage geography (p. 179, L829)', () => {
  it('reads "New England" as the United States, not Europe', () => {
    expect(extractRegions('New England natural gas prices rise ahead of winter', null)).toEqual(['North America']);
  });

  it('reads "eastern New Mexico" as the United States, not Latin America', () => {
    expect(extractRegions('Drilling slows in eastern New Mexico', null)).toEqual(['North America']);
  });

  it('does not treat the pronoun "us" as the United States', () => {
    expect(extractRegions('What the heatwave tells us about adaptation', null)).toEqual(['Not Specified']);
    expect(extractRegions('US grid operators warn of summer peaks', null)).toEqual(['North America']);
  });

  it('does not read a currency as a place', () => {
    expect(extractRegions('Fund raises US$500m for solar', null)).toEqual(['Not Specified']);
  });

  it('says Not Specified when no place is named, instead of defaulting to Global', () => {
    expect(extractRegions('Battery storage costs fall again', 'Prices dropped for the third year.')).toEqual(['Not Specified']);
  });

  it('says Global only when the text says so', () => {
    expect(extractRegions('Global emissions hit a record', null)).toEqual(['Global']);
    // "World Bank" says nothing about coverage.
    expect(extractRegions('World Bank approves loan', null)).toEqual(['Not Specified']);
  });

  it('adds Multiple Regions when two regions are named', () => {
    expect(extractRegions('EU and China agree on carbon border talks', null)).toEqual(['Europe', 'Asia', 'Multiple Regions']);
  });

  it('counts one country listed under two regions as one place', () => {
    expect(extractRegions('Egypt expands wind capacity', null)).toEqual(['Middle East', 'Africa']);
  });

  it('ignores names that only contain a place', () => {
    expect(extractRegions('Countries restate Paris Agreement goals', null)).toEqual(['Global']);
  });
});
