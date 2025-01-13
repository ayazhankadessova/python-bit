// app/admin/layout.tsx
import { AdminGuard } from '@/components/guards/admin-guard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminGuard>{children}</AdminGuard>
}
