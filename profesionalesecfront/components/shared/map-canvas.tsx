"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

interface LocationMapProps {
    lat?: number
    lng?: number
    readonly?: boolean
    address?: string
    onChange?: (lat: number, lng: number) => void
}

const DEFAULT_CENTER = { lat: -1.831239, lng: -78.183406 }
const DEFAULT_ZOOM = 7
const DETAIL_ZOOM = 17

export default function MapCanvas({ lat, lng, readonly = false, address, onChange }: LocationMapProps) {
    const mapElementRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)
    const popupRef = useRef<L.Popup | null>(null)
    const [mounted, setMounted] = useState(false)
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (typeof lat === "number" && typeof lng === "number") {
            setPosition({ lat, lng })
        }
    }, [lat, lng])

    useEffect(() => {
        if (!mounted || !mapElementRef.current || mapRef.current) return

        const initialCenter = position || DEFAULT_CENTER
        const map = L.map(mapElementRef.current, {
            center: [initialCenter.lat, initialCenter.lng],
            zoom: position ? 15 : DEFAULT_ZOOM,
            scrollWheelZoom: !readonly,
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        if (!readonly) {
            map.on("click", (event: L.LeafletMouseEvent) => {
                const nextPosition = { lat: event.latlng.lat, lng: event.latlng.lng }
                setPosition(nextPosition)
                onChange?.(nextPosition.lat, nextPosition.lng)
            })
        }

        mapRef.current = map

        return () => {
            popupRef.current = null
            markerRef.current = null
            mapRef.current?.remove()
            mapRef.current = null
        }
    }, [mounted, readonly, onChange, position])

    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        if (!position) {
            if (markerRef.current) {
                markerRef.current.remove()
                markerRef.current = null
            }
            return
        }

        if (!markerRef.current) {
            markerRef.current = L.marker([position.lat, position.lng], {
                draggable: !readonly,
            }).addTo(map)

            markerRef.current.on("dragend", () => {
                if (readonly || !markerRef.current) return
                const next = markerRef.current.getLatLng()
                const nextPosition = { lat: next.lat, lng: next.lng }
                setPosition(nextPosition)
                onChange?.(nextPosition.lat, nextPosition.lng)
            })
        } else {
            markerRef.current.setLatLng([position.lat, position.lng])
            markerRef.current.dragging?.[readonly ? "disable" : "enable"]()
        }

        if (address) {
            if (!popupRef.current) {
                popupRef.current = L.popup()
            }
            markerRef.current.bindPopup(popupRef.current.setContent(address))
        }

        map.flyTo([position.lat, position.lng], DETAIL_ZOOM, { duration: 1.5 })
    }, [position, readonly, address, onChange])

    if (!mounted) return <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-lg" />

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
            <div ref={mapElementRef} className="h-full w-full" />

            {!readonly && !position && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-600 pointer-events-none z-[1000]">
                    Haz clic o arrastra para ubicarte
                </div>
            )}
        </div>
    )
}
