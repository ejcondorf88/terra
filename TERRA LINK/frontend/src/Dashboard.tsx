import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js'
import TenantDetail from './TenantDetail'
import NotificationLogPanel from './NotificationLogPanel'

Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

type Metrics = {
  totalCollateralizedValue: number
  totalRequested: number
  activeProposals: number
  averageRiskScore: number
  stablecoinDistribution: Record<string, number>
  liquidityCoverage: number
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

type Invoice = {
  id: string
  status: string
  amount_paid: number
  currency: string
  hosted_invoice_url?: string
  created: number
}

type AlertsSummary = {
  totalUnresolved: number
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
    [key: string]: number
  }
  byType: {
    humidity: number
    ndvi: number
    pest: number
    ph: number
    [key: string]: number
  }
  recurringTypes: string[]
  recentCount30d: number
  summaryText: string
}

type NotificationChannel = 'slack' | 'teams' | 'email'
type NotificationSeverityThreshold = 'low' | 'medium' | 'high' | 'critical'

type TenantNotificationSettings = {
  channel: NotificationChannel
  severityThreshold: NotificationSeverityThreshold
  target?: string
}

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const mockAlertsTimeline = [
  { date: '2026-06-05', alerts: 2 },
  { date: '2026-06-06', alerts: 0 },
  { date: '2026-06-07', alerts: 1 },
  { date: '2026-06-08', alerts: 3 },
  { date: '2026-06-09', alerts: 2 },
  { date: '2026-06-10', alerts: 4 },
  { date: '2026-06-11', alerts: 1 },
  { date: '2026-06-12', alerts: 0 },
  { date: '2026-06-13', alerts: 2 },
  { date: '2026-06-14', alerts: 3 },
  { date: '2026-06-15', alerts: 5 },
  { date: '2026-06-16', alerts: 2 },
  { date: '2026-06-17', alerts: 1 },
  { date: '2026-06-18', alerts: 0 },
  { date: '2026-06-19', alerts: 2 },
  { date: '2026-06-20', alerts: 3 },
  { date: '2026-06-21', alerts: 4 },
  { date: '2026-06-22', alerts: 2 },
  { date: '2026-06-23', alerts: 1 },
  { date: '2026-06-24', alerts: 0 },
  { date: '2026-06-25', alerts: 2 },
  { date: '2026-06-26', alerts: 3 },
  { date: '2026-06-27', alerts: 1 },
  { date: '2026-06-28', alerts: 2 },
  { date: '2026-06-29', alerts: 4 },
  { date: '2026-06-30', alerts: 3 },
  { date: '2026-07-01', alerts: 2 },
  { date: '2026-07-02', alerts: 1 },
  { date: '2026-07-03', alerts: 0 },
  { date: '2026-07-04', alerts: 3 },
]

