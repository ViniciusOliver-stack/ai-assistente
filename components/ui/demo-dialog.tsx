import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface DialogProps {
  children: React.ReactNode
}

export function DemoDialog({ children }: DialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[36rem] w-[64rem] max-w-[90vw] aspect-video p-0 overflow-hidden rounded-lg outline-none">
        <iframe
          src="https://www.youtube-nocookie.com/embed/RkC0l4iekYo?autoplay=1&si=9e0ZgG47ACY2cjcv&amp;controls=0"
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </DialogContent>
    </Dialog>
  )
}
