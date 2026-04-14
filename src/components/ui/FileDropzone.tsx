import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  onClear: () => void
  selectedFile: File | null
  accept?: string
}

export function FileDropzone({
  onFileSelect,
  onClear,
  selectedFile,
  accept = '.pdf,.png,.jpg,.jpeg',
}: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <FileText size={20} className="text-primary-600 shrink-0" />
        <span className="text-sm text-primary-800 font-medium truncate flex-1">{selectedFile.name}</span>
        <button
          onClick={onClear}
          className="p-1 rounded-md hover:bg-primary-100 text-primary-500"
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer
        transition-all text-sm
        ${dragging
          ? 'border-primary-400 bg-primary-50 text-primary-700'
          : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-slate-500'
        }
      `}
    >
      <Upload size={24} className={dragging ? 'text-primary-500' : 'text-slate-400'} />
      <span className="font-medium">Clique ou arraste um arquivo</span>
      <span className="text-xs text-slate-400">PDF, PNG, JPG (opcional)</span>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  )
}
