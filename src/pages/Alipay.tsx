import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface WalletData {
  id?: number
  balance: number
  fundBalance: number
  fundProfit: number
  familyCardBalance: number
  familyCardLimit: number
  linkedCharacters: number[]
}

const Alipay: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferAmount, setTransferAmount] = useState(0)
  const [transferType, setTransferType] = useState<'balance' | 'fund' | 'family'>('balance')
  const [characters, setCharacters] = useState<any[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<number | undefined>()

  useEffect(() => {
    loadWalletData()
    loadCharacters()
  }, [])

  const loadWalletData = async () => {
    try {
      const data = await db.wallet.toArray()
      if (data.length === 0) {
        const initialData: WalletData = {
          balance: 10000,
          fundBalance: 50000,
          fundProfit: 2500,
          familyCardBalance: 3000,
          familyCardLimit: 10000,
          linkedCharacters: []
        }
        await db.wallet.add(initialData)
        setWalletData(initialData)
      } else {
        setWalletData(data[0])
      }
    } catch (error) {
      console.error('加载钱包数据失败:', error)
    }
  }

  const loadCharacters = async () => {
    try {
      const chars = await db.characters.toArray()
      setCharacters(chars)
    } catch (error) {
      console.error('加载角色失败:', error)
    }
  }

  const handleTransfer = async () => {
    if (!walletData || !walletData.id || transferAmount <= 0) return

    let updated = { ...walletData }

    if (transferType === 'balance') {
      updated.balance -= transferAmount
    } else if (transferType === 'fund') {
      updated.fundBalance -= transferAmount
    } else if (transferType === 'family') {
      updated.familyCardBalance -= transferAmount
    }

    await db.wallet.update(walletData.id, updated)
    setWalletData(updated)
    setShowTransferModal(false)
    setTransferAmount(0)
  }

  const handleLinkCharacter = async (characterId: number) => {
    if (!walletData || !walletData.id) return

    const linked = walletData.linkedCharacters || []
    if (linked.includes(characterId)) {
      // 取消绑定
      const updated = { ...walletData, linkedCharacters: linked.filter(id => id !== characterId) }
      await db.wallet.update(walletData.id, updated)
      setWalletData(updated)
    } else {
      // 绑定
      const updated = { ...walletData, linkedCharacters: [...linked, characterId] }
      await db.wallet.update(walletData.id, updated)
      setWalletData(updated)
    }
  }

  if (!walletData) {
    return (
      <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
        <BackButton />
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      {/* 头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        color: 'white'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>账户余额</div>
        <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
          ¥{walletData.balance.toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              setTransferType('balance')
              setShowTransferModal(true)
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            转账
          </button>
          <button
            onClick={() => {
              const amount = prompt('充值金额:')
              if (amount && !isNaN(Number(amount))) {
                const updated = { ...walletData, balance: walletData.balance + Number(amount) }
                db.wallet.update(walletData.id!, updated)
                setWalletData(updated)
              }
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            充值
          </button>
        </div>
      </div>

      {/* 基金 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>基金</div>
          <div style={{
            padding: '4px 8px',
            background: walletData.fundProfit >= 0 ? '#e6f7ff' : '#fff1f0',
            color: walletData.fundProfit >= 0 ? '#1677ff' : '#ff4d4f',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {walletData.fundProfit >= 0 ? '+' : ''}{walletData.fundProfit.toFixed(2)}
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: '600', color: '#1677ff', marginBottom: '12px' }}>
          ¥{walletData.fundBalance.toLocaleString()}
        </div>
        <button
          onClick={() => {
            setTransferType('fund')
            setShowTransferModal(true)
          }}
          style={{
            width: '100%',
            padding: '10px',
            background: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          赎回
        </button>
      </div>

      {/* 亲属卡 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>亲属卡</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>可用额度</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#ff4d4f' }}>
              ¥{walletData.familyCardBalance.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>总额度</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>
              ¥{walletData.familyCardLimit.toLocaleString()}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setTransferType('family')
            setShowTransferModal(true)
          }}
          style={{
            width: '100%',
            padding: '10px',
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          使用亲属卡
        </button>
      </div>

      {/* 绑定角色 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>绑定角色（余额联动）</div>
        {characters.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#666' }}>暂无角色</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {characters.map(char => (
              <div
                key={char.id}
                onClick={() => handleLinkCharacter(char.id!)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: (walletData.linkedCharacters || []).includes(char.id!) ? '#e6f7ff' : '#f5f5f5',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e5e5e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {char.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{char.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {(walletData.linkedCharacters || []).includes(char.id!) ? '已绑定' : '未绑定'}
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: (walletData.linkedCharacters || []).includes(char.id!) ? '#1677ff' : '#d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {(walletData.linkedCharacters || []).includes(char.id!) ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 转账弹窗 */}
      {showTransferModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            width: '80%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              {transferType === 'balance' ? '余额转账' : transferType === 'fund' ? '基金赎回' : '使用亲属卡'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>金额</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                min="0"
                max={transferType === 'balance' ? walletData.balance : transferType === 'fund' ? walletData.fundBalance : walletData.familyCardBalance}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>转给</label>
              <select
                value={selectedCharacter || ''}
                onChange={(e) => setSelectedCharacter(e.target.value ? Number(e.target.value) : undefined)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">选择角色</option>
                {characters.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleTransfer}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#1677ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                确认
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false)
                  setTransferAmount(0)
                  setSelectedCharacter(undefined)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#e5e5e5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Alipay