export default function Dashboard(){
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [billingAccount, setBillingAccount] = useState<BillingAccount | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [alertsSummary, setAlertsSummary] = useState<AlertsSummary | null>(null)
  const [alertsError, setAlertsError] = useState<string | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<TenantNotificationSettings | null>(null)
  const [notificationSaving, setNotificationSaving] = useState(false)
  const [notificationSaveMessage, setNotificationSaveMessage] = useState<string | null>(null)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [notificationForm, setNotificationForm] = useState<TenantNotificationSettings>({
    channel: 'slack',
    severityThreshold: 'high',
    target: '',
  })
  const [token, setToken] = useState<string>('')
  const [tenantId, setTenantId] = useState<string>('1')
  const [loginState, setLoginState] = useState({ username: '', password: '', email: '' })
  const [subscribeState, setSubscribeState] = useState({ email: '', priceId: '' })
  const [tenantCreateState, setTenantCreateState] = useState({ name: '', domain: '', sector: '', contactEmail: '', priceId: '' })
  const [tenantCreateErrors, setTenantCreateErrors] = useState<{ name?: string; domain?: string; sector?: string; contactEmail?: string; form?: string }>({})
  const [createdTenant, setCreatedTenant] = useState<any | null>(null)
  const [socketAuthError, setSocketAuthError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)
  const severityChartRef = useRef<HTMLCanvasElement | null>(null)
  const severityChartInstance = useRef<Chart | null>(null)
  const timelineChartRef = useRef<HTMLCanvasElement | null>(null)
  const timelineChartInstance = useRef<Chart | null>(null)

  useEffect(()=>{
    if (!token) return

    async function fetchDashboardData(){
      try{
        await fetchMetrics()
        await fetchBillingAccount()
        await fetchInvoices()
        await fetchAlertsSummary()
        updateTimelineChart(mockAlertsTimeline)
      }catch(err){
        console.warn('Failed fetching dashboard data', err)
      }
    }

    fetchDashboardData()
    fetchNotificationSettings()
    const socket = io(`${BACKEND}/credit`, {
      transports: ['websocket'],
      auth: { token }
    })
    socketRef.current = socket

    socket.on('connect', ()=>console.log('Connected to backend WS', socket.id))
    socket.on('connect_error', (err)=>{
      console.warn('WebSocket connect error', err)
      setSocketAuthError(err.message)
    })
    socket.on('credit:metrics', (payload: any)=>{
      setMetrics(payload)
      updateChart(payload.stablecoinDistribution)
    })

    socket.on('credit:collateralized', ()=>{
      fetchMetrics()
      fetchBillingAccount()
    })

    socket.on('credit:riskLimit', ()=>{
      fetchMetrics()
    })

    return ()=>{
      socket.disconnect()
    }
  },[token])

  async function fetchMetrics(){
    const res = await fetch(`${BACKEND}/credit-smart-contract/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Metrics fetch failed')
    const data = await res.json()
    setMetrics(data)
    updateChart(data.stablecoinDistribution)
  }

  async function fetchBillingAccount(){
    const res = await fetch(`${BACKEND}/billing/account`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      setBillingAccount(null)
      return
    }
    const data = await res.json()
    setBillingAccount(data)
  }

  async function fetchAlertsSummary(){
    if (!token) return
    try {
      const res = await fetch(`${BACKEND}/compliance/alerts-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-test-tenant': tenantId
        }
      })
      if (!res.ok) {
        throw new Error('Alerts dashboard fetch failed')
      }
      const data = await res.json()
      setAlertsSummary(data)
      updateSeverityChart(data.bySeverity)
      setAlertsError(null)
    } catch (err: any) {
      console.warn('Failed fetching alerts summary', err)
      setAlertsSummary(null)
      setAlertsError(err?.message || 'Error fetching alerts summary')
    }
  }

  async function fetchNotificationSettings(){
    if (!token) return
    try {
      const res = await fetch(`${BACKEND}/iot/notifications/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      if (!res.ok) {
        throw new Error('Notification settings fetch failed')
      }
      const data = await res.json()
      const settings: TenantNotificationSettings = {
        channel: data?.channel ?? 'slack',
        severityThreshold: data?.severityThreshold ?? 'high',
        target: data?.target ?? '',
      }
      setNotificationSettings(settings)
      setNotificationForm(settings)
      setNotificationError(null)
    } catch (err: any) {
      console.warn('Failed fetching notification settings', err)
      setNotificationSettings(null)
      setNotificationError(err?.message || 'Error fetching notification settings')
    }
  }

  async function handleSaveNotificationSettings(event: React.FormEvent) {
    event.preventDefault()
    setNotificationSaving(true)
    setNotificationSaveMessage(null)
    try {
      const res = await fetch(`${BACKEND}/iot/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notificationForm),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Saving notification settings failed')
      }
      setNotificationSettings({
        channel: data.channel,
        severityThreshold: data.severityThreshold,
        target: data.target ?? '',
      })
      setNotificationSaveMessage('Configuración de notificaciones guardada.')

    } catch (err: any) {
      console.warn(err)
      setNotificationError(err?.message || 'Error guardando configuración de notificaciones')
    } finally {
      setNotificationSaving(false)
    }
  }

  async function fetchInvoices(){
    const res = await fetch(`${BACKEND}/billing/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      setInvoices([])
      return
    }
    const data = await res.json()
    setInvoices(data.data || data)
  }

  function updateChart(distribution: Record<string, number> = {}){
    const labels = Object.keys(distribution)
    const values = labels.map(l => distribution[l])
    if(!chartRef.current) return
    if(chartInstance.current){
      chartInstance.current.data.labels = labels
      ;(chartInstance.current.data.datasets[0].data as number[]) = values
      chartInstance.current.update()
      return
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Requested by stablecoin', data: values, backgroundColor: '#2b8cbe' }]
      },
      options: { responsive: true }
    })
  }

  function updateSeverityChart(severity: Record<string, number> = {}){
    const labels = ['critical', 'high', 'medium', 'low']
    const values = labels.map(label => severity[label] ?? 0)

    if (!severityChartRef.current) return

    if (severityChartInstance.current) {
      severityChartInstance.current.data.labels = labels
      ;(severityChartInstance.current.data.datasets[0].data as number[]) = values
      severityChartInstance.current.update()
      return
    }

    severityChartInstance.current = new Chart(severityChartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Alert severity',
          data: values,
          backgroundColor: ['#d62828', '#f77f00', '#fcbf49', '#52b788']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    })
  }

  function updateTimelineChart(data: { date: string; alerts: number }[]){
    const labels = data.map(item => item.date)
    const values = data.map(item => item.alerts)

    if (!timelineChartRef.current) return

    if (timelineChartInstance.current) {
      timelineChartInstance.current.data.labels = labels
      ;(timelineChartInstance.current.data.datasets[0].data as number[]) = values
      timelineChartInstance.current.update()
      return
    }

    timelineChartInstance.current = new Chart(timelineChartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Alertas por día',
          data: values,
          borderColor: 'rgba(220, 53, 69, 1)',
          backgroundColor: 'rgba(220, 53, 69, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(220, 53, 69, 1)',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Recurrencia de alertas (30 días)'
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { maxRotation: 90, minRotation: 45 }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Número de alertas'
            }
          }
        }
      }
    })
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    try{
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: Number(tenantId),
          username: loginState.username,
          password: loginState.password
        })
      })
      if (!res.ok) {
        throw new Error('Login failed')
      }
      const data = await res.json()
      setToken(data.access_token)
      localStorage.setItem('terra-link-token', data.access_token)
    }catch(err){
      console.warn(err)
      alert('Login failed')
    }
  }

  async function handleSubscribe(event: React.FormEvent){
    event.preventDefault()
    try{
      const res = await fetch(`${BACKEND}/billing/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: subscribeState.email, price_id: subscribeState.priceId })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Subscription failed')
      }
      alert('Subscription started: ' + data.status)
      fetchBillingAccount()
    }catch(err){
      console.warn(err)
      alert('Subscription error')
    }
  }

  function validateTenantCreate(){
    const errors: typeof tenantCreateErrors = {}
    const name = tenantCreateState.name.trim()
    const contactEmail = tenantCreateState.contactEmail.trim()

    if (!name) {
      errors.name = 'El nombre del tenant es obligatorio'
    } else if (name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!contactEmail) {
      errors.contactEmail = 'El email de contacto es obligatorio'
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(contactEmail)) {
        errors.contactEmail = 'El email de contacto no es válido'
      }
    }

    return errors
  }

  async function handleCreateTenant(event: React.FormEvent){
    event.preventDefault()
    const errors = validateTenantCreate()
    if (Object.keys(errors).length > 0) {
      setTenantCreateErrors(errors)
      return
    }
    setTenantCreateErrors({})
    try{
      const res = await fetch(`${BACKEND}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: tenantCreateState.name,
          domain: tenantCreateState.domain,
          sector: tenantCreateState.sector,
          contactEmail: tenantCreateState.contactEmail,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Tenant creation failed')
      }
      setCreatedTenant(data)
      alert('Tenant creado correctamente')
    }catch(err){
      console.warn(err)
      alert('Error creando tenant')
    }
  }

  async function handleCreateTenantAndSubscribe(event: React.FormEvent){
    event.preventDefault()
    const errors = validateTenantCreate()
    if (Object.keys(errors).length > 0) {
      setTenantCreateErrors(errors)
      return
    }
    setTenantCreateErrors({})

    try{
      const res = await fetch(`${BACKEND}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: tenantCreateState.name,
          domain: tenantCreateState.domain,
          sector: tenantCreateState.sector,
          contactEmail: tenantCreateState.contactEmail,
        })
      })
      const tenantData = await res.json()
      if (!res.ok) {
        throw new Error(tenantData.message || 'Tenant creation failed')
      }
      setCreatedTenant(tenantData)

      const subscribeRes = await fetch(`${BACKEND}/billing/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: tenantCreateState.contactEmail,
          price_id: tenantCreateState.priceId,
        })
      })
      const subscribeData = await subscribeRes.json()
      if (!subscribeRes.ok) {
        throw new Error(subscribeData.message || 'Subscription failed after tenant creation')
      }
      await fetchBillingAccount()
      alert('Tenant creado y suscripción iniciada correctamente')
    }catch(err){
      console.warn(err)
      alert('Error creando tenant o iniciando la suscripción')
    }
  }

  async function handleCancelSubscription(){
    if (!billingAccount?.stripe_subscription_id) {
      alert('No hay suscripción activa para cancelar.')
      return
    }

    try{
      const res = await fetch(`${BACKEND}/billing/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Cancelación fallida')
      }
      alert('Suscripción cancelada: ' + data.status)
      fetchBillingAccount()
    }catch(err){
      console.warn(err)
      alert('Error cancelando la suscripción')
    }
  }

  function handleLogout(){
    localStorage.removeItem('terra-link-token')
    setToken('')
    setCreatedTenant(null)
  }

  useEffect(()=>{
    const savedToken = localStorage.getItem('terra-link-token')
    if (savedToken) setToken(savedToken)
  }, [])

  return (
    <div className="dashboard">
      {!token ? (
        <section className="login-card">
          <h2>Administrador Tenant Login</h2>
          <form onSubmit={handleLogin}>
            <label>
              Tenant ID
              <input value={tenantId} onChange={e=>setTenantId(e.target.value)} />
            </label>
            <label>
              Usuario
              <input value={loginState.username} onChange={e=>setLoginState({...loginState, username: e.target.value})} />
            </label>
            <label>
              Contraseña
              <input type="password" value={loginState.password} onChange={e=>setLoginState({...loginState, password: e.target.value})} />
            </label>
            <button type="submit">Entrar</button>
          </form>
        </section>
      ) : (
        <>
          <section className="billing-status">
            <div className="dashboard-header">
              <h2>Estado de Facturación</h2>
              <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
            </div>
            {billingAccount ? (
              <div className="billing-card">
                <p><strong>Estado:</strong> {billingAccount.status}</p>
                <p><strong>Subscripción:</strong> {billingAccount.stripe_subscription_id || 'N/A'}</p>
                <p><strong>Cliente Stripe:</strong> {billingAccount.stripe_customer_id}</p>
                <p><strong>Precio:</strong> {billingAccount.price_id || 'N/A'}</p>
                <p><strong>Período hasta:</strong> {billingAccount.current_period_end ? new Date(billingAccount.current_period_end).toLocaleDateString() : 'N/A'}</p>
                {billingAccount.stripe_subscription_id ? (
                  <button type="button" className="cancel-subscription" onClick={handleCancelSubscription}>Cancelar suscripción</button>
                ) : null}
              </div>
            ) : (
              <div className="billing-card">
                <p>No hay cuenta de facturación registrada para este tenant.</p>
              </div>
            )}
            <form className="subscribe-form" onSubmit={handleSubscribe}>
              <h3>Iniciar suscripción</h3>
              <label>
                Email de facturación
                <input value={subscribeState.email} onChange={e=>setSubscribeState({...subscribeState, email: e.target.value})} />
              </label>
              <label>
                Price ID
                <input value={subscribeState.priceId} onChange={e=>setSubscribeState({...subscribeState, priceId: e.target.value})} placeholder="price_xxx" />
              </label>
              <button type="submit">Suscribirse</button>
            </form>
          </section>
          <section className="tenant-detail">
            <h2>Detalle del Tenant Actual</h2>
            <TenantDetail tenantId={tenantId} token={token} backend={BACKEND} />
          </section>
          <section className="notification-settings">
            <div className="card">
              <div className="dashboard-header">
                <h2>Configuración de notificaciones IoT</h2>
              </div>
              <form onSubmit={handleSaveNotificationSettings}>
                <label>
                  Canal
                  <select
                    value={notificationForm.channel}
                    onChange={e => setNotificationForm({ ...notificationForm, channel: e.target.value as NotificationChannel })}
                  >
                    <option value="slack">Slack</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="email">Email</option>
                  </select>
                </label>
                <label>
                  Umbral de severidad
                  <select
                    value={notificationForm.severityThreshold}
                    onChange={e => setNotificationForm({ ...notificationForm, severityThreshold: e.target.value as NotificationSeverityThreshold })}
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>
                </label>
                <label>
                  Objetivo / Webhook
                  <input
                    value={notificationForm.target}
                    onChange={e => setNotificationForm({ ...notificationForm, target: e.target.value })}
                    placeholder="URL del webhook o email"
                  />
                </label>
                <button type="submit" disabled={notificationSaving}>Guardar configuración</button>
              </form>
              {notificationSaveMessage ? <p className="success">{notificationSaveMessage}</p> : null}
              {notificationError ? <p className="error">{notificationError}</p> : null}
              {notificationSettings ? (
                <div className="notification-summary">
                  <p><strong>Canal activo:</strong> {notificationSettings.channel}</p>
                  <p><strong>Umbral activo:</strong> {notificationSettings.severityThreshold}</p>
                  <p><strong>Destino:</strong> {notificationSettings.target || 'No configurado'}</p>
                </div>
              ) : <p>No hay configuración de notificaciones guardada.</p>}
            </div>
          </section>
          <NotificationLogPanel token={token} backendUrl={BACKEND} />
          <section className="tenant-onboarding">
            <h2>Onboarding de Tenant</h2>
            <form onSubmit={handleCreateTenant}>
              <label>
                Nombre del Tenant
                <input value={tenantCreateState.name} onChange={e=>setTenantCreateState({...tenantCreateState, name: e.target.value})} />
                {tenantCreateErrors.name ? <p className="field-error">{tenantCreateErrors.name}</p> : null}
              </label>
              <label>
                Dominio del Tenant
                <input value={tenantCreateState.domain} onChange={e=>setTenantCreateState({...tenantCreateState, domain: e.target.value})} placeholder="example.tenant.com" />
              </label>
              <label>
                Sector
                <input value={tenantCreateState.sector} onChange={e=>setTenantCreateState({...tenantCreateState, sector: e.target.value})} placeholder="Agricultura, Financiero..." />
              </label>
              <label>
                Email de contacto
                <input type="email" value={tenantCreateState.contactEmail} onChange={e=>setTenantCreateState({...tenantCreateState, contactEmail: e.target.value})} placeholder="admin@example.com" />
                {tenantCreateErrors.contactEmail ? <p className="field-error">{tenantCreateErrors.contactEmail}</p> : null}
              </label>
              <label>
                Price ID
                <input value={tenantCreateState.priceId} onChange={e=>setTenantCreateState({...tenantCreateState, priceId: e.target.value})} placeholder="price_xxx" />
              </label>
              <div className="tenant-actions">
                <button type="submit">Crear Tenant</button>
                <button type="button" onClick={handleCreateTenantAndSubscribe}>Crear y suscribirse</button>
              </div>
              {tenantCreateErrors.form ? <p className="field-error">{tenantCreateErrors.form}</p> : null}
            </form>
            {createdTenant ? (
              <div className="tenant-result">
                <h4>Tenant creado</h4>
                <p>ID: {createdTenant.id}</p>
                <p>Nombre: {createdTenant.name}</p>
                <p>Dominio: {createdTenant.domain || 'N/A'}</p>
                <p>Sector: {createdTenant.sector || 'N/A'}</p>
                <p>Email de contacto: {createdTenant.contactEmail || 'N/A'}</p>
              </div>
            ) : null}
          </section>

          <section className="metrics">
            <div className="card">
              <h3>Total Collateralized Value</h3>
              <p>{metrics ? metrics.totalCollateralizedValue : '—'}</p>
            </div>
            <div className="card">
              <h3>Total Requested</h3>
              <p>{metrics ? metrics.totalRequested : '—'}</p>
            </div>
            <div className="card">
              <h3>Active Proposals</h3>
              <p>{metrics ? metrics.activeProposals : '—'}</p>
            </div>
            <div className="card">
              <h3>Liquidity Coverage</h3>
              <p>{metrics ? (metrics.liquidityCoverage * 100).toFixed(2) + '%' : '—'}</p>
            </div>
          </section>

          <section className="alerts-dashboard">
            <div className="card">
              <div className="dashboard-header">
                <h2>Dashboard de Alertas ESG</h2>
              </div>
              {alertsSummary ? (
                <>
                  <p>{alertsSummary.summaryText}</p>
                  <div className="alert-stats-row">
                    <span><strong>Total no resueltas:</strong> {alertsSummary.totalUnresolved}</span>
                    <span><strong>Alertas 30d:</strong> {alertsSummary.recentCount30d}</span>
                    <span><strong>Recurrencias:</strong> {alertsSummary.recurringTypes.length > 0 ? alertsSummary.recurringTypes.join(', ') : 'Ninguna'}</span>
                  </div>
                </>
              ) : alertsError ? (
                <p className="error">{alertsError}</p>
              ) : (
                <p>Cargando métricas de alertas...</p>
              )}
            </div>
            <div className="card">
              <h3>Severidad de alertas</h3>
              <canvas ref={el => severityChartRef.current = el}></canvas>
            </div>
            <div className="card">
              <h3>Distribución por tipo</h3>
              {alertsSummary ? (
                <ul>
                  {Object.entries(alertsSummary.byType).map(([type, count]) => (
                    <li key={type}>{type}: {count}</li>
                  ))}
                </ul>
              ) : (
                <p>Cargando distribución...</p>
              )}
            </div>
            <div className="card">
              <h3>Recurrencia de alertas (30 días)</h3>
              <canvas ref={el => timelineChartRef.current = el}></canvas>
            </div>
          </section>

          <section className="billing-invoices">
            <h2>Facturas recientes</h2>
            {invoices.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Estado</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.id}</td>
                      <td>{invoice.status}</td>
                      <td>{invoice.amount_paid / 100} {invoice.currency.toUpperCase()}</td>
                      <td>{new Date(invoice.created * 1000).toLocaleDateString()}</td>
                      <td>{invoice.hosted_invoice_url ? <a href={invoice.hosted_invoice_url} target="_blank">Ver</a> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay facturas recientes.</p>
            )}
          </section>

          <section className="chart">
            <canvas ref={el=>chartRef.current = el}></canvas>
          </section>

          {socketAuthError ? <p className="error">WebSocket error: {socketAuthError}</p> : null}
        </>
      )}
    </div>
  )
}
