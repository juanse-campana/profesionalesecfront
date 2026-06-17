"use client"

import { Suspense } from "react"
import ProfessionalForm from "@/components/professional-form"

export default function CreateAdditionalProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando formulario...</div>}>
          <ProfessionalForm isAdditionalProfile={true} />
        </Suspense>
      </main>
    </div>
  )
}
