import { useMemo, useState } from 'react';
import { summarize } from './lib/summarize';

const SAMPLE = `Extractive summarization is one of the oldest ideas in natural language processing. Instead of writing new sentences, an extractive system selects the most important sentences from the original text and presents them as the summary. The approach has stayed popular because it is fast, predictable, and never invents facts that were not in the source. The method used on this page scores every sentence by the words it contains. Common words like "the" and "is" carry little meaning, so they are removed first. Each remaining word is counted across the whole document, and a sentence earns a score from the average frequency of its content words. Sentences packed with distinctive, repeated vocabulary tend to sit near the center of what a document is about. Frequency scoring is a simplification, of course. Research systems extend the idea with graph algorithms such as TextRank, which let sentences vote for each other the way web pages pass rank through links. Neural models go further still and learn sentence representations from large collections of text. Yet the humble word-count baseline remains surprisingly competitive, and it runs instantly on any device. Because everything here happens in the browser, the text never leaves the page. There is no server, no account, and no log of what you paste. That makes the tool handy for quickly skimming long articles, meeting notes, or documentation before deciding what deserves a careful read.`;

export default function App() {
  const [text, setText] = useState('');
  const [keep, setKeep] = useState(30);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const inputWords = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text]
  );

  const run = () => {
    if (!text.trim()) return;
    setResult(summarize(text, keep));
    setCopied(false);
  };

  const copySummary = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="page">
      <header className="hero">
        <h1>Briefly</h1>
        <p>
          Extractive summaries of articles and notes, generated entirely in your
          browser. No uploads, no accounts, nothing leaves the page.
        </p>
      </header>

      <main>
        <section className="card">
          <div className="card-head">
            <h2>Your text</h2>
            <span className="muted">{inputWords} words</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste an article, notes, or documentation here..."
          />
          <div className="controls">
            <label className="slider-label">
              Keep about <strong>{keep}%</strong> of sentences
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={keep}
                onChange={(e) => setKeep(Number(e.target.value))}
              />
            </label>
            <div className="btn-row">
              <button className="ghost" onClick={() => { setText(SAMPLE); setResult(null); }}>
                Load sample
              </button>
              <button className="ghost" onClick={() => { setText(''); setResult(null); }}>
                Clear
              </button>
              <button className="primary" onClick={run} disabled={!text.trim()}>
                Summarize
              </button>
            </div>
          </div>
        </section>

        {result && (
          <>
            <section className="card">
              <div className="card-head">
                <h2>Summary</h2>
                <button className="ghost small" onClick={copySummary}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="summary-text">{result.summary}</p>
              <div className="stats">
                <span>{result.stats.sentences} sentences in</span>
                <span>{result.stats.summarySentences} kept</span>
                <span>{result.stats.reduction}% shorter</span>
                <span>~{Math.max(1, result.stats.readingTimeSec)}s read</span>
              </div>
              {result.keywords.length > 0 && (
                <div className="keywords">
                  {result.keywords.map((k) => (
                    <span className="chip" key={k.word}>
                      {k.word}
                      <em>{k.count}</em>
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <h2>Why these sentences?</h2>
              <p className="muted small-text">
                Each sentence is scored by the average frequency of its content
                words across the whole text. Highlighted sentences made the cut.
              </p>
              <ol className="sentence-list">
                {result.sentences.map((s) => (
                  <li key={s.index} className={s.selected ? 'picked' : ''}>
                    <span className="score">{s.score.toFixed(2)}</span>
                    {s.text}
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </main>

      <footer>
        <p>A project by Sandeep Sagar</p>
      </footer>
    </div>
  );
}
