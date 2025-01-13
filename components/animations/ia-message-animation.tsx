import { TypingTextAnimation } from "./typing-text"

interface IAMessageAnimationProps {
  message: string
  from?: string
  disabled?: boolean
}

export function IAMessageAnimation({ from, message }: IAMessageAnimationProps) {
  return (
    <div className="flex flex-col gap-2 border bg-muted/25 shadow p-4 rounded-lg max-w-[95%]">
      {from ? (
        <header className="flex items-center gap-2 text-sm">
          <span>
            <strong className="font-semibold">{from}</strong>
          </span>
        </header>
      ) : null}
      <TypingTextAnimation
        text={message}
        speed={10}
        className="text-secondary-foreground/75 text-sm leading-relaxed"
      />
    </div>
  )
}
