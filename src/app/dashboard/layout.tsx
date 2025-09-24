import type { PropsWithChildren } from "react"
import { AuthLayout } from "./auth-layout"

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  )
}
