"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText,
  variant = "default"
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel()
        } else if (e.key === 'Enter') {
          onConfirm()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ 
      position: 'fixed', 
      top: '-50px', 
      left: '-50px', 
      right: '-50px', 
      bottom: '-50px', 
      width: 'calc(100vw + 100px)', 
      height: 'calc(100vh + 100px)',
      minHeight: '100vh',
      zIndex: 9999
    }}>
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        style={{ 
          position: 'absolute',
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100%', 
          height: '100%',
          minHeight: '100vh'
        }}
      />
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all border border-deep-forest/20">
        <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              variant === "destructive" ? "bg-red-500/20" : "bg-bronze/20"
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                variant === "destructive" ? "text-red-500" : "text-bronze"
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-deep-forest">{title}</h3>
            </div>
        </div>
          <p className="text-deep-forest/80 mb-6 leading-relaxed whitespace-pre-line">{message}</p>
          <div className="flex gap-3 justify-end">
            {cancelText && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="min-w-[80px] border-deep-forest/30 text-deep-forest bg-white hover:bg-deep-forest hover:text-alabaster"
              >
                {cancelText}
              </Button>
            )}
            <Button 
              onClick={onConfirm}
              className={`min-w-[80px] ${
                variant === "destructive" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-bronze hover:bg-bronze/90 text-white"
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
