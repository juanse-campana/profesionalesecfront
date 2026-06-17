"use client"

import { useState, useEffect, useRef, type ChangeEvent, type FocusEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, ChevronLeft, ChevronRight, Home, Upload, Eye, EyeOff, PartyPopper, Loader2, Facebook, Instagram, Linkedin, Twitter, Music, Youtube, Copy } from "lucide-react"
import { Check, X } from "lucide-react" // Declared the Check variable
import {
  authApi,
  profesionalApi,
  catalogosApi,
  saveToken,
  removeToken,
  usuarioApi,
  horariosApi,
  bankAccountsApi,
  payphoneApi,
  type BankAccount as ApiBankAccount,
  type PayPhonePriorityDocumentDraft,
  type PayPhonePriorityRegistrationDraft,
  type PayPhonePriorityServiceDraft,
} from "@/lib/api"
import ScheduleGrid from "@/components/schedule-grid"


import LocationMap from "@/components/shared/location-map"
import { getAddressFromCoordinates, getCoordinatesFromAddress } from "@/lib/geocoding"
import { useToast } from "@/hooks/use-toast"
import { PROFILE_IMAGE_ACCEPTED_TYPES, PROFILE_IMAGE_MAX_SIZE_BYTES, PROFILE_IMAGE_MAX_SIZE_MB } from "@/constants/profile-upload"

const workModes = ["Presencial", "Virtual", "Ambas modalidades"]
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const hours = Array.from({ length: 24 }, (_, i) => i)

// Cloudinary config for unsigned uploads
const CLOUDINARY_CLOUD_NAME = "dw4p8pdcz"
const CLOUDINARY_UPLOAD_PRESET = "profesionales"
const PAYPHONE_PRIORITY_STORAGE_KEY = "payphone_priority_checkout_context"

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.statusText}`)
  }

  const data = await res.json()
  return data.secure_url
}

async function uploadAssetToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.statusText}`)
  }

  const data = await res.json()
  return data.secure_url
}


interface FormData {
  fullName: string
  cedula: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  profileImage: File | null
  bannerImage: File | null
  profession: string // Stores ID as string
  specialty: string // Stores ID as string
  description: string
  yearsExperience: number
  rate: string
  workMode: string
  province: string // Stores ID as string
  city: string // Stores ID as string
  address: string
  reference: string
  identityFront: File | null
  identityBack: File | null
  title: File | null
  license: File | null
  showPhone: boolean
  showEmail: boolean
  tags: string
  lat?: number
  lng?: number
  services: string[]
  matrix: boolean[]
  facebook_url: string
  instagram_url: string
  tiktok_url: string
  linkedin_url: string
  x_url: string
  yt_url: string
  paymentProof: File | null
}

interface CatalogItem {
  id: number;
  nombre: string;
}


interface FormErrors {
  [key: string]: string
}

interface FormTouched {
  [key: string]: boolean
}

interface ProfessionalFormProps {
  isAdditionalProfile?: boolean
}

interface BankAccountDetail {
  label: string
  value: string
}

interface PriorityBankAccount {
  bankName: string
  details: BankAccountDetail[]
}

const COPYABLE_BANK_DETAIL_LABELS = [
  "Número Cuenta",
  "RUC/Identificación",
  "Correo",
] as const

const isCopyableBankDetail = (label: string) => COPYABLE_BANK_DETAIL_LABELS.some((copyableLabel) => copyableLabel === label)

const mapPriorityBankAccounts = (accounts: ApiBankAccount[]): PriorityBankAccount[] => {
  return accounts.map((account) => ({
    bankName: account.bank_name,
    details: [
      { label: "Tipo de cuenta", value: account.account_type },
      { label: "Número Cuenta", value: account.account_number },
      { label: "RUC/Identificación", value: account.holder_identifier },
      { label: "Titular", value: account.holder_name },
      { label: "Correo", value: account.email || "No registrado" },
    ],
  }))
}

