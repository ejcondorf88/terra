import React, { useEffect, useState } from 'react'

type NotificationLog = {
  id: string
  channel: string
  severity: string
  target: string
  success: boolean
  errorMessage?: string
  sentAt: string
}

type Props = {
  token: string
  backendUrl: string
}

export default function NotificationLogPanel({ token, backendUrl }: Props) {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`${backendUrl}/iot/notifications/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Error loading notification logs')
        const data = await res.json()
        setLogs(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching notification logs', err)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchLogs()
    }
  }, [token, backendUrl])

  const filteredLogs = logs.filter((log) => {
    const severityMatch = severityFilter === 'all' || log.severity === severityFilter
    const channelMatch = channelFilter === 'all' || log.channel === channelFilter
    return severityMatch && channelMatch
  })

  const exportToExcel = () => {
    const rows = filteredLogs.map((log) => [
      new Date(log.sentAt).toLocaleString(),
      log.channel,
      log.severity,
      log.target,
      log.success ? 'Enviado' : `Falló (${log.errorMessage || ''})`,
    ])

    const csvContent = [
      ['Fecha', 'Canal', 'Severidad', 'Destino', 'Estado'],
      ...rows,
    ]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'notification_logs.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return <p>Cargando historial de notificaciones...</p>

  return (
    <section className="notification-log-panel" style={{ marginTop: '2rem' }}>
      <h3>Historial de notificaciones</h3>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <label>
          Severidad:
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">Todas</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Canal:
          <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
            <option value="all">Todos</option>
            <option value="slack">Slack</option>
            <option value="teams">Teams</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </label>

        <button type="button" onClick={exportToExcel}>Exportar Excel</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Fecha</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Canal</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Severidad</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Destino</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '0.5rem' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td style={{ padding: '0.5rem' }}>{new Date(log.sentAt).toLocaleString()}</td>
              <td style={{ padding: '0.5rem' }}>{log.channel}</td>
              <td style={{ padding: '0.5rem' }}>{log.severity}</td>
              <td style={{ padding: '0.5rem' }}>{log.target}</td>
              <td style={{ padding: '0.5rem' }}>{log.success ? '✔️ Enviado' : `❌ Falló (${log.errorMessage || ''})`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
