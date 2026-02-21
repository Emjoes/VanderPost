import ReactMarkdown, { type Components } from 'react-markdown';

interface MarkdownArticleProps {
  content: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50 mt-1 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mt-6 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50 mt-5 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-6 text-zinc-800 dark:text-zinc-200 mb-3">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-950 dark:text-zinc-50">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-zinc-900 dark:text-zinc-100">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-3 space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-3 space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-6">{children}</li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 py-1 my-3 text-zinc-700 dark:text-zinc-300">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[0.875em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-x-auto text-sm">
      {children}
    </pre>
  ),
  hr: () => (
    <hr className="my-5 border-zinc-200 dark:border-zinc-800" />
  ),
};

export function MarkdownArticle({ content }: MarkdownArticleProps) {
  return (
    <article className="mx-auto text-zinc-800 dark:text-zinc-200">
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
