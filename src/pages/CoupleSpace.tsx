import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface CoupleSpace {
  id?: number
  characterId1: number
  characterId2: number
  loveDays: number
  startDate: number
  level: number
  points: number
  avatar1: string
  avatar2: string
  name1: string
  name2: string
}

const CoupleSpace: React.FC = () => {
  const navigate = useNavigate()
  const [coupleSpace, setCoupleSpace] = useState<CoupleSpace | null>(null)
  const [characters, setCharacters] = useState<any[]>([])
  const [showSelectModal, setShowSelectModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<'1' | '2' | null>(null)
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    loadCoupleSpace()
    loadCharacters()
    loadFavorites()
  }, [])

  const loadCoupleSpace = async () => {
    try {
      const spaces = await db.coupleSpaces.toArray()
      if (spaces.length > 0) {
        setCoupleSpace(spaces[0])
      }
    } catch (error) {
      console.error('加载情侣空间失败:', error)
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

  const loadFavorites = async () => {
    try {
      const favs = await db.favorites.toArray()
      setFavorites(favs)
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  }

  const handleSelectCharacter = async (characterId: number) => {
    if (!selectedSlot || !coupleSpace) return

    const updated = { ...coupleSpace }
    if (selectedSlot === '1') {
      updated.characterId1 = characterId
      const char = characters.find(c => c.id === characterId)
      if (char) {
        updated.avatar1 = char.avatar
        updated.name1 = char.name
      }
    } else {
      updated.characterId2 = characterId
      const char = characters.find(c => c.id === characterId)
      if (char) {
        updated.avatar2 = char.avatar
        updated.name2 = char.name
      }
    }

    await db.coupleSpaces.update(coupleSpace.id!, updated)
    setCoupleSpace(updated)
    setShowSelectModal(false)
    setSelectedSlot(null)
  }

  const handleCreateCoupleSpace = async () => {
    if (characters.length < 2) {
      alert('需要至少两个角色才能创建情侣空间')
      return
    }

    const newSpace: CoupleSpace = {
      characterId1: characters[0].id,
      characterId2: characters[1].id,
      loveDays: 0,
      startDate: Date.now(),
      level: 1,
      points: 0,
      avatar1: characters[0].avatar,
      avatar2: characters[1].avatar,
      name1: characters[0].name,
      name2: characters[1].name
    }

    await db.coupleSpaces.add(newSpace)
    await loadCoupleSpace()
  }

  const calculateLoveDays = () => {
    if (!coupleSpace) return 0
    const now = Date.now()
    const diff = now - coupleSpace.startDate
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const loveDays = coupleSpace ? calculateLoveDays() : 0

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      {!coupleSpace ? (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💕</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>创建情侣空间</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            选择两个角色开始你们的情侣之旅
          </p>
          <button
            onClick={handleCreateCoupleSpace}
            style={{
              padding: '12px 24px',
              background: '#ff3b30',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            创建
          </button>
        </div>
      ) : (
        <>
          {/* 头部 - 双方头像 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div
                onClick={() => {
                  setSelectedSlot('1')
                  setShowSelectModal(true)
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  margin: '0 auto 8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                }}
              >
                {coupleSpace.avatar1}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{coupleSpace.name1}</div>
            </div>

            <div style={{ fontSize: '32px', color: '#ff3b30' }}>❤</div>

            <div style={{ textAlign: 'center' }}>
              <div
                onClick={() => {
                  setSelectedSlot('2')
                  setShowSelectModal(true)
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  margin: '0 auto 8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                {coupleSpace.avatar2}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{coupleSpace.name2}</div>
            </div>
          </div>

          {/* 爱心天数 */}
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              {loveDays}
            </div>
            <div style={{ fontSize: '16px', color: 'white', opacity: 0.9 }}>
              相爱天数
            </div>
          </div>

          {/* 等级和积分 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                Lv.{coupleSpace.level}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>等级</div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#ff9500', marginBottom: '4px' }}>
                {coupleSpace.points}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>积分</div>
            </div>
          </div>

          {/* 收藏 */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              共同收藏 ({favorites.length})
            </h3>
            {favorites.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#666' }}>还没有收藏</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {favorites.slice(0, 6).map((_fav: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: '1',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}
                  >
                    ⭐
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 任务入口 */}
          <button
            onClick={() => navigate('/coupletasks')}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            💕 情侣任务
          </button>

          {/* 子页面入口 */}
          <button
            onClick={() => navigate('/couplesubpages')}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '16px',
              background: 'linear-gradient(135deg, #ff9500 0%, #ff6b6b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 149, 0, 0.3)'
            }}
          >
            📝 小纸条 · 提问 · 日记 · 宠物 · 许愿
          </button>
        </>
      )}

      {/* 角色选择弹窗 */}
      {showSelectModal && (
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
            maxWidth: '300px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              选择角色 {selectedSlot === '1' ? '(第一位)' : '(第二位)'}
            </h3>
            {characters.map(char => (
              <div
                key={char.id}
                onClick={() => handleSelectCharacter(char.id)}
                style={{
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0'
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
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{char.name}</div>
              </div>
            ))}
            <button
              onClick={() => {
                setShowSelectModal(false)
                setSelectedSlot(null)
              }}
              style={{
                width: '100%',
                marginTop: '16px',
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
      )}
    </div>
  )
}

export default CoupleSpace
