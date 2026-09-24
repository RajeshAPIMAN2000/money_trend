import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import PageShell from '../../components/shared/PageShell.jsx'
import AdminAddUserModal from '../../components/users/AdminAddUserModal.jsx'

/** Legacy /admin/users/add route — opens the Add User popup then returns to users list */
export default function AddUserPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(true)
  }, [])

  const close = () => {
    setOpen(false)
    navigate('/admin/users', { replace: true })
  }

  return (
    <PageShell
      title="Add User"
      breadcrumb={['Home', 'User Management', 'Users', 'Add']}
      description="Create a user with register + KYC + nominee (same payloads as the app)."
    >
      <p className="text-sm text-slate-500">Opening Add User popup…</p>
      <AdminAddUserModal
        open={open}
        onClose={close}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
        }}
      />
    </PageShell>
  )
}
