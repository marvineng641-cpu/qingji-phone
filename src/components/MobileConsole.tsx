import React, { useEffect, useState } from 'react'
import BackButton from './BackButton'

interface ConsoleEntry {
  id: number
  timestamp: string
  type: 'log' | 'warn' | 'error' | 'info'
  message: string
  data?: any
}

const MobileConsole: React.FC = () => {
  const [entries, setEntries] = useState<ConsoleEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error' | 'info'>('all')

  useEffect(() => {
    // 捕获 console.*
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error
    const originalInfo = console.info

    const addEntry = (type: ConsoleEntry['type'], message: string, data?: any) => {
      const entry: ConsoleEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
        data
      }
      setEntries(prev => [...prev.slice(-99), entry]) // 保留最近 100 条
    }

    console.log = (...args) => {
      originalLog(...args)
      addEntry('log', args.map(a => String(a)).join(' '), args)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addEntry('warn', args.map(a => String(a)).join(' '), args)
    }

    console.error = (...args) => {
      originalError(...args)
      addEntry('error', args.map(a => String(a)).join(' '), args)
    }

    console.info = (...args) => {
      originalInfo(...args)
      addEntry('info', args.map(a => String(a)).join(' '), args)
    }

    // 捕获 window.onerror
    const handleError = (event: ErrorEvent) => {
      addEntry('error', `${event.message} (${event.filename}:${event.lineno}:${event.colno})`, event.error?.stack)
    }
    window.addEventListener('error', handleError)

    // 捕获 unhandledrejection
    const handleRejection = (event: PromiseRejectionEvent) => {
      addEntry('error', `Unhandled Promise Rejection: ${event.reason}`, event)
    }
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
      console.info = originalInfo
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.type === filter)

  const getEntryColor = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'error': return '#ff4444'
      case 'warn': return '#ffbb33'
      case 'info': return '#33b5e5'
      default: return '#333'
    }
  }

  const clearConsole = () => {
    setEntries([])
  }

  return (
    <div style={{ padding: '60px 16px 16px', height: '100vh', overflow: 'auto', background: '#1e1e1e' }}>
      <BackButton />
      
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(['all', 'log', 'warn', 'error', 'info'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '6px 12px',
              background: filter === type ? '#007aff' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
        <button
          onClick={clearConsole}
          style={{
            padding: '6px 12px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          清空
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredEntries.map(entry => (
          <div
            key={entry.id}
            style={{
              padding: '8px',
              background: '#2d2d2d',
              borderRadius: '4px',
              borderLeft: `3px solid ${getEntryColor(entry.type)}`
            }}
          >
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
              {entry.timestamp} [{entry.type.toUpperCase()}]
            </div>
            <div style={{ color: getEntryColor(entry.type), fontSize: '12px', wordBreak: 'break-word' }}>
              {entry.message}
            </div>
            {entry.data && (
              <pre style={{ marginTop: '4px', fontSize: '10px', color: '#aaa', overflow: 'auto' }}>
                {JSON.stringify(entry.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileConsole
