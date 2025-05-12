// components/message-bubble.tsx
"use client";

import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// Optional: For code highlighting
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant" | "system" | "data";
  isLatest: boolean;
}

export default function MessageBubble({ content, role }: MessageBubbleProps) {
  const isUser = role === "user";

  // Custom renderers for markdown elements
  const renderers = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={dracula}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start max-w-[80%]`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div
          className={`mx-2 p-3 rounded-lg ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <p className="my-1" {...props} />,
              code: renderers.code,
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc ml-5 my-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal ml-5 my-1" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
              em: ({ node, ...props }) => <em className="italic" {...props} />,
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-500 underline hover:text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}