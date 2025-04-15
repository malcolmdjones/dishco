
import React from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
}

/**
 * Component that highlights parts of text that match a search query
 */
const HighlightedText = ({ text, query }: HighlightedTextProps) => {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Split by the query (case insensitive)
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'i'));
  
  return (
    <span>
      {parts.map((part, index) => {
        // Check if this part matches the query (case insensitive)
        return part.toLowerCase() === query.toLowerCase() ? (
          <strong key={index} className="font-bold">{part}</strong>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default HighlightedText;
