import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Order {
  id?: number
  type: 'delivery' | 'gift'
  restaurant: string
  items: string[]
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  recipientId?: number
  timestamp: number
}

const Waimai: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [restaurant, setRestaurant] = useState('')
  const [items, setItems] = useState('')
  const [total, setTotal] = useState(0)
  const [orderType, setOrderType] = useState<'delivery' | 'gift'>('delivery')
  const [selectedRecipient, setSelectedRecipient] = useState<number | undefined>()
  const [characters, setCharacters] = useState<any[]>([])

  useEffect(() => {
    loadOrders()
    loadCharacters()
  }, [])

  const loadOrders = async () => {
    try {
      const orderData = await db.orders.toArray()
      setOrders(orderData.sort((a: any, b: any) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error('加载订单失败:', error)
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

  const handleCreateOrder = async () => {
    if (!restaurant.trim() || !items.trim()) return

    const order: Order = {
      type: orderType,
      restaurant,
      items: items.split(',').map(i => i.trim()).filter(i => i),
      total,
      status: 'pending',
      recipientId: orderType === 'gift' ? selectedRecipient : undefined,
      timestamp: Date.now()
    }

    await db.orders.add(order)
    await loadOrders()
    setRestaurant('')
    setItems('')
    setTotal(0)
    setSelectedRecipient(undefined)
    setShowOrderModal(false)
  }

  const handleCompleteOrder = async (order: Order) => {
    if (!order.id) return
    await db.orders.update(order.id, { status: 'completed' })
    await loadOrders()
  }

  const handleCancelOrder = async (order: Order) => {
    if (!order.id) return
    await db.orders.update(order.id, { status: 'cancelled' })
    await loadOrders()
  }

  const handleRequestPayment = async (order: Order) => {
    if (!order.recipientId) return
    alert(`已向 ${characters.find(c => c.id === order.recipientId)?.name} 申请代付`)
  }

  const restaurants = [
    { name: '麦当劳', icon: '🍔', color: '#ffbc0d' },
    { name: '肯德基', icon: '🍗', color: '#e4002b' },
    { name: '星巴克', icon: '☕', color: '#00704a' },
    { name: '喜茶', icon: '🧋', color: '#a8e6cf' },
    { name: '瑞幸咖啡', icon: '☕', color: '#0022ab' },
    { name: '必胜客', icon: '🍕', color: '#e4002b' }
  ]

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      {/* 头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>晴团外卖</h1>
        <button
          onClick={() => setShowOrderModal(true)}
          style={{
            padding: '8px 16px',
            background: '#ffbc0d',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          + 点餐
        </button>
      </div>

      {/* 餐厅列表 */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>热门餐厅</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {restaurants.map(r => (
            <div
              key={r.name}
              onClick={() => {
                setRestaurant(r.name)
                setShowOrderModal(true)
              }}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{r.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{r.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 订单列表 */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>我的订单</h2>
        {orders.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: '#666',
            background: 'white',
            borderRadius: '12px'
          }}>
            <p>还没有订单</p>
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{order.restaurant}</div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: order.status === 'pending' ? '#fff3cd' : order.status === 'completed' ? '#d4edda' : '#f8d7da',
                  color: order.status === 'pending' ? '#856404' : order.status === 'completed' ? '#155724' : '#721c24'
                }}>
                  {order.status === 'pending' ? '待处理' : order.status === 'completed' ? '已完成' : '已取消'}
                </div>
              </div>

              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                {order.items.join(', ')}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {order.type === 'gift' ? '🎁 送礼' : '🛵 外卖'}
                  {order.recipientId && (
                    <span style={{ marginLeft: '8px' }}>
                      给 {characters.find(c => c.id === order.recipientId)?.name}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffbc0d' }}>
                  ¥{order.total}
                </div>
              </div>

              {order.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {order.type === 'gift' && order.recipientId && (
                    <button
                      onClick={() => handleRequestPayment(order)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#007aff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      申请代付
                    </button>
                  )}
                  <button
                    onClick={() => handleCompleteOrder(order)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    完成
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 点餐弹窗 */}
      {showOrderModal && (
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>点餐</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>订单类型</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setOrderType('delivery')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: orderType === 'delivery' ? '#ffbc0d' : '#f5f5f5',
                    color: orderType === 'delivery' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🛵 外卖
                </button>
                <button
                  onClick={() => setOrderType('gift')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: orderType === 'gift' ? '#ffbc0d' : '#f5f5f5',
                    color: orderType === 'gift' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🎁 送礼
                </button>
              </div>
            </div>

            {orderType === 'gift' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>选择收礼人</label>
                <select
                  value={selectedRecipient || ''}
                  onChange={(e) => setSelectedRecipient(e.target.value ? Number(e.target.value) : undefined)}
                  style={{
                    width: '100%',
                    padding: '8px',
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
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>餐厅</label>
              <input
                type="text"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                placeholder="输入餐厅名称..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>菜品 (用逗号分隔)</label>
              <input
                type="text"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                placeholder="例如: 汉堡, 可乐, 薯条"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>总价 (元)</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                min="0"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCreateOrder}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ffbc0d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                提交订单
              </button>
              <button
                onClick={() => {
                  setShowOrderModal(false)
                  setRestaurant('')
                  setItems('')
                  setTotal(0)
                  setSelectedRecipient(undefined)
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

export default Waimai
