import { Component } from "react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">
              Algo salió mal
            </h1>

            <p className="mt-3 text-slate-500">
              Ocurrió un error inesperado. Probá recargar la página.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="
                mt-5
                rounded-xl
                bg-[var(--color-primary)]
                px-5 py-2.5
                font-medium
                text-white
                hover:bg-[var(--color-primary-hover)]
                transition
              "
            >
              Recargar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary