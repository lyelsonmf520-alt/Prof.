import { MarkdownRenderer } from './MarkdownRenderer'

interface StreamingTextProps {
  content: string
  className?: string
}

export function StreamingText({ content, className = '' }: StreamingTextProps) {
  return (
    <div className={`relative ${className}`}>
      <MarkdownRenderer content={content} />
      {/* Blinking cursor indicator */}
      <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse align-middle" />
    </div>
  )
}
