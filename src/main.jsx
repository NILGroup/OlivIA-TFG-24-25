/**
 * main.jsx
 *
 * Este archivo es el punto de arranque de la app.
 * Monta toda la aplicación React dentro del HTML (div#root),
 * aplica configuraciones globales como temas (Provider),
 * y activa el modo estricto para detectar errores durante el desarrollo.
 */


import React from "react";
import { Provider } from "@/components/ui/provider"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
)
