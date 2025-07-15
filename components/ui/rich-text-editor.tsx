"use client";

import { useState } from "react";
import { Eye, Edit, Bold, Italic, Code, List, Link, Heading } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    
    onChange(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const formatMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>')
      .replace(/\n/g, '<br>');
  };

  const toolbarButtons = [
    { icon: Heading, action: () => insertMarkdown("# "), title: "Heading" },
    { icon: Bold, action: () => insertMarkdown("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertMarkdown("*", "*"), title: "Italic" },
    { icon: Code, action: () => insertMarkdown("`", "`"), title: "Code" },
    { icon: List, action: () => insertMarkdown("- "), title: "List" },
    { icon: Link, action: () => insertMarkdown("[", "](url)"), title: "Link" },
  ];

  return (
    <div className={cn("border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex items-center gap-1">
        <div className="flex items-center gap-1 mr-4">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={button.title}
              type="button"
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setIsPreview(false)}
            className={cn(
              "px-3 py-1 text-sm rounded transition-colors flex items-center gap-1",
              !isPreview
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
            type="button"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={cn(
              "px-3 py-1 text-sm rounded transition-colors flex items-center gap-1",
              isPreview
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
            type="button"
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="min-h-96">
        {isPreview ? (
          <div className="p-4 prose dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(value || "Nothing to preview yet...")
              }}
            />
          </div>
        ) : (
          <textarea
            data-markdown-editor
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-96 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none border-0"
          />
        )}
      </div>
    </div>
  );
}