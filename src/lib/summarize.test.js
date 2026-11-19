import { describe, it, expect } from 'vitest';
import { splitSentences, tokenize, analyze, summarize } from './summarize';

const ARTICLE = [
  'Bengaluru metro ridership crossed two million daily trips this year.',
  'The new lines connect technology parks in the east to residential areas in the west.',
  'Commuters say the metro has cut travel times across the city.',
  'The metro authority plans further expansions over the next decade.',
  'Traffic congestion remains a challenge despite the metro growth.',
  'Officials believe the metro expansions will reduce congestion on major corridors.'
].join(' ');

describe('splitSentences', () => {
  it('splits on terminal punctuation and keeps order', () => {
    const s = splitSentences('One two three. Four five six! Seven eight nine?');
    expect(s).toEqual(['One two three.', 'Four five six!', 'Seven eight nine?']);
  });

  it('keeps a trailing sentence without punctuation', () => {
    const s = splitSentences('First sentence here. trailing words without a stop');
    expect(s.length).toBe(2);
    expect(s[1]).toMatch(/trailing/);
  });

  it('returns empty for blank input', () => {
    expect(splitSentences('   ')).toEqual([]);
    expect(splitSentences(null)).toEqual([]);
  });
});

describe('tokenize', () => {
  it('lowercases, strips punctuation and drops stop words', () => {
    expect(tokenize('The Metro, and the City!')).toEqual(['metro', 'city']);
  });

  it('drops single letters', () => {
    expect(tokenize('a b cc dd')).toEqual(['cc', 'dd']);
  });
});

describe('analyze', () => {
  it('ranks the most frequent content word as the top keyword', () => {
    const { keywords, wordCount } = analyze(ARTICLE);
    expect(keywords[0].word).toBe('metro');
    expect(wordCount).toBeGreaterThan(40);
  });
});

describe('summarize', () => {
  it('keeps roughly the requested share of sentences', () => {
    const r = summarize(ARTICLE, 50);
    expect(r.stats.summarySentences).toBe(3);
    expect(r.sentences.filter((s) => s.selected).length).toBe(3);
  });

  it('returns selected sentences in original order', () => {
    const r = summarize(ARTICLE, 50);
    const idx = r.sentences.filter((s) => s.selected).map((s) => s.index);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(r.summary).toContain('metro');
  });

  it('always keeps at least one sentence', () => {
    const r = summarize('Only one sentence exists here today.', 10);
    expect(r.stats.summarySentences).toBe(1);
    expect(r.summary.length).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    const r = summarize('', 30);
    expect(r.summary).toBe('');
    expect(r.stats.sentences).toBe(0);
    expect(r.stats.reduction).toBe(0);
  });

  it('reports a positive reduction for a real article', () => {
    const r = summarize(ARTICLE, 30);
    expect(r.stats.reduction).toBeGreaterThan(30);
    expect(r.stats.readingTimeSec).toBeGreaterThan(0);
  });
});
