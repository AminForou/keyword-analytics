import React, { ReactNode } from 'react';

interface HighlightedTextProps {
  text: string | ReactNode;
  brandMentions: string[];
  competitorMentions: string[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, brandMentions, competitorMentions }) => {
  console.log('HighlightedText props:', { text, brandMentions, competitorMentions });

  if (typeof text !== 'string') {
    return <>{text}</>;
  }

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const highlightText = (inputText: string, phrases: string[], className: string): ReactNode[] => {
    if (phrases.length === 0) return [inputText];

    const regex = new RegExp(`(${phrases.map(escapeRegExp).join('|')})`, 'gi');
    const parts = inputText.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        console.log(`Highlighting: ${part} with class: ${className}`);
        return <span key={index} className={className}>{part}</span>;
      }
      return part;
    });
  }
  const highlightedBrands = highlightText(text, brandMentions, 'bg-green-200');
  const fullyHighlighted = highlightedBrands.map((part) => {
    if (typeof part === 'string') {
      return highlightText(part, competitorMentions, 'bg-yellow-200');
    }
    return part;
  });

  return <>{fullyHighlighted}</>;
}

export default HighlightedText;