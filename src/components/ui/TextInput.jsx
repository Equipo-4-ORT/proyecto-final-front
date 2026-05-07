function TextInput({
  type = "text",
  placeholder = "",
  className = "",
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`
        w-full
        border border-slate-200
        bg-white
        rounded-xl
        px-4 py-2.5
        text-slate-700
        placeholder:text-slate-400
        outline-none
        transition
        focus:border-blue-500
        focus:ring-4
        focus:ring-blue-100
        ${className}
      `}
      {...props}
    />
  )
}

export default TextInput