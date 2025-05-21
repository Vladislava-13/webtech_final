import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

function parseMathString(input) {
  const parts = [];
  const regex = /\$(.+?)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: input.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'math', content: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push({ type: 'text', content: input.slice(lastIndex) });
  }

  return parts;
}

export default function MathRenderer({ text, isInline = false }) {
  const elements = parseMathString(text).map((part, idx) => {
    if (part.type === 'text') {
      return <span key={idx} className="text-sm sm:text-base">{part.content}</span>;
    } else {
      return <InlineMath key={idx} math={part.content} />;
    }
  });
  if (isInline) return <span>{elements}</span>;
  return <p>{elements}</p>;
}
