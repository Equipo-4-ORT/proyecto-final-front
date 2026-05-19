function EmptyState({ onGenerate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
      <h2 className="mb-2 text-2xl font-semibold">
        No hay actividades para hoy
      </h2>

      <p className="mb-6 text-gray-500">
        Generá un informe automático para comenzar.
      </p>

      <button
        onClick={onGenerate}
        className="rounded-lg bg-black px-6 py-3 text-white transition hover:opacity-90"
      >
        Generar informe ahora
      </button>
    </div>
  )
}

export default EmptyState