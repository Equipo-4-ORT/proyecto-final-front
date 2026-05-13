function Modal({
  isOpen,
  title,
  children,
  actions,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        backdrop-blur-sm
        p-4
      "
    >
      <div
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
          <h2 className="text-xl font-bold text-slate-800">
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