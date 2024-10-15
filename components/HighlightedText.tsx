import React, { ReactNode } from 'react';

interface HighlightedTextProps {
  text: string | ReactNode;
  brandMentions: string[];
  competitorMentions: string[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, brandMentions, competitorMentions }) => {
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
        return <span key={index} className={className}>{part}</span>;
      }
      return part;
    });
  }

  const lines = text.split('\n');
  const highlightedLines = lines.map((line, lineIndex) => {
    const highlightedBrands = highlightText(line, brandMentions, 'bg-green-200');
    const fullyHighlighted = highlightedBrands.map((part) => {
      if (typeof part === 'string') {
        return highlightText(part, competitorMentions, 'bg-yellow-200');
      }
      return part;
    });

    return (
      <React.Fragment key={lineIndex}>
        {fullyHighlighted}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });

  return <>{highlightedLines}</>;
}

export default HighlightedText;
