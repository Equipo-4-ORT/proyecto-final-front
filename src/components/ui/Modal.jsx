import { useEffect, useId } from "react"

function Modal({
  isOpen,
  title,
  children,
  actions,
  onClose,
}) {
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  function handleBackdropClick() {
    onClose?.()
  }

  function stopPropagation(event) {
    event.stopPropagation()
  }

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        backdrop-blur-sm
        p-4
      "
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={stopPropagation}
        className="
          w-full max-w-md
          rounded-2xl
          bg-white
          shadow-2xl
          border border-slate-200
          overflow-hidden
        "
      >
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 id={titleId} className="text-xl font-bold text-slate-800">
            {title}
          </h2>
        </div>

        <div className="px-6 py-5">
          {children}
        </div>

        <div
          className="
            px-6 py-4
            border-t border-slate-200
            flex justify-end gap-3
            bg-slate-50
          "
        >
          {actions}
        </div>
      </div>
    </div>
  )
}

export default Modal
