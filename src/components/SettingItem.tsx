import React from 'react'
import { SettingItem } from '../registry/settingsSchema'

interface SettingItemComponentProps {
  item: SettingItem
  value: any
  onChange: (value: any) => void
}

const SettingItemComponent: React.FC<SettingItemComponentProps> = ({ item, value, onChange }) => {
  switch (item.type) {
    case 'toggle':
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</div>
            {item.description && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{item.description}</div>
            )}
          </div>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '50px',
            height: '26px'
          }}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              style={{
                opacity: 0,
                width: 0,
                height: 0
              }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: value ? '#007aff' : '#ccc',
              transition: '0.3s',
              borderRadius: '26px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '20px',
                width: '20px',
                left: value ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>
      )

    case 'select':
      return (
        <div style={{
          padding: '12px 0',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{item.label}</div>
          {item.description && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{item.description}</div>
          )}
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            {item.options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      )

    case 'input':
      return (
        <div style={{
          padding: '12px 0',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{item.label}</div>
          {item.description && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{item.description}</div>
          )}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={item.description}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      )

    case 'number':
      return (
        <div style={{
          padding: '12px 0',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{item.label}</div>
          {item.description && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{item.description}</div>
          )}
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={item.min}
            max={item.max}
            step={item.step}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      )

    default:
      return null
  }
}

export default SettingItemComponent