export default function ProfessionalForm({ isAdditionalProfile = false }: ProfessionalFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") // Get plan from URL
  const paymentMethod = searchParams.get("payment")
  const isPriorityPlan = plan === "priority"
  const normalizedPriorityPaymentMethod = paymentMethod === "payphone"
    ? "payphone"
    : paymentMethod === "bank"
      ? "bank"
      : null
  const isPriorityPayPhone = isPriorityPlan && normalizedPriorityPaymentMethod === "payphone"
  const isPriorityBankTransfer = isPriorityPlan && normalizedPriorityPaymentMethod === "bank"
  const shouldChoosePriorityPaymentMethod = isPriorityPlan && normalizedPriorityPaymentMethod === null

  const [currentStep, setCurrentStep] = useState(0)
  const [comprobantePagoUrl, setComprobantePagoUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    cedula: "", // Added cedula field
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    profileImage: null,
    bannerImage: null,
    profession: "",
    specialty: "",
    description: "",
    yearsExperience: 0,
    rate: "",
    workMode: "",
    province: "",
    city: "",
    address: "",
    reference: "",
    identityFront: null,
    identityBack: null,
    title: null,
    license: null,
    showPhone: false,
    showEmail: false,
    tags: "",
    lat: undefined,
    lng: undefined,
    services: [],
    matrix: (() => {
      const m = Array(168).fill(false);
      for (let d = 0; d < 5; d++) {
        for (let h = 8; h < 13; h++) m[d * 24 + h] = true;
        for (let h = 15; h < 18; h++) m[d * 24 + h] = true;
      }
      return m;
    })(),
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    linkedin_url: "",
    x_url: "",
    yt_url: "",
    paymentProof: null,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<FormTouched>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [serviceInput, setServiceInput] = useState("") // New state for service input
  const [isLoading, setIsLoading] = useState(false)
  const [copiedBankDetailKey, setCopiedBankDetailKey] = useState<string | null>(null)
  const [priorityBankAccounts, setPriorityBankAccounts] = useState<PriorityBankAccount[]>([])
  const [isLoadingPriorityBankAccounts, setIsLoadingPriorityBankAccounts] = useState(false)
  const [priorityBankAccountsError, setPriorityBankAccountsError] = useState<string | null>(null)
  const [priorityPaymentMethodError, setPriorityPaymentMethodError] = useState<string | null>(null)
  const isAddressManuallyEdited = useRef(false)
  const copiedBankDetailTimeoutRef = useRef<number | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const cedulaInputRef = useRef<HTMLInputElement>(null)
  // Catalogs State
  const [professions, setProfessions] = useState<CatalogItem[]>([])
  const [specialties, setSpecialties] = useState<CatalogItem[]>([])
  const [provinces, setProvinces] = useState<CatalogItem[]>([])
  const [cities, setCities] = useState<CatalogItem[]>([])
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null)

  const copyTextToClipboard = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return
    }

    const textArea = document.createElement("textarea")
    textArea.value = value
    textArea.setAttribute("readonly", "")
    textArea.style.position = "fixed"
    textArea.style.opacity = "0"
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
  }

  const handleCopyBankDetail = async (key: string, value: string) => {
    try {
      await copyTextToClipboard(value)
      setCopiedBankDetailKey(key)

      if (copiedBankDetailTimeoutRef.current) {
        window.clearTimeout(copiedBankDetailTimeoutRef.current)
      }

      copiedBankDetailTimeoutRef.current = window.setTimeout(() => {
        setCopiedBankDetailKey(null)
      }, 1600)
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Selecciona el texto manualmente e intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const updatePriorityPaymentMethod = (nextPaymentMethod: "bank" | "payphone") => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("payment", nextPaymentMethod)
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false })
    setPriorityPaymentMethodError(null)
    setErrors((prev) => ({ ...prev, paymentProof: "" }))
  }

  // Load initial catalogs and existing user data if needed
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [profRes, provRes] = await Promise.all([
          catalogosApi.obtenerProfesiones(),
          catalogosApi.obtenerProvincias()
        ])
        setProfessions(profRes || [])
        setProvinces(provRes || [])

        if (isAdditionalProfile) {
          const token = localStorage.getItem("auth_token")
          if (token) {
            const userData = await usuarioApi.obtenerMiPerfil(token)
            if (userData) {
              setFormData(prev => ({
                ...prev,
                fullName: userData.nombre || "",
                email: userData.correo || "",
                phone: userData.telefono || "",
                cedula: userData.cedula || "",
                // Set passwords to something dummy to pass validation if needed,
                // but we will skip these fields in the UI
                password: "ExistingUser1!",
                confirmPassword: "ExistingUser1!",
              }))
            }
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    loadInitialData()
  }, [isAdditionalProfile])

  useEffect(() => () => {
    if (copiedBankDetailTimeoutRef.current) {
      window.clearTimeout(copiedBankDetailTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (plan !== "priority") return

    let isMounted = true

    const loadPriorityBankAccounts = async () => {
      setIsLoadingPriorityBankAccounts(true)
      setPriorityBankAccountsError(null)

      try {
        const accounts = await bankAccountsApi.listPublic()
        if (!isMounted) return
        setPriorityBankAccounts(mapPriorityBankAccounts(Array.isArray(accounts) ? accounts : []))
      } catch (error) {
        if (!isMounted) return
        setPriorityBankAccounts([])
        setPriorityBankAccountsError("No pudimos cargar las cuentas bancarias en este momento.")
      } finally {
        if (isMounted) {
          setIsLoadingPriorityBankAccounts(false)
        }
      }
    }

    loadPriorityBankAccounts()

    return () => {
      isMounted = false
    }
  }, [plan])

  // Prompt for location on step 2
  useEffect(() => {
    if (currentStep === 2 && formData.lat === undefined && formData.lng === undefined) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude

            // Set coordinates directly first
            setFormData((prev) => ({ ...prev, lat, lng }))

            try {
              const { address, province, city } = await getAddressFromCoordinates(lat, lng)
              
              let newFormData: Partial<FormData> = {}
              if (address && !isAddressManuallyEdited.current) {
                newFormData.address = address
              }

              // Match province
              if (province && provinces.length > 0) {
                const queryProv = province.toLowerCase();
                const matchedProv = provinces.find(p => p.nombre.toLowerCase().includes(queryProv) || queryProv.includes(p.nombre.toLowerCase()))
                
                if (matchedProv) {
                  newFormData.province = String(matchedProv.id)

                  // Load cities for the matched province
                  try {
                    const res = await catalogosApi.obtenerCiudades(matchedProv.id)
                    const filteredCities = Array.isArray(res) ? res.filter((c: any) => c.provincia_id === matchedProv.id || (c.provincia && c.provincia.id === matchedProv.id)) : []
                    setCities(filteredCities)

                    // Match city
                    if (city && filteredCities.length > 0) {
                      const queryCity = city.toLowerCase();
                      const matchedCity = filteredCities.find((c: any) => c.nombre.toLowerCase().includes(queryCity) || queryCity.includes(c.nombre.toLowerCase()))
                      if (matchedCity) {
                        newFormData.city = String(matchedCity.id)
                      }
                    }
                  } catch (cityErr) {
                    console.error("Error al cargar ciudades en geolocalización:", cityErr)
                  }
                }
              }

              if (Object.keys(newFormData).length > 0) {
                setFormData(prev => ({ ...prev, ...newFormData }))
              }
            } catch (error) {
              console.error("Error obteniendo dirección:", error)
            }
          },
          (error) => {
            console.error("Error de geolocalización:", error)
          }
        )
      }
    }
  }, [currentStep, formData.lat, formData.lng])

  const steps = [

    { title: isAdditionalProfile ? "Imagen de Perfil" : "Datos Personales", description: isAdditionalProfile ? "Sube tu foto" : "Información básica" },
    { title: "Información Profesional", description: "Tu experiencia" },
    { title: "Ubicación", description: "Dónde trabajas" },
    { title: "Documentos", description: "Verifica tu identidad" },
    { title: "Preferencias", description: "Configuración final" },
    ...(isPriorityPlan ? [{
      title: shouldChoosePriorityPaymentMethod ? "Pago" : isPriorityPayPhone ? "Pago" : "Comprobante",
      description: shouldChoosePriorityPaymentMethod
        ? "Elegí cómo querés registrar el pago"
        : isPriorityPayPhone
          ? "Continúa con PayPhone"
          : "Sube tu comprobante de transferencia",
    }] : []),
  ]

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "address") {
      isAddressManuallyEdited.current = value.trim() !== ""
    }

    // Nombres: no permite números
    if (name === "fullName") {
      if (/\d/.test(value)) {
        return // No actualiza si hay números
      }
    }

    // Cédula y teléfono: solo números, máximo 10 dígitos
    if (name === "cedula" || name === "phone") {
      if (!/^\d*$/.test(value)) {
        return // No actualiza si hay caracteres no numéricos
      }
      if (value.length > 10) {
        return // No permite más de 10 dígitos
      }
    }

    if (name === "yearsExperience") {
      const numValue = value === "" ? 0 : Number.parseInt(value, 10)
      setFormData((prev) => ({ ...prev, [name]: numValue }))
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }))
      }
      return
    }

    if (name === "rate") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
        return
      }
      if (!/^\d*\.?\d{0,2}$/.test(value)) {
        return
      }
      setFormData((prev) => ({ ...prev, [name]: value }))
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
      return
    }

    if (e.target.type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else if (e.target.type === "number") {
      setFormData({ ...formData, [name]: Number.parseFloat(value) || 0 })
    } else {
      setFormData({ ...formData, [name]: value })
    }

    if (touched[name]) {
       validateField(name, value)
    }
  }

  const handleSelectChange = async (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
       validateField(name, value)
    }

    if (name === "profession") {
      setFormData((prev) => ({ ...prev, specialty: "" }))
      setSpecialties([]) // Clear previous
      if (value) {
        try {
          // Backend returns ALL specialties, filter client-side
          const res = await catalogosApi.obtenerEspecialidades(Number(value))
          // Assuming response array has 'profesion_id' based on user SQL
          const filtered = Array.isArray(res) ? res.filter((s: any) => s.profesion_id === Number(value)) : []
          setSpecialties(filtered)
        } catch (error) {
          console.error("Error loading specialties:", error)
        }
      }
    }

    if (name === "province") {
      setFormData((prev) => ({ ...prev, city: "" }))
      setCities([])
      if (value) {
        try {
          // Backend returns ALL cities, filter client-side
          const res = await catalogosApi.obtenerCiudades(Number(value))
          // Assuming response array has 'provincia_id' or 'provincia.id'
          // Standard sequelize include usually nests, but plain ID is often available too.
          // Let's safe check both or just provincia_id as it is standard FK
          const filtered = Array.isArray(res) ? res.filter((c: any) => c.provincia_id === Number(value) || (c.provincia && c.provincia.id === Number(value))) : []
          setCities(filtered)
        } catch (error) {
          console.error("Error loading cities:", error)
        }
      }
    }

    if (name === "city" && value) {
      const selectedCity = cities.find((c: any) => c.id === Number(value))
      const selectedProvince = provinces.find((p: any) => p.id === Number(formData.province))

      if (selectedCity && selectedProvince) {
        getCoordinatesFromAddress(`${selectedCity.nombre}, ${selectedProvince.nombre}, Ecuador`)
          .then(coords => {
            if (coords) {
              handleLocationChange(coords.lat, coords.lng)
            }
          })
          .catch(err => console.error("Error auto-centering map:", err))
      }
    }
  }

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      const allowedTypes = name === "paymentProof"
        ? ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"]
        : PROFILE_IMAGE_ACCEPTED_TYPES;
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [name]: name === "paymentProof" ? "Formato no soportado (solo .png, .jpg, .jpeg, .webp, .pdf)" : "Formato no soportado (solo .png, .jpg, .jpeg, .webp)" }));
        setFormData(prev => ({ ...prev, [name]: null }));
        return;
      }
      
      const maxSize = name === "paymentProof" ? 5 * 1024 * 1024 : PROFILE_IMAGE_MAX_SIZE_BYTES;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [name]: `El archivo no debe pesar más de ${name === "paymentProof" ? 5 : PROFILE_IMAGE_MAX_SIZE_MB}MB` }));
        setFormData(prev => ({ ...prev, [name]: null }));
        return;
      }
    }

    setFormData({ ...formData, [name]: file })
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, file)

    // Handle preview for profile and banner image
    if (name === "profileImage" || name === "bannerImage") {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string
          if (name === "profileImage") {
            setProfileImagePreview(result)
          } else {
            setBannerImagePreview(result)
          }
        };
        reader.readAsDataURL(file);
      } else if (name === "profileImage") {
        setProfileImagePreview(null);
      } else {
        setBannerImagePreview(null);
      }
    }

    if (name === "paymentProof") {
      setComprobantePagoUrl(null)
    }
  }

  const handleLocationChange = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }))
    setTouched(prev => ({ ...prev, map: true }))

    if (!isAddressManuallyEdited.current) {
      const { address, reference } = await getAddressFromCoordinates(lat, lng)
      if (address) {
        setFormData(prev => ({
          ...prev,
          address: address,
          reference: reference || prev.reference
        }))
        setTouched(prev => ({ ...prev, address: true }))
        validateField("address", address)
      }
    }
  }

  const validateField = (name: string, value: any) => {
    let error = ""
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Nombre requerido"
        break
      case "cedula":
        if (!value.trim()) error = "Cédula requerida"
        else if (value.length !== 10) error = "Debe tener 10 dígitos"
        break
      case "email":
        if (!value.trim()) {
          error = "Correo electrónico requerido"
        } else if (!value.includes("@")) {
          error = "El correo debe contener un '@'"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Formato inválido (ej: usuario@dominio.com)"
        }
        break
      case "password":
        if (!value) error = "Contraseña requerida"
        else if (value.length < 8) error = "Mínimo 8 caracteres"
        else if (!/[A-Z]/.test(value)) error = "Debe incluir una mayúscula"
        else if (!/[a-z]/.test(value)) error = "Debe incluir una minúscula"
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) error = "Debe incluir un carácter especial (ej: @, $, !)"
        break
      case "confirmPassword":
        if (value !== formData.password) error = "Las contraseñas no coinciden"
        break
      case "phone":
        if (!value.trim()) error = "Teléfono requerido"
        else if (value.length !== 10) error = "Debe tener 10 dígitos"
        break
      case "profileImage":
        if (!value) error = "Foto de perfil requerida"
        break
      case "profession":
        if (!value) error = "Profesión requerida"
        break
      case "specialty":
        if (!value) error = "Especialidad requerida"
        break
      case "description":
        if (!value.trim()) error = "Descripción requerida"
        else if (value.length > 80) error = "Descripción no puede exceder 80 caracteres"
        break
      case "yearsExperience":
        if (value < 0 || value > 70 || !Number.isInteger(Number(value))) error = "Años válidos requeridos (0-70 como número entero)"
        break
      case "workMode":
        if (!value) error = "Modalidad de trabajo requerida"
        break
      case "province":
        if (!value) error = "Provincia requerida"
        break
      case "city":
        if (!value) error = "Ciudad requerida"
        break
      case "address":
        if (!value.trim()) error = "Dirección requerida"
        break
      case "map":
        if (formData.lat === undefined || formData.lng === undefined) error = "Por favor, haz clic o mueve el pin en el mapa"
        break
      case "identityFront":
        if (!value) error = "La foto frontal de la cédula es obligatoria"
        break
      case "identityBack":
        if (!value) error = "La foto posterior de la cédula es obligatoria"
        break
      case "tags":
        if (!value.trim()) error = "Al menos una palabra clave requerida"
        break
      case "paymentProof":
        if (plan === "priority" && !value) error = "Debes subir el comprobante de pago"
        break
      case "facebook_url":
        if (value && !/^(https?:\/\/)?(www\.)?facebook\.com\/.+/i.test(value)) error = "La URL debe ser un perfil de Facebook válido"
        break
      case "instagram_url":
        if (value && !/^(https?:\/\/)?(www\.)?instagram\.com\/.+/i.test(value)) error = "La URL debe ser un perfil de Instagram válido"
        break
      case "x_url":
        if (value && !/^(https?:\/\/)?(www\.)?(twitter\.com\/|x\.com\/).+/i.test(value)) error = "La URL debe ser un perfil de X válido"
        break
      case "linkedin_url":
        if (value && !/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i.test(value)) error = "La URL debe ser un perfil de LinkedIn válido"
        break
      case "tiktok_url":
        if (value && !/^(https?:\/\/)?(www\.)?tiktok\.com\/.+/i.test(value)) error = "La URL debe ser un perfil de TikTok válido"
        break
      case "yt_url":
        if (value && !/^(https?:\/\/)?(www\.)?(youtube\.com\/|youtu\.be\/).+/i.test(value)) error = "La URL debe ser un canal de YouTube válido"
        break
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
    return !error
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const getInputBorderColor = (name: string) => {
    if (errors[name]) return "border-red-400"
    if (touched[name] && !errors[name] && formData[name as keyof FormData] !== "" && formData[name as keyof FormData] !== null) return "border-green-500"
    return "border-border"
  }

  const validateStep = (): boolean => {
    const currentFieldsToValidate: string[] = []
    let isValid = true

    switch (currentStep) {
      case 0:
        if (isAdditionalProfile) {
          currentFieldsToValidate.push("profileImage")
        } else {
          currentFieldsToValidate.push("fullName", "cedula", "email", "password", "confirmPassword", "phone", "profileImage")
        }
        break
      case 1:
        currentFieldsToValidate.push("profession", "specialty", "description", "yearsExperience", "workMode")
        break
      case 2:
        currentFieldsToValidate.push("province", "city", "address", "map")
        break
      case 3:
        currentFieldsToValidate.push("identityFront", "identityBack")
        break
      case 4:
        currentFieldsToValidate.push("tags", "facebook_url", "instagram_url", "x_url", "linkedin_url", "tiktok_url", "yt_url")
        break
      case 5:
        if (shouldChoosePriorityPaymentMethod) {
          setPriorityPaymentMethodError("Elegí un método de pago para continuar.")
          isValid = false
          break
        }
        if (isPriorityBankTransfer) currentFieldsToValidate.push("paymentProof")
        break
    }

    const newTouched = { ...touched }

    currentFieldsToValidate.forEach(field => {
      newTouched[field] = true
      const value = field === "map" ? (formData.lat !== undefined ? "valid" : undefined) : formData[field as keyof FormData]
      const isFieldValid = validateField(field, value)
      if (!isFieldValid) isValid = false
    })

    setTouched(newTouched)
    return isValid
  }

  const nextStep = () => {
    if (validateStep()) {
      setSlideDirection("right") // Set direction for next step
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setSlideDirection("left") // Set direction for previous step
    setCurrentStep((prev) => prev - 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (validateStep()) {
      setIsLoading(true)
      try {
        let token = localStorage.getItem("auth_token")

        if (isPriorityPayPhone && isAdditionalProfile && !token) {
          throw new Error("No se encontró una sesión activa")
        }

        if (!isAdditionalProfile && !token) {
          // Step 1: Register/authenticate the user first so every later flow, including PayPhone, has a user_id.
          const registerData = {
            nombre: formData.fullName,
            correo: formData.email,
            contrasena: formData.password,
            cedula: formData.cedula,
            telefono: formData.phone,
            rol_id: 2, // Always 2 for professionals
          }

          console.log("[v0] Registering user:", registerData)
          const authResponse = await authApi.register(registerData)
          token = authResponse.token || null

          if (!token) throw new Error("No se recibió el token de autenticación")
          saveToken(token) // Save token for consistency with future calls
          console.log("[v0] User registered successfully")
        } else if (isAdditionalProfile) {
          if (!token) throw new Error("No se encontró una sesión activa")
          console.log("[v0] Using existing token for additional profile")
        } else {
          console.log("[v0] Reusing existing authenticated token")
        }

        // Step 2: Upload profile image after registration/session validation
        let fotoUrl = ""
        if (formData.profileImage) {
          try {
            console.log("[v0] Uploading profile image to Cloudinary")
            fotoUrl = await uploadToCloudinary(formData.profileImage)
            console.log("[v0] Profile image uploaded, URL:", fotoUrl)
          } catch (uploadError) {
            console.warn("Could not upload profile image:", uploadError)
          }
        }

        let bannerUrl = ""
        if (formData.bannerImage) {
          try {
            console.log("[v0] Uploading banner image to Cloudinary")
            bannerUrl = await uploadToCloudinary(formData.bannerImage)
            console.log("[v0] Banner image uploaded, URL:", bannerUrl)
          } catch (uploadError) {
            console.warn("Could not upload banner image:", uploadError)
          }
        }

        // Step 3: Upload payment proof after register check. Reuse previous upload URL for retries.
        let comprobanteUrl: string | null = comprobantePagoUrl
        if (isPriorityBankTransfer) {
          if (!formData.paymentProof && !comprobantePagoUrl) {
            throw new Error("COMPROBANTE_REQUERIDO: Debes subir un comprobante de transferencia.")
          }
          if (!comprobanteUrl && formData.paymentProof) {
            const uploadRes = await profesionalApi.subirComprobantePago(formData.paymentProof)
            comprobanteUrl = uploadRes.url
            setComprobantePagoUrl(uploadRes.url)
          }
        }

        // Step 4: Create professional profile or prepare deferred PayPhone registration
        const perfilData = {
          profesion_id: Number(formData.profession),
          especialidad_id: Number(formData.specialty),
          ciudad_id: Number(formData.city),
          descripcion: formData.description,
          telefono: formData.phone,
          cedula: formData.cedula,
          calle_principal: formData.address,
          referencia: formData.reference,
          lat: formData.lat,
          lng: formData.lng,
          latitud: formData.lat, // Required for Direccion creation in backend
          longitud: formData.lng, // Required for Direccion creation in backend
          tarifa: formData.rate ? parseFloat(formData.rate) : 0,
          tarifa_hora: formData.rate ? parseFloat(formData.rate) : 0,
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url,
          tiktok_url: formData.tiktok_url,
          linkedin_url: formData.linkedin_url,
          x_url: formData.x_url,
          yt_url: formData.yt_url,
          show_phone: formData.showPhone,
          show_email: formData.showEmail,
          foto_url: fotoUrl, // Include foto_url directly in creation request
          banner_url: bannerUrl || undefined,
          modalidad: formData.workMode || undefined,
          plan: plan || undefined,
          comprobante_pago_url: comprobanteUrl || undefined,
          payment_method: isPriorityPayPhone ? "payphone" : undefined,
          payphone_flow: isPriorityPayPhone,
        }

        if (isPriorityPayPhone) {
          const uploadedDocuments = (
            await Promise.all([
              formData.identityFront
                ? uploadAssetToCloudinary(formData.identityFront).then<PayPhonePriorityDocumentDraft>((url) => ({ tipo: "cedula_frontal", url }))
                : Promise.resolve(null),
              formData.identityBack
                ? uploadAssetToCloudinary(formData.identityBack).then<PayPhonePriorityDocumentDraft>((url) => ({ tipo: "cedula_posterior", url }))
                : Promise.resolve(null),
              formData.title
                ? uploadAssetToCloudinary(formData.title).then<PayPhonePriorityDocumentDraft>((url) => ({ tipo: "titulo", url }))
                : Promise.resolve(null),
              formData.license
                ? uploadAssetToCloudinary(formData.license).then<PayPhonePriorityDocumentDraft>((url) => ({ tipo: "licencia", url }))
                : Promise.resolve(null),
            ])
          ).filter((document): document is PayPhonePriorityDocumentDraft => document !== null)

          const servicesDraft: PayPhonePriorityServiceDraft[] = formData.services.map((descripcion) => ({ descripcion }))
          const registrationDraft: PayPhonePriorityRegistrationDraft = {
            // The user is already registered/authenticated before PayPhone prepare.
            mode: "existing_user",
            registerData: undefined,
            profileData: {
              ...perfilData,
              comprobante_pago_url: undefined,
            },
            schedule: {
              matriz: formData.matrix,
            },
            services: servicesDraft,
            documents: uploadedDocuments,
          }

          const prepareResponse = await payphoneApi.preparePriorityCheckout(
            {
              plan: "priority",
              reference: `priority-registration-${Date.now()}`,
              registrationDraft,
            },
            token,
          )

          const clientTransactionId = prepareResponse.transaction.client_transaction_id
            || prepareResponse.checkout.clientTransactionId

          const checkoutUrl = prepareResponse.checkout.payWithCard
            || prepareResponse.checkout.checkoutUrl
            || prepareResponse.checkout.payWithPayPhone

          if (!checkoutUrl) {
            throw new Error("No se recibió la URL de checkout de PayPhone.")
          }

          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              PAYPHONE_PRIORITY_STORAGE_KEY,
              JSON.stringify({ clientTransactionId }),
            )
            window.location.assign(checkoutUrl)
          }

          return
        }

        console.log("[v0] Creating professional profile:", perfilData)
        const authenticatedToken = token

        if (!authenticatedToken) {
          throw new Error("No se recibió el token de autenticación")
        }

        const profileRes = await profesionalApi.crearPerfil(perfilData, authenticatedToken)
        const perfilId = profileRes?.perfil?.id || profileRes?.id || profileRes?.doc?.id
        
        if (!perfilId) throw new Error("No se pudo obtener el ID del perfil creado")
        console.log("[v0] Professional profile created with ID:", perfilId)

        // Step 5: Sync user record in 'usuarios' table (only for new users)
        if (!isAdditionalProfile) {
          try {
            const userUpdateData = {
              nombre: formData.fullName,
              telefono: formData.phone,
              cedula: formData.cedula,
              foto_url: fotoUrl
            }
            await usuarioApi.actualizarPerfil(userUpdateData, authenticatedToken)
          } catch (updateError) {
            console.warn("[v0] Could not update user record:", updateError)
          }
        }

        // Step 6: Save Availability Schedule using perfilId
        console.log("[v0] Saving availability matrix for profile:", perfilId)
        try {
          await horariosApi.actualizar({ perfilId, matriz: formData.matrix }, authenticatedToken)
          console.log("[v0] Availability matrix saved")
        } catch (horarioError) {
          console.error("[v0] Error saving availability matrix:", horarioError)
        }

        // Step 7: Upload other verification documents using perfilId
        const otherDocs = [
          { file: formData.identityFront, type: "cedula_frontal" },
          { file: formData.identityBack, type: "cedula_posterior" },
          { file: formData.title, type: "titulo" },
          { file: formData.license, type: "licencia" },
        ]

        await Promise.all([
          ...otherDocs
            .filter(d => d.file)
            .map(d => profesionalApi.subirDocumento(d.type, d.file as File, authenticatedToken, perfilId).catch(err => {
              console.error(`Error uploading ${d.type}:`, err)
            }))
        ])

        // Step 8: Process Services linked to perfilId
        if (formData.services.length > 0) {
          console.log("[v0] Creating professional services for profile:", perfilId)
          const { serviciosApi } = await import("@/lib/api")
          await Promise.allSettled(
              formData.services.map(service => 
              serviciosApi.crear({ perfilId, descripcion: service }, authenticatedToken)
            )
          )
        }

        removeToken()
        setIsLoading(false)
        setShowSuccessModal(true)
      } catch (error: any) {
        setIsLoading(false)
        console.error("[v0] Registration error:", error)
        
        const errorMsg = error.message ? error.message.toLowerCase() : ""
        if (errorMsg.includes("correo") && errorMsg.includes("registrado")) {
          // Keep all data, but clear email
          setFormData(prev => ({ ...prev, email: "" }))
          
          // Set error and touched for email
          setErrors(prev => ({ ...prev, email: "Este correo ya se encuentra registrado" }))
          setTouched(prev => ({ ...prev, email: true }))
          
          // Change step to the personal info step (Step 0)
          setSlideDirection("left")
          setCurrentStep(0)
          
          // Focus on the input after the step transition finishes
          setTimeout(() => {
            if (emailInputRef.current) {
              emailInputRef.current.focus()
            }
          }, 500) // 500ms to allow the slide animation to finish

          toast({
            title: "Correo ya registrado",
            description: "Ingresa un correo diferente para continuar. Tu comprobante y los demás datos se conservaron.",
            variant: "destructive",
          })
        } else if (errorMsg.includes("cedula") || errorMsg.includes("cédula")) {
          // Specific handler for duplicate ID (cedula)
          setErrors(prev => ({ 
            ...prev, 
            cedula: "Ya tienes una cuenta registrada con tu cédula, si quieres ofrecer otros servicios puedes crear otro perfil profesional si inicias sesión" 
          }))
          setTouched(prev => ({ ...prev, cedula: true }))
          
          // Move back to Step 1
          setSlideDirection("left")
          setCurrentStep(0)
          
          // Focus ID input
          setTimeout(() => {
            if (cedulaInputRef.current) {
              cedulaInputRef.current.focus()
            }
          }, 500)
        } else {
          toast({
            variant: "destructive",
            title: "Error al registrar",
            description: error.message || "Ocurrió un error inesperado al crear tu perfil.",
          })
        }
      }
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="font-oswald text-2xl font-bold text-foreground mb-8">
        {isAdditionalProfile ? "Imagen de Perfil" : "Información Personal"}
      </h2>
      {!isAdditionalProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Nombre Completo *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("fullName")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.fullName && touched.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Cédula *</label>
            <input
              ref={cedulaInputRef}
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              onBlur={handleBlur}
              pattern="\d*"
              inputMode="numeric"
              className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("cedula")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.cedula && touched.cedula && <p className="text-red-400 text-sm mt-1 leading-tight">{errors.cedula}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Teléfono de Contacto *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              pattern="\d*"
              inputMode="numeric"
              className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("phone")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.phone && touched.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Correo Electrónico *</label>
            <input
              ref={emailInputRef}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("email")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.email && touched.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Contraseña (mínimo 8 caracteres, mayúscula, minúscula y especial) *
            </label>
            <div className="relative mt-auto">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("password")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={`text-red-400 text-sm mt-1 min-h-[20px] ${errors.password && touched.password ? 'visible' : 'invisible'}`}>{errors.password || '\u00A0'}</p>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Confirmar Contraseña *
            </label>
            <div className="relative mt-auto">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("confirmPassword")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={`text-red-400 text-sm mt-1 min-h-[20px] ${errors.confirmPassword && touched.confirmPassword ? 'visible' : 'invisible'}`}>{errors.confirmPassword || '\u00A0'}</p>
          </div>
        </div>
      )}

      {/* Profile Image moved back to bottom but with circular preview */}
      <div className="flex flex-col items-center mt-8 py-6 border-t border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Foto de Perfil *</label>
        <div className="relative group">
          <input
            id="profileImage"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => handleFileChange("profileImage", e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="profileImage"
            className={`flex flex-col items-center justify-center size-48 rounded-full border-4 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
              errors.profileImage 
                ? "border-red-400 bg-red-50" 
                : profileImagePreview 
                  ? "border-primary shadow-xl" 
                  : "border-gray-300 hover:border-primary hover:bg-gray-50 bg-white"
            }`}
          >
            {profileImagePreview ? (
              <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <Upload className="size-10 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-primary">Click para subir</span>
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${profileImagePreview ? "visible" : "invisible"}`}>
              <Upload className="size-8 text-white" />
            </div>
          </label>
          
          {profileImagePreview && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleFileChange("profileImage", null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {errors.profileImage && <p className="text-red-400 text-sm mt-3 font-medium animate-pulse">{errors.profileImage}</p>}
        <p className="text-[10px] text-gray-400 mt-4 text-center max-w-[200px]">Recomendado: Imagen cuadrada, formato JPG o PNG. Máx {PROFILE_IMAGE_MAX_SIZE_MB}MB.</p>
      </div>

      <div className="flex flex-col items-center mt-8 py-6 border-t border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Imagen de banner (opcional)</label>
        <div className="w-full max-w-2xl">
          <input
            id="bannerImage"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => handleFileChange("bannerImage", e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="bannerImage"
            className={`relative flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
              errors.bannerImage
                ? "border-red-400 bg-red-50"
                : bannerImagePreview
                  ? "border-primary shadow-xl"
                  : "border-gray-300 hover:border-primary hover:bg-gray-50 bg-white"
            }`}
          >
            {bannerImagePreview ? (
              <img src={bannerImagePreview} alt="Preview banner" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <Upload className="size-10 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                <span className="text-sm font-medium text-gray-500 group-hover:text-primary">Click para subir tu banner</span>
                <span className="text-xs text-gray-400 mt-2">Ideal para destacar tu perfil público</span>
              </div>
            )}
            <div className={`absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity ${bannerImagePreview ? "visible" : "invisible"}`}>
              <Upload className="size-8 text-white" />
            </div>
          </label>

          {bannerImagePreview && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleFileChange("bannerImage", null)
              }}
              className="mt-3 inline-flex items-center rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-red-600"
            >
              Quitar banner
            </button>
          )}

          {errors.bannerImage && <p className="text-red-400 text-sm mt-3 font-medium animate-pulse">{errors.bannerImage}</p>}
          <p className="text-xs text-gray-400 mt-4 text-center">Formato recomendado horizontal, JPG o PNG. Máx {PROFILE_IMAGE_MAX_SIZE_MB}MB.</p>
        </div>
      </div>
    </div>
  )

  const renderProfessionalInfo = () => (
    <div className="space-y-6">
      <h2 className="font-oswald text-2xl font-bold text-foreground mb-8">Información Profesional</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Profesión *</label>
          <select
            name="profession"
            value={formData.profession}
            onChange={(e) => handleSelectChange("profession", e.target.value)}
            onBlur={(e) => {
              setTouched(prev => ({ ...prev, profession: true }))
              validateField("profession", e.target.value)
            }}
            className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("profession")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="">Selecciona tu profesión</option>
            {professions.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.nombre}
              </option>
            ))}
          </select>
          {errors.profession && touched.profession && <p className="text-red-400 text-sm mt-1">{errors.profession}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Especialidad *</label>
          <select
            name="specialty"
            value={formData.specialty}
            onChange={(e) => handleSelectChange("specialty", e.target.value)}
            onBlur={(e) => {
              setTouched(prev => ({ ...prev, specialty: true }))
              validateField("specialty", e.target.value)
            }}
            disabled={!formData.profession}
            className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("specialty")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50`}
          >
            <option value="">Selecciona tu especialidad</option>
            {specialties.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.nombre}
              </option>
            ))}
          </select>
          {errors.specialty && touched.specialty && <p className="text-red-400 text-sm mt-1">{errors.specialty}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Años de Experiencia</label>
          <input
            type="number"
            name="yearsExperience"
            min="0"
            max="70"
            step="1"
            value={formData.yearsExperience === 0 ? "" : formData.yearsExperience}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={(e) => {
              if (formData.yearsExperience === 0) {
                e.target.value = ""
              }
            }}
            placeholder="0"
            className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("yearsExperience")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.yearsExperience && touched.yearsExperience && <p className="text-red-400 text-sm mt-1">{errors.yearsExperience}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Tarifa o Precio (Opcional)</label>
          <input
            type="text"
            inputMode="decimal"
            name="rate"
            value={formData.rate}
            onChange={handleInputChange}
            onBlur={(e) => {
              const val = e.target.value;
              if (val) {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                  setFormData(prev => ({ ...prev, rate: num.toFixed(2) }));
                }
              }
            }}
            placeholder="0.00"
            className={`w-full px-4 py-3 bg-card border ${errors.rate ? "border-red-400" : "border-border"} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.rate && <p className="text-red-400 text-sm mt-1">{errors.rate}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Modalidad de Trabajo *</label>
          <select
            name="workMode"
            value={formData.workMode}
            onChange={(e) => handleSelectChange("workMode", e.target.value)}
            onBlur={(e) => {
              setTouched(prev => ({ ...prev, workMode: true }))
              validateField("workMode", e.target.value)
            }}
            className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("workMode")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="">Selecciona la modalidad</option>
            {workModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          {errors.workMode && touched.workMode && <p className="text-red-400 text-sm mt-1">{errors.workMode}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Descripción, escribe tu presentación como profesional* (máximo 80 caracteres)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          onBlur={handleBlur}
          maxLength={80}
          rows={4}
          className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("description")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
        />
        <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/80 caracteres</p>
        {errors.description && touched.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="pt-4 border-t border-border">
        <label className="block text-lg font-bold text-foreground mb-4">Servicios Ofrecidos (Opcional)</label>
        <p className="text-sm text-muted-foreground mb-4">
          Añade los servicios específicos que ofreces a tus clientes.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={serviceInput}
            onChange={(e) => setServiceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const val = serviceInput.trim()
                if (val && !formData.services.includes(val)) {
                  setFormData(prev => ({ ...prev, services: [...prev.services, val] }))
                  setServiceInput("")
                }
              }
            }}
            placeholder="Ej: Asesoría Legal Corporativa"
            className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => {
              const val = serviceInput.trim()
              if (val && !formData.services.includes(val)) {
                setFormData(prev => ({ ...prev, services: [...prev.services, val] }))
                setServiceInput("")
              }
            }}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shrink-0"
          >
            Añadir
          </button>
        </div>
        
        {formData.services.length > 0 ? (
          <ul className="space-y-2">
            {formData.services.map((service, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
                <span className="text-foreground">{service}</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }))}
                  className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-4">No has añadido ningún servicio aún.</p>
        )}
      </div>

      {/* Disponibilidad Horaria Section: Vertical Calendar View (Moved from Step 5) */}
      <div className="space-y-6 pt-8 border-t border-border">
        <div>
          <h3 className="font-oswald text-xl font-bold text-foreground">Configura tu Horario</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Marca las horas en las que estarás disponible para recibir citas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, matrix: Array(168).fill(true) }))}
            className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-colors"
          >
            Disponible Siempre
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, matrix: Array(168).fill(false) }))}
            className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-full font-medium hover:bg-muted/80 transition-colors"
          >
            Limpiar Todo
          </button>
          <button
            type="button"
            onClick={() => {
              const newMatrix = Array(168).fill(false);
              for (let d = 0; d < 5; d++) {
                // Mañana: 8am a 1pm (8, 9, 10, 11, 12)
                for (let h = 8; h < 13; h++) {
                  newMatrix[d * 24 + h] = true;
                }
                // Tarde: 3pm a 6pm (15, 16, 17)
                for (let h = 15; h < 18; h++) {
                  newMatrix[d * 24 + h] = true;
                }
              }
              setFormData(prev => ({ ...prev, matrix: newMatrix }));
            }}
            className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-medium hover:bg-indigo-100 transition-colors"
          >
            Lunes a Viernes (8am - 1pm y 3pm - 6pm)
          </button>
        </div>

        <ScheduleGrid 
          matrix={formData.matrix} 
          onChange={(newMatrix) => setFormData(prev => ({ ...prev, matrix: newMatrix }))} 
        />
      </div>

    </div>
  )

  const renderLocation = () => (
    <div className="space-y-6">
      <h2 className="font-oswald text-2xl font-bold text-foreground mb-8">Ubicación</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Provincia *</label>
          <select
            name="province"
            value={formData.province}
            onChange={(e) => handleSelectChange("province", e.target.value)}
            onBlur={(e) => {
              setTouched(prev => ({ ...prev, province: true }))
              validateField("province", e.target.value)
            }}
            className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("province")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <option value="">Selecciona provincia</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.nombre}
              </option>
            ))}
          </select>
          {errors.province && touched.province && <p className="text-red-400 text-sm mt-1">{errors.province}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Ciudad *</label>
          <select
            name="city"
            value={formData.city}
            onChange={(e) => handleSelectChange("city", e.target.value)}
            onBlur={(e) => {
              setTouched(prev => ({ ...prev, city: true }))
              validateField("city", e.target.value)
            }}
            disabled={!formData.province}
            className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("city")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50`}
          >
            <option value="">Selecciona ciudad</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.nombre}
              </option>
            ))}
          </select>
          {errors.city && touched.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-muted-foreground mb-4">Ubicación en el Mapa</label>
        <div className={`border ${errors.map && touched.map ? 'border-red-400' : 'border-border'} rounded-lg overflow-hidden`}>
          <LocationMap
            lat={formData.lat}
            lng={formData.lng}
            onChange={handleLocationChange}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Mueve el pin o haz clic en el mapa para establecer tu ubicación exacta.
        </p>
        {errors.map && touched.map && <p className="text-red-400 text-sm mt-1">{errors.map}</p>}
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Dirección Exacta * <span className="text-red-500 font-normal text-xs ml-1">(por favor revisa que la dirección esté correcta)</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 bg-card border ${getInputBorderColor("address")} rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
        />
        {errors.address && touched.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-muted-foreground mb-2">Referencia (Opcional)</label>
        <input
          type="text"
          name="reference"
          value={formData.reference}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <h2 className="font-oswald text-2xl font-bold text-foreground mb-8">Documentos de Verificación</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Todos los documentos son opcionales. Puedes subirlos más tarde.
      </p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-4">
            Documento de Identidad (Cédula o DNI) - Obligatorio
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Parte Frontal</p>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => handleFileChange("identityFront", e.target.files?.[0] || null)}
                className="hidden"
                id="identityFront"
              />
              <label
                htmlFor="identityFront"
                className={`flex items-center justify-center w-full h-32 border-2 border-dashed ${errors.identityFront ? "border-red-400" : formData.identityFront ? "border-green-500 bg-green-500/10" : "border-border"} rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group`}
              >
                <div className="flex flex-col items-center justify-center px-2 text-center">
                  {formData.identityFront ? (
                    <CheckCircle2 className="size-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Upload className="size-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  )}
                  <p className={`text-xs truncate w-full ${formData.identityFront ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                    {formData.identityFront ? formData.identityFront.name : "Subir Frontal"}
                  </p>
                </div>
              </label>
              {errors.identityFront && <p className="text-red-400 text-xs mt-1 text-center">{errors.identityFront}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Parte Posterior</p>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => handleFileChange("identityBack", e.target.files?.[0] || null)}
                className="hidden"
                id="identityBack"
              />
              <label
                htmlFor="identityBack"
                className={`flex items-center justify-center w-full h-32 border-2 border-dashed ${errors.identityBack ? "border-red-400" : formData.identityBack ? "border-green-500 bg-green-500/10" : "border-border"} rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group`}
              >
                <div className="flex flex-col items-center justify-center px-2 text-center">
                  {formData.identityBack ? (
                    <CheckCircle2 className="size-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Upload className="size-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  )}
                  <p className={`text-xs truncate w-full ${formData.identityBack ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                    {formData.identityBack ? formData.identityBack.name : "Subir Posterior"}
                  </p>
                </div>
              </label>
              {errors.identityBack && <p className="text-red-400 text-xs mt-1 text-center">{errors.identityBack}</p>}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Título Profesional - Opcional</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => handleFileChange("title", e.target.files?.[0] || null)}
            className="hidden"
            id="title"
          />
          <label
            htmlFor="title"
            className={`flex items-center justify-center w-full h-32 border-2 border-dashed ${errors.title ? "border-red-400" : formData.title ? "border-green-500 bg-green-500/10" : "border-border"} rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group`}
          >
            <div className="flex flex-col items-center justify-center">
              {formData.title ? (
                <CheckCircle2 className="size-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              ) : (
                <Upload className="size-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              )}
              <p className={`text-sm ${formData.title ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                {formData.title ? formData.title.name : "Sube tu título profesional"}
              </p>
            </div>
          </label>
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Licencia Profesional - Opcional
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => handleFileChange("license", e.target.files?.[0] || null)}
            className="hidden"
            id="license"
          />
          <label
            htmlFor="license"
            className={`flex items-center justify-center w-full h-32 border-2 border-dashed ${errors.license ? "border-red-400" : formData.license ? "border-green-500 bg-green-500/10" : "border-border"} rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group`}
          >
            <div className="flex flex-col items-center justify-center">
              {formData.license ? (
                <CheckCircle2 className="size-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              ) : (
                <Upload className="size-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              )}
              <p className={`text-sm ${formData.license ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                {formData.license ? formData.license.name : "Sube tu licencia profesional"}
              </p>
            </div>
          </label>
          {errors.license && <p className="text-red-400 text-sm mt-1">{errors.license}</p>}
        </div>
      </div>
    </div>
  )

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-oswald text-2xl font-bold text-foreground mb-4">Preferencias Finales</h2>
        <p className="text-muted-foreground">Configura los últimos detalles para tu perfil profesional.</p>
      </div>

      <div className="space-y-6 pt-8 border-t border-border">
        <div>
          <h3 className="font-oswald text-xl font-bold text-foreground">Privacidad y Contacto</h3>
          <p className="text-sm text-muted-foreground mt-1">Controla qué información es visible en tu perfil público.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/5 transition-all cursor-pointer group shadow-sm">
            <input
              type="checkbox"
              name="showPhone"
              checked={formData.showPhone}
              onChange={handleInputChange}
              className="size-5 rounded border-border bg-card text-primary focus:ring-primary/50 cursor-pointer"
            />
            <div>
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Mostrar teléfono</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Visible para clientes interesados</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/5 transition-all cursor-pointer group shadow-sm">
            <input
              type="checkbox"
              name="showEmail"
              checked={formData.showEmail}
              onChange={handleInputChange}
              className="size-5 rounded border-border bg-card text-primary focus:ring-primary/50 cursor-pointer"
            />
            <div>
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Mostrar correo</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Visible para contacto directo</p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-border">
        <div>
          <h3 className="font-oswald text-xl font-bold text-foreground">Redes Sociales</h3>
          <p className="text-sm text-muted-foreground mt-1">Aumenta tu visibilidad añadiendo los enlaces a tus perfiles profesionales.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Facebook className="size-4 text-blue-600" /> Facebook
            </label>
            <input
              type="url"
              name="facebook_url"
              value={formData.facebook_url}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="https://facebook.com/usuario"
              className={`w-full px-4 py-2.5 bg-card border ${getInputBorderColor("facebook_url")} rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30`}
            />
            {errors.facebook_url && touched.facebook_url && <p className="text-red-400 text-sm mt-1">{errors.facebook_url}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Instagram className="size-4 text-pink-600" /> Instagram
            </label>
            <input
              type="url"
              name="instagram_url"
              value={formData.instagram_url}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="https://instagram.com/usuario"
              className={`w-full px-4 py-2.5 bg-card border ${getInputBorderColor("instagram_url")} rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30`}
            />
            {errors.instagram_url && touched.instagram_url && <p className="text-red-400 text-sm mt-1">{errors.instagram_url}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="size-4 flex items-center justify-center font-bold text-[10px] border border-foreground rounded-sm leading-none">X</div> Twitter / X
            </label>
            <input
              type="url"
              name="x_url"
              value={formData.x_url}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="https://x.com/usuario"
              className={`w-full px-4 py-2.5 bg-card border ${getInputBorderColor("x_url")} rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30`}
            />
            {errors.x_url && touched.x_url && <p className="text-red-400 text-sm mt-1">{errors.x_url}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Linkedin className="size-4 text-blue-700" /> LinkedIn
            </label>
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="https://linkedin.com/in/usuario"
              className={`w-full px-4 py-2.5 bg-card border ${getInputBorderColor("linkedin_url")} rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30`}
            />
            {errors.linkedin_url && touched.linkedin_url && <p className="text-red-400 text-sm mt-1">{errors.linkedin_url}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Music className="size-4 text-gray-900" /> TikTok
            </label>
            <input
              type="url"
              name="tiktok_url"
              value={formData.tiktok_url}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="https://tiktok.com/@usuario"
              className={`w-full px-4 py-2.5 bg-card border ${getInputBorderColor("tiktok_url")} rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30`}
            />
            {errors.tiktok_url && touched.tiktok_url && <p className="text-red-400 text-sm mt-1">{errors.tiktok_url}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Youtube className="size-4 text-red-600" /> YouTube
            </label>
            <input
              type="url"
              name="yt_url"
              value={formData.yt_url}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="https://youtube.com/@canal"
              className={`w-full px-4 py-2.5 bg-card border ${getInputBorderColor("yt_url")} rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30`}
            />
            {errors.yt_url && touched.yt_url && <p className="text-red-400 text-sm mt-1">{errors.yt_url}</p>}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border">
        <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span>Palabras Clave (Tags)</span>
          <span className="text-xs font-normal text-muted-foreground">(Pro Tip  ;) Usa palabras clave para que tu perfil sea encontrado por los clientes)</span>
        </label>
        
        <div className={`w-full min-h-[50px] px-3 py-2 bg-card border ${errors.tags ? "border-red-400" : "border-border/60"} rounded-xl text-foreground focus-within:ring-2 focus-within:ring-green-500/30 flex flex-wrap gap-2 items-center transition-all shadow-sm`}>
          {formData.tags.split(',').filter(Boolean).map((tag, index) => (
            <span key={index} className="flex items-center gap-1.5 bg-green-500/10 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-500/20 shadow-sm group">
              <button
                type="button"
                className="hover:bg-green-500/20 rounded-full p-0.5 transition-colors focus:outline-none"
                onClick={() => {
                  const updatedTags = formData.tags.split(',').filter(Boolean).filter((_, i) => i !== index).join(',');
                  setFormData(prev => ({ ...prev, tags: updatedTags }));
                  setTouched(prev => ({ ...prev, tags: true }))
                  validateField("tags", updatedTags)
                }}
              >
                <X size={14} className="group-hover:scale-110 transition-transform" />
              </button>
              <span className="tracking-wide"> {tag} </span>
            </span>
          ))}

          <input
            type="text"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value)
              if (errors.tags) setErrors(prev => ({ ...prev, tags: "" }))
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                const newTag = tagInput.trim();
                if (newTag) {
                  const currentList = formData.tags.split(',').filter(Boolean);
                  if (!currentList.includes(newTag)) {
                    currentList.push(newTag);
                    const finalTags = currentList.join(',')
                    setFormData(prev => ({ ...prev, tags: finalTags }));
                    setTouched(prev => ({ ...prev, tags: true }))
                    validateField("tags", finalTags)
                  }
                  setTagInput("");
                }
              } else if (e.key === 'Backspace' && tagInput === '') {
                e.preventDefault();
                const currentList = formData.tags.split(',').filter(Boolean);
                if (currentList.length > 0) {
                  currentList.pop();
                  const finalTags = currentList.join(',')
                  setFormData(prev => ({ ...prev, tags: finalTags }));
                  setTouched(prev => ({ ...prev, tags: true }))
                  validateField("tags", finalTags)
                }
              }
            }}
            placeholder="Escribe y presiona espacio"
            className="flex-1 min-w-[150px] bg-transparent focus:outline-none placeholder:text-muted-foreground/40 text-foreground text-sm"
          />
        </div>
        {errors.tags && touched.tags && <p className="text-red-400 text-xs mt-1 font-medium">{errors.tags}</p>}
        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tight font-bold opacity-60">Sugerencia: Usa términos como "Certificado", "A domicilio", "Atención rápida".</p>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="font-oswald text-2xl font-bold text-foreground mb-4">
          {shouldChoosePriorityPaymentMethod
            ? "Elige tu método de pago"
            : isPriorityPayPhone
              ? "Pago con PayPhone"
              : "Comprobante de transferencia"}
        </h2>
        <p className="text-muted-foreground">
          {shouldChoosePriorityPaymentMethod
            ? "Tu solicitud priority siempre queda pendiente de revisión manual/admin, incluso si pagás con tarjeta por PayPhone."
            : isPriorityPayPhone
              ? "Cuando envíes el formulario, te redirigiremos a PayPhone para completar el pago."
              : "Sube tu comprobante para registrar tu solicitud priority y pasar a revisión manual."}
        </p>
      </div>

      {shouldChoosePriorityPaymentMethod ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => updatePriorityPaymentMethod("bank")}
              className="rounded-2xl border border-slate-300 bg-white p-5 text-left transition-all hover:border-blue-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <p className="text-lg font-bold text-slate-900">Transferencia bancaria</p>
              <p className="mt-2 text-sm text-slate-600">
                Vas a ver las cuentas disponibles y luego subir tu comprobante para revisión manual.
              </p>
            </button>

            <button
              type="button"
              onClick={() => updatePriorityPaymentMethod("payphone")}
              className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left transition-all hover:border-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <p className="text-lg font-bold text-slate-900">Tarjeta de crédito/débito (PayPhone)</p>
              <p className="mt-2 text-sm text-slate-600">
                Al enviar el formulario te redirigiremos a PayPhone y, si el pago queda Approved, seguirá pendiente de revisión manual/admin.
              </p>
            </button>
          </div>

          {priorityPaymentMethodError ? (
            <p className="text-sm text-red-500">{priorityPaymentMethodError}</p>
          ) : null}
        </div>
      ) : null}

      {!shouldChoosePriorityPaymentMethod ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950 shadow-sm dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-50">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              {isPriorityPayPhone ? "Qué va a pasar" : "Cuentas disponibles"}
            </p>
            <p className="mt-1 text-sm text-blue-900/80 dark:text-blue-100/80">
              {isPriorityPayPhone
                ? "Al terminar este formulario vas a continuar en PayPhone. Si el pago queda Approved, se registrará y quedará pendiente de revisión/validación manual."
                : "Realiza la transferencia a cualquiera de estas cuentas y luego sube tu comprobante."}
            </p>
          </div>
          {isPriorityPayPhone ? (
            <div className="rounded-xl border border-blue-200 bg-white/80 p-5 text-sm shadow-sm dark:border-blue-900 dark:bg-slate-950/40">
              <ul className="space-y-2 text-blue-950 dark:text-blue-50">
                <li>• Te redirigiremos al checkout seguro de PayPhone al enviar el formulario.</li>
                <li>• El pago aprobado NO activa el perfil automáticamente.</li>
                <li>• Nuestro equipo debe revisar y validar la solicitud antes de cualquier activación.</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 text-center">
                <button
                  type="button"
                  onClick={() => updatePriorityPaymentMethod("bank")}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 underline underline-offset-2 font-medium transition-colors"
                >
                  Prefiero pagar con transferencia
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {isLoadingPriorityBankAccounts ? (
                  <div className="col-span-full flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white/80 p-6 text-sm text-blue-900 dark:border-blue-900 dark:bg-slate-950/40 dark:text-blue-50">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando cuentas bancarias...
                  </div>
                ) : priorityBankAccountsError ? (
                  <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200">
                    {priorityBankAccountsError}
                  </div>
                ) : priorityBankAccounts.length === 0 ? (
                  <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                    No hay cuentas bancarias activas disponibles en este momento.
                  </div>
                ) : (
                  priorityBankAccounts.map((account) => (
                    <div key={account.bankName} className="rounded-xl border border-blue-200 bg-white/80 p-4 shadow-sm dark:border-blue-900 dark:bg-slate-950/40">
                      <h3 className="mb-3 font-oswald text-lg font-bold text-blue-950 dark:text-blue-50">{account.bankName}</h3>
                      <dl className="space-y-2 text-sm">
                        {account.details.map((detail) => {
                          const detailKey = `${account.bankName}-${detail.label}`
                          const canCopyDetail = isCopyableBankDetail(detail.label) && detail.value !== "No registrado"
                          const wasCopied = copiedBankDetailKey === detailKey

                          return (
                            <div key={detailKey} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                              <dt className="font-semibold text-blue-800 dark:text-blue-200">{detail.label}</dt>
                              <dd className="break-words text-blue-950 sm:text-right dark:text-blue-50">
                                {canCopyDetail ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyBankDetail(detailKey, detail.value)}
                                    aria-label={`Copiar ${detail.label} de ${account.bankName}: ${detail.value}`}
                                    className="group inline-flex max-w-full items-center justify-start gap-1.5 rounded-md text-left font-medium transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white sm:justify-end sm:text-right dark:hover:text-blue-200 dark:focus:ring-offset-slate-950"
                                  >
                                    <span className="break-words">{detail.value}</span>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-100 dark:group-hover:bg-blue-800">
                                      {wasCopied ? "Copiado" : <><Copy className="size-3" aria-hidden="true" /> Copiar</>}
                                    </span>
                                  </button>
                                ) : (
                                  detail.value
                                )}
                              </dd>
                            </div>
                          )
                        })}
                      </dl>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Sube el comprobante (JPG, PNG, WEBP o PDF, máx 5MB)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  onChange={(e) => handleFileChange("paymentProof", e.target.files?.[0] || null)}
                  className="hidden"
                  id="paymentProof"
                />
                <label
                  htmlFor="paymentProof"
                  className={`flex items-center justify-center w-full h-32 border-2 border-dashed ${errors.paymentProof ? "border-red-400" : formData.paymentProof ? "border-green-500 bg-green-500/10" : "border-border"} rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group`}
                >
                  <div className="flex flex-col items-center justify-center">
                    {formData.paymentProof ? <CheckCircle2 className="size-8 text-green-500 mb-2" /> : <Upload className="size-8 text-primary mb-2" />}
                    <p className={`text-sm ${formData.paymentProof ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                      {formData.paymentProof ? formData.paymentProof.name : "Sube tu comprobante"}
                    </p>
                  </div>
                </label>
                {errors.paymentProof && <p className="text-red-400 text-sm mt-1">{errors.paymentProof}</p>}
              </div>
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => updatePriorityPaymentMethod("payphone")}
                  className="text-sm text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium transition-colors"
                >
                  Prefiero pagar con PayPhone
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )


  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6 group"
        >
          <Home className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-varela">Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-oswald text-4xl md:text-5xl font-bold text-foreground mb-4">Crear Perfil Profesional</h1>
          <p className="font-arimo text-lg text-muted-foreground">
            Completa tu información para comenzar a conectar con clientes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;

              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCompleted) {
                        setSlideDirection("left");
                        setCurrentStep(index);
                        setErrors({});
                      }
                    }}
                    disabled={!isCompleted && !isActive}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${isCompleted
                      ? "bg-primary text-primary-foreground cursor-pointer hover:opacity-80"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background cursor-default"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                  >
                    {isCompleted ? <Check size={20} /> : index + 1}
                  </button>
                  <p
                    className={`hidden md:block text-sm mt-2 font-medium text-center ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
          
          {/* Título de paso centralizado solo para móvil */}
          <div className="md:hidden text-center mb-6 animate-in fade-in duration-300">
            <p className="text-sm font-bold text-primary uppercase tracking-wider">Paso {currentStep + 1}: {steps[currentStep].title}</p>
          </div>

          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="relative overflow-x-hidden p-1">
          <div
            className={`transition-all duration-500 ease-in-out ${slideDirection === "right" ? "animate-in slide-in-from-right" : "animate-in slide-in-from-left"
              }`}
          >
            {currentStep === 0 && renderPersonalInfo()}
            {currentStep === 1 && renderProfessionalInfo()}
            {currentStep === 2 && renderLocation()}
            {currentStep === 3 && renderDocuments()}
            {currentStep === 4 && renderPreferences()}
            {isPriorityPlan && currentStep === 5 && renderPaymentStep()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8 justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="font-varela flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-full font-semibold hover:bg-muted/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="font-varela flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {isPriorityPayPhone ? "Continuar a PayPhone" : "Crear Perfil"}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="font-varela flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/20"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500 delay-150">
                <CheckCircle2 className="size-10 text-green-500" />
              </div>
              <h3 className="font-oswald text-2xl font-bold text-foreground mb-2">¡Datos Enviados Correctamente!</h3>

              {isPriorityPlan ? (
                <>
                  <p className="font-arimo text-muted-foreground mb-6">
                    {isPriorityPayPhone
                      ? "Tu solicitud priority fue enviada. Si el pago se registra correctamente, quedará pendiente de revisión/validación manual."
                      : "Has elegido la opción priority. Hemos recibido tu comprobante y tu solicitud quedará pendiente de revisión/validación manual."}
                  </p>
                  {comprobantePagoUrl && (
                    <a href={comprobantePagoUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-primary underline mb-4">Ver comprobante cargado</a>
                  )}

                  <p className="text-sm text-muted-foreground mb-6 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Importante:</span> El pago registrado
                    no activa el perfil automáticamente. Nuestro equipo debe validar la solicitud y luego te
                    notificaremos por correo sobre el estado final.
                  </p>
                </>
              ) : (
                <div className="space-y-4 mb-6">
                  <p className="font-arimo text-muted-foreground">
                    Tu cuenta ha sido creada exitosamente.
                  </p>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20 shadow-inner overflow-hidden relative text-left">
                    <p className="text-sm text-foreground leading-relaxed">
                      Estamos muy emocionados de tenerte con nosotros Tu perfil ha sido recibido con éxito y ya está en manos de nuestro equipo de revisión. 
                    </p>
                    <div className="mt-4 p-3 bg-card/50 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium text-primary">
                        Te enviaremos un correo electrónico apenas tu perfil sea aprobado para que empieces a conectar con clientes.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center italic">
                      ¡Gracias por ser parte de Profesionales.EC!
                    </p>
                  </div>
                </div>
              )}

              <Link
                href="/"
                className="font-varela inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/20"
              >
                <Home className="size-5" />
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="size-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-12 bg-primary/10 rounded-full animate-pulse flex items-center justify-center">
                  <Upload className="size-6 text-primary" />
                </div>
              </div>
            </div>
            <h3 className="font-oswald text-2xl font-bold text-foreground mb-2 animate-pulse">
              Creando tu Perfil Profesional
            </h3>
            <p className="font-arimo text-muted-foreground max-w-xs mx-auto">
              Estamos procesando tus documentos y configurando tu espacio. ¡Casi terminamos!
            </p>
            
            <div className="mt-8 flex justify-center gap-1">
              <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="size-2 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
