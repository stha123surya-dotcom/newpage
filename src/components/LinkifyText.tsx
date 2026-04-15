import React from 'react';

export function LinkifyText({ text }: { text: string }) {
  if (!text) return null;
  
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-accent hover:underline break-all"
              onClick={(e) => e.stopPropagation()} // Prevent triggering parent clicks
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
