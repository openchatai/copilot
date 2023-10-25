import React, { useState } from "react";

export function TextDisplay({
  text,
  wordCount,
}: {
  text: string;
  wordCount: number;
}) {
  const [showFullText, setShowFullText] = useState(false);

  // Split the text into words
  const words = text.split(" ");

  // Get the truncated text based on the word count
  const truncatedText = words.slice(0, wordCount).join(" ");
  const toggleFullText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <>
      {showFullText ? (
        text
      ) : (
        <>
          {truncatedText}
          {text.length > wordCount && (
            <button
              onClick={toggleFullText}
              className="ms-2 cursor-pointer text-xs font-medium text-primary"
            >
              show more
            </button>
          )}
        </>
      )}
      {showFullText && text.length > wordCount && (
        <button
          onClick={toggleFullText}
          className="ms-2 cursor-pointer text-xs font-medium text-primary"
        >
          show less
        </button>
      )}
    </>
  );
}
