import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageStore } from '../store/pageStore'

interface BackButtonProps {
  className?: string
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate()
  const { popPage } = usePageStore()

  const handleBack = () => {
    const previousPage = popPage()
    if (previousPage) {
      navigate(previousPage)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`back-button ${className}`}
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      ← 返回
    </button>
  )
}

export default BackButton
