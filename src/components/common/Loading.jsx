function Loading({ message = "Cargando..." }) {
  return (
    <div className="min-h-[240px] flex flex-col items-center justify-center gap-4 text-slate-500">
      <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-[var(--color-primary)] animate-spin" />

      <p className="text-sm font-medium">
        {message}
      </p>
    </div>
  )
}

export default Loading