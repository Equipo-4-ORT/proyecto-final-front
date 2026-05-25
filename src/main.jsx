import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import App from "./App.jsx"

import { AuthProvider } from "./contexts/AuthContext"

import ErrorBoundary from "./components/common/ErrorBoundary.jsx"

import "./styles/global.css"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)