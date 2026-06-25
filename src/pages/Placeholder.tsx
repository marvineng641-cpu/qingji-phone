import React from 'react'
import BackButton from '../components/BackButton'

interface PlaceholderProps {
  title: string
  description: string
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description }) => {
  return (
    <div style={{ padding: '60px 16px 16px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>{title}</h1>
      <p style={{ fontSize: '14px', color: '#666' }}>{description}</p>
    </div>
  )
}

export default Placeholder
