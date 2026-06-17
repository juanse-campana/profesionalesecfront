export type AuthSessionPayload = {
  role: string | null
  exp: number | null
}

export const USER_ROLE = "usuario"
export const PROFESSIONAL_ROLE = "profesional"
export const ADMIN_ROLES = ["superadmin", "moderador"] as const

export function parseRoleFromToken(token: string): AuthSessionPayload {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return { role: null, exp: null }

    const payload = JSON.parse(atob(parts[1]))
    return {
      role: payload?.rol ?? null,
      exp: payload?.exp ?? null,
    }
  } catch {
    return { role: null, exp: null }
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_data")
}

export function isTokenExpired(exp: number | null) {
  return Boolean(exp && exp * 1000 < Date.now())
}

export function getDashboardRouteForRole(role: string | null) {
  if (!role) return "/"
  if (ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) return "/admin"
  if (role === PROFESSIONAL_ROLE) return "/dashboard/profesional"
  if (role === USER_ROLE) return "/dashboard"
  return "/dashboard"
}
