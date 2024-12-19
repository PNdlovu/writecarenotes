import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"

interface FileUploadProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected: (files: File[]) => void
  className?: string
}

export function FileUpload({
  className,
  onFilesSelected,
  accept,
  multiple = false,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    onFilesSelected(files)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
        {...props}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
      >
        Choose Files
      </Button>
    </div>
  )
}
