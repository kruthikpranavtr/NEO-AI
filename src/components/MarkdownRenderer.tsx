import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal } from 'lucide-react';
import Prism from 'prismjs';
// Common prism languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock: React.FC<{
  language: string;
  codeString: string;
}> = ({ language, codeString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlight with Prism
  let highlightedHtml = '';
  try {
    const validLang = Prism.languages[language] ? language : 'javascript';
    highlightedHtml = Prism.highlight(
      codeString,
      Prism.languages[validLang] || Prism.languages.javascript,
      validLang
    );
  } catch (err) {
    highlightedHtml = '';
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-cyan-500/20 bg-[#040817] shadow-lg shadow-black/40">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#081226] border-b border-cyan-500/15 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400">
          <Terminal size={13} className="text-cyan-400" />
          <span className="uppercase text-[11px] font-semibold tracking-wider text-cyan-300">
            {language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded transition-colors text-[11px] hover:bg-cyan-950/40"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-mono">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="font-mono">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-slate-200 bg-[#030612]/90">
        {highlightedHtml ? (
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <code>{codeString}</code>
        )}
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body space-y-2 text-slate-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold font-orbitron tracking-wide text-cyan-300 border-b border-cyan-500/20 pb-1.5 my-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold font-orbitron tracking-wide text-cyan-400 my-2.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold font-space text-slate-100 my-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed my-1.5 text-slate-200 text-sm sm:text-base">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 pl-2 text-slate-300 text-sm sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 pl-2 text-slate-300 text-sm sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed marker:text-cyan-400 pl-1">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-cyan-400/70 pl-3.5 py-1 my-2.5 italic text-slate-400 bg-cyan-950/20 rounded-r-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-cyan-500/20">
              <table className="min-w-full divide-y divide-cyan-500/20 text-xs sm:text-sm font-space">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#09152e] text-cyan-300 font-mono">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800/80 bg-[#040816]">{children}</tbody>
          ),
          tr: ({ children }) => <tr className="hover:bg-cyan-950/20 transition-colors">{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2 text-slate-300 whitespace-normal">{children}</td>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-3 border-t border-cyan-500/20" />,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="bg-[#091326] px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs border border-cyan-500/25"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : ''}
                codeString={codeString}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
