import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  text: string;
}

const MessageContent: React.FC<{ message: Message }> = ({ message }) => {
  if (!message.text) return null;
  
  // Split the text by lines
  const lines = message.text.split('\n');
  const processedLines = [];
  
  let inThoughtsBlock = false;
  let thoughtsContent = [];
  
  lines.forEach((line, index) => {
    // Check if this line starts a thoughts block (starts with "<think>")
    if (line.trim().startsWith('<think>') && !inThoughtsBlock) {
      inThoughtsBlock = true;
    } else if (inThoughtsBlock) {
      if (line.trim().endsWith('</think>')) {
        // End the thoughts block and create collapsible element
        processedLines.push(
          <div key={`thoughts-${index}`} className="collapsible-thoughts">
            <details>
              <summary>Thoughts</summary>
              <div className="thoughts-content">
                {thoughtsContent.join('\n')}
              </div>
            </details>
          </div>
        );
        inThoughtsBlock = false;
        thoughtsContent = [];
      } else {
        thoughtsContent.push(line);
      }
    } else {
      // Add the regular line - apply markdown formatting here
      processedLines.push(
        <div key={`line-${index}`}>
          <ReactMarkdown>{line}</ReactMarkdown>
        </div>
      );
    }
  });
  
  // Handle any remaining thoughts content at the end
  if (inThoughtsBlock && thoughtsContent.length > 0) {
    processedLines.push(
      <div key="final-thoughts" className="collapsible-thoughts">
        <details>
          <summary>Thoughts</summary>
          <div className="thoughts-content">
            {thoughtsContent.join('\n')}
          </div>
        </details>
      </div>
    );
  }
  
  return <div className="message-text-content">{processedLines}</div>;
};

export default MessageContent;
