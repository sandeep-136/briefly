// Extractive summarization, fully client-side.
// Method: split into sentences, score each sentence by the normalized
// frequency of its content words (stop words removed), keep the top-scoring
// sentences, and return them in original order.

const STOP_WORDS = new Set(
  'a an the and or but if then else when at by for with about against between into through during before after above below to from up down in out on off over under again further once here there all any both each few more most other some such no nor not only own same so than too very can will just should now i me my we our you your he him his she her it its they them their this that these those am is are was were be been being have has had having do does did doing would could ought as of also who whom which what whose why how'
    .split(' ')
);

export function splitSentences(text) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const matches = cleaned.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [];
  return matches
    .map((s) => s.trim())
    .filter((s) => s.split(' ').filter(Boolean).length >= 3);
}

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export function analyze(text) {
  const sentences = splitSentences(text);
  const words = tokenize(text);
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

  const scored = sentences.map((sentence, index) => {
    const contentWords = tokenize(sentence);
    const score = contentWords.length
      ? contentWords.reduce((sum, w) => sum + (freq.get(w) || 0), 0) / contentWords.length
      : 0;
    return { text: sentence, index, score };
  });

  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  const allWords = String(text || '').trim();
  return {
    sentences: scored,
    keywords,
    wordCount: allWords ? allWords.split(/\s+/).length : 0
  };
}

export function summarize(text, keepPercent = 30) {
  const { sentences, keywords, wordCount } = analyze(text);
  const total = sentences.length;
  const keep = Math.max(1, Math.min(total, Math.round((total * keepPercent) / 100)));

  const chosen = new Set(
    [...sentences]
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, keep)
      .map((s) => s.index)
  );

  const ranked = sentences.map((s) => ({ ...s, selected: chosen.has(s.index) }));
  const summary = ranked.filter((s) => s.selected).map((s) => s.text).join(' ');
  const summaryWords = summary ? summary.split(/\s+/).length : 0;

  return {
    sentences: ranked,
    summary,
    keywords,
    stats: {
      sentences: total,
      words: wordCount,
      summarySentences: chosen.size,
      summaryWords,
      reduction: wordCount ? Math.round((1 - summaryWords / wordCount) * 100) : 0,
      readingTimeSec: Math.round((summaryWords / 200) * 60)
    }
  };
}
