import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

function Callback() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Se obtiene el token desde la query (?token=...)
    const params = new URLSearchParams(location.search)
    const token = params.get("token")

    if (token) {
      // Se guarda el JWT en localStorage
      localStorage.setItem("token", token)

      // Limpia la URL para evitar que el token quede visible
      window.history.replaceState({}, document.title, "/callback")

      // Redirección a la app principal
      navigate("/dashboard")
    } else {
      // Si no hay token, se vuelve al login
      navigate("/login")
    }
  }, [location, navigate])

  return <h1>Procesando login...</h1>
}

export default Callback