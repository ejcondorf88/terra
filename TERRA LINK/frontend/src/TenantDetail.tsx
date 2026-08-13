import React, { useEffect, useState } from 'react'

type TenantDetailProps = {
  tenantId: string
  token: string
  backend: string
}

type TenantDetailData = {
  id: number
  name: string
  domain?: string
  sector?: string
  contactEmail?: string
  created_at?: string
}

type BillingAccount = {
  tenant_id: number
  stripe_customer_id: string
  stripe_subscription_id: string | null
  status: string
  price_id: string | null
  current_period_end: string | null
  latest_invoice_id: string | null
}

type UserSummary = {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
}

export default function TenantDetail({ tenantId, token, backend }: TenantDetailProps){
  const [tenant, setTenant] = useState<TenantDetailData | null>(null)
  const [billing, setBilling] = useState<BillingAccount | null>(null)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function fetchDetail(){
      try{
        setLoading(true)
        const [tenantRes, billingRes, usersRes] = await Promise.all([
          fetch(`${backend}/tenants/${tenantId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backend}/billing/account`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backend}/users`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if (!tenantRes.ok) {
          throw new Error('No se pudo cargar el tenant')
        }

        const tenantData = await tenantRes.json()
        setTenant(tenantData)

        if (billingRes.ok) {
          const billingData = await billingRes.json()
          setBilling(billingData)
        } else {
          setBilling(null)
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        } else {
          setUsers([])
        }
      }catch(err){
        console.warn(err)
        setError('Error cargando los detalles del tenant')
      } finally {
        setLoading(false)
      }
    }

    if (token && tenantId) {
      fetchDetail()
    }
  }, [tenantId, token, backend])

  if (loading) {
    return <p>Cargando detalles del tenant…</p>
  }

  if (error) {
    return <p className="error">{error}</p>
  }

  if (!tenant) {
    return <p>No hay datos del tenant disponibles.</p>
  }

  return (
    <div className="tenant-detail-card">
      <div className="tenant-info">
        <p><strong>ID:</strong> {tenant.id}</p>
        <p><strong>Nombre:</strong> {tenant.name}</p>
        <p><strong>Dominio:</strong> {tenant.domain || 'N/A'}</p>
        <p><strong>Sector:</strong> {tenant.sector || 'N/A'}</p>
        <p><strong>Email de contacto:</strong> {tenant.contactEmail || 'N/A'}</p>
        <p><strong>Creado:</strong> {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}</p>
      </div>

      <div className="tenant-billing-info">
        <h4>Estado de facturación</h4>
        {billing ? (
          <>
            <p><strong>Estado:</strong> {billing.status}</p>
            <p><strong>Precio:</strong> {billing.price_id || 'N/A'}</p>
            <p><strong>Periodo hasta:</strong> {billing.current_period_end ? new Date(billing.current_period_end).toLocaleDateString() : 'N/A'}</p>
          </>
        ) : (
          <p>No hay cuenta de facturación configurada.</p>
        )}
      </div>

      <div className="tenant-users">
        <h4>Usuarios asociados</h4>
        {users.length > 0 ? (
          <ul>
            {users.map(user => (
              <li key={user.id}>{user.username} — {user.email} — {user.role}</li>
            ))}
          </ul>
        ) : (
          <p>No hay usuarios asociados.</p>
        )}
      </div>
    </div>
  )
}
