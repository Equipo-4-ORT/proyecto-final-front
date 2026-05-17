function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    primaryDark: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  }

  return (
    <button
      type={type}
      className={`
        px-4 py-2.5 rounded-xl font-medium transition
        whitespace-nowrap
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button