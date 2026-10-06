'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export default function MathText({ content, className = '', inline = false }: MathTextProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Pattern to identify math expressions:
    // $$...$$ for display math
    // $...$ for inline math
    const parts: React.ReactNode[] = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = regex.exec(content)) !== null) {
      // Add plain text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyIdx++}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      const rawFormula = match[0];
      const isDisplay = rawFormula.startsWith('$$') && rawFormula.endsWith('$$');
      const formula = isDisplay
        ? rawFormula.slice(2, -2).trim()
        : rawFormula.slice(1, -1).trim();

      try {
        const html = katex.renderToString(formula, {
          displayMode: isDisplay,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
        parts.push(
          <span
            key={`math-${keyIdx++}`}
            className={isDisplay ? 'my-2 block overflow-x-auto text-amber-300' : 'inline-block mx-0.5 text-amber-300 font-serif'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        parts.push(
          <span key={`err-${keyIdx++}`} className="font-mono text-red-400 text-xs">
            {rawFormula}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-end-${keyIdx++}`}>
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  }, [content]);

  const Tag = inline ? 'span' : 'div';

  return <Tag className={`leading-relaxed ${className}`}>{renderedContent}</Tag>;
}
