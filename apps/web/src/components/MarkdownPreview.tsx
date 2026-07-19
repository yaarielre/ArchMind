import Markdown from "react-markdown";

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <Markdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-6 mb-3 pb-2 border-b border-white/20">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-white mt-6 mb-3 px-3 py-2 bg-white/10 border-l-4 border-blue-400 rounded-r-lg">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-white mt-4 mb-2 pb-1 border-b border-white/10">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-white/80 mt-3 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-sm text-white/70 leading-relaxed mb-3">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          hr: () => <hr className="my-4 border-white/10" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-900 text-white">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-white/10 text-white/70">
              {children}
            </td>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="even:bg-white/5">{children}</tr>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-2 ml-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-2 ml-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-white/70 pl-2 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-blue-400 before:rounded-full">
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-white/10 text-pink-300 text-xs rounded font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 bg-blue-500/10 px-4 py-3 my-3 rounded-r-lg text-sm text-white/70 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
