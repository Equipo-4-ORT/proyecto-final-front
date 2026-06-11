function TextInput({
  type = "text",
  label,
  id,
  placeholder = "",
  className = "",
  ...props
}) {
  const inputId = id || props.name

  const input = (
    <input
      id={inputId}
      type={type}
      placeholder={placeholder}
      className={`
        w-full
        border border-slate-200 focus:border-slate-300
        bg-white
        rounded-xl
        px-4 py-2.5
        text-slate-700
        placeholder:text-slate-400
        outline-none
        transition
        focus:ring-4
        focus:ring-blue-100
        ${className}
      `}
      {...props}
    />
  )

  if (!label) return input

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {input}
    </div>
  )
}

export default TextInput
