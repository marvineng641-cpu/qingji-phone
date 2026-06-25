import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Product {
  id?: number
  name: string
  price: number
  image: string
  category: string
}

interface Purchase {
  id?: number
  productId: number
  type: 'self' | 'gift'
  recipientId?: number
  status: 'pending' | 'completed'
  timestamp: number
}

const Taobao: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [purchaseType, setPurchaseType] = useState<'self' | 'gift'>('self')
  const [selectedRecipient, setSelectedRecipient] = useState<number | undefined>()
  const [characters, setCharacters] = useState<any[]>([])

  useEffect(() => {
    loadProducts()
    loadPurchases()
    loadCharacters()
  }, [])

  const loadProducts = async () => {
    try {
      const productData = await db.products.toArray()
      if (productData.length === 0) {
        // 初始化示例商品
        const sampleProducts: Product[] = [
          { name: 'iPhone 15 Pro', price: 7999, image: '📱', category: '数码' },
          { name: 'MacBook Pro', price: 12999, image: '💻', category: '数码' },
          { name: 'AirPods Pro', price: 1899, image: '🎧', category: '数码' },
          { name: '智能手表', price: 2999, image: '⌚', category: '数码' },
          { name: '时尚连衣裙', price: 399, image: '👗', category: '服饰' },
          { name: '运动鞋', price: 599, image: '👟', category: '服饰' },
          { name: '护肤品套装', price: 899, image: '💄', category: '美妆' },
          { name: '香水', price: 699, image: '🌸', category: '美妆' }
        ]
        for (const p of sampleProducts) {
          await db.products.add(p)
        }
        setProducts(sampleProducts)
      } else {
        setProducts(productData)
      }
    } catch (error) {
      console.error('加载商品失败:', error)
    }
  }

  const loadPurchases = async () => {
    try {
      const purchaseData = await db.orders.where({ type: 'purchase' }).toArray()
      setPurchases(purchaseData.sort((a: any, b: any) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error('加载购买记录失败:', error)
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

  const handlePurchase = async () => {
    if (!selectedProduct) return

    const purchase: Purchase = {
      productId: selectedProduct.id!,
      type: purchaseType,
      recipientId: purchaseType === 'gift' ? selectedRecipient : undefined,
      status: 'pending',
      timestamp: Date.now()
    }

    await db.orders.add({ ...purchase, type: 'purchase' })
    await loadPurchases()
    setShowPurchaseModal(false)
    setSelectedProduct(null)
    setSelectedRecipient(undefined)
  }

  const handleCompletePurchase = async (purchase: Purchase) => {
    if (!purchase.id) return
    await db.orders.update(purchase.id, { status: 'completed' })
    await loadPurchases()
  }

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
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>晴宝</h1>
        <div style={{ fontSize: '14px', color: '#666' }}>
          共 {products.length} 件商品
        </div>
      </div>

      {/* 搜索框 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="搜索商品..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e5e5',
            borderRadius: '24px',
            fontSize: '14px',
            background: 'white'
          }}
        />
      </div>

      {/* 分类标签 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflow: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px',
        scrollbarWidth: 'none'
      }}>
        {['全部', '数码', '服饰', '美妆', '家居', '食品'].map(category => (
          <button
            key={category}
            style={{
              padding: '8px 16px',
              background: '#ff5000',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 商品列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {products.map(product => (
          <div
            key={product.id}
            onClick={() => {
              setSelectedProduct(product)
              setShowPurchaseModal(true)
            }}
            style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              aspectRatio: '1',
              background: '#f8f8f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              {product.image}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {product.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ff5000' }}>
                  ¥{product.price}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedProduct(product)
                    setShowPurchaseModal(true)
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#ff5000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  购买
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 购买记录 */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>购买记录</h2>
        {purchases.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: '#666',
            background: 'white',
            borderRadius: '8px'
          }}>
            <p>还没有购买记录</p>
          </div>
        ) : (
          purchases.map(purchase => {
            const product = products.find(p => p.id === purchase.productId)
            return (
              <div
                key={purchase.id}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  background: '#f8f8f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  {product?.image || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {product?.name || '未知商品'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    {purchase.type === 'gift' ? '🎁 送礼' : '🛒 自购'}
                    {purchase.recipientId && (
                      <span style={{ marginLeft: '8px' }}>
                        给 {characters.find(c => c.id === purchase.recipientId)?.name}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff5000' }}>
                    ¥{product?.price || 0}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginBottom: '8px',
                    background: purchase.status === 'pending' ? '#fff3cd' : '#d4edda',
                    color: purchase.status === 'pending' ? '#856404' : '#155724'
                  }}>
                    {purchase.status === 'pending' ? '待发货' : '已完成'}
                  </div>
                  {purchase.status === 'pending' && (
                    <button
                      onClick={() => handleCompletePurchase(purchase)}
                      style={{
                        padding: '6px 12px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      确认收货
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 购买弹窗 */}
      {showPurchaseModal && selectedProduct && (
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>购买商品</h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                background: '#f8f8f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                {selectedProduct.image}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  {selectedProduct.name}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#ff5000' }}>
                  ¥{selectedProduct.price}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>购买方式</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPurchaseType('self')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: purchaseType === 'self' ? '#ff5000' : '#f5f5f5',
                    color: purchaseType === 'self' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🛒 自购
                </button>
                <button
                  onClick={() => setPurchaseType('gift')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: purchaseType === 'gift' ? '#ff5000' : '#f5f5f5',
                    color: purchaseType === 'gift' ? 'white' : '#666',
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

            {purchaseType === 'gift' && (
              <div style={{ marginBottom: '16px' }}>
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

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handlePurchase}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ff5000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                确认购买
              </button>
              <button
                onClick={() => {
                  setShowPurchaseModal(false)
                  setSelectedProduct(null)
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

export default Taobao
