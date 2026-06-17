"use client"

import { useState, useEffect, useCallback } from "react"
import { ponenciasApi, Ponencia } from "@/lib/api"

export type UsePonenciasOptions = {
  routePrefix?: string
  errorLabel?: string
}

export function usePonencias(options: UsePonenciasOptions = {}) {
  const { routePrefix = "/conversatorios", errorLabel = "eventos" } = options
  const [ponencias, setPonencias] = useState<Ponencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPonencias = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ponenciasApi.listar(undefined, routePrefix)
      setPonencias(Array.isArray(data.ponencias) ? data.ponencias : Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || `Error al cargar ${errorLabel}`)
      console.error("🔥 Error usePonencias:", err)
    } finally {
      setLoading(false)
    }
  }, [errorLabel, routePrefix])

  useEffect(() => {
    fetchPonencias()
  }, [fetchPonencias])

  return { ponencias, loading, error, refresh: fetchPonencias }
}
