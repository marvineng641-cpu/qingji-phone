import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Post {
  id?: number
  characterId?: number
  content: string
  images?: string[]
  timestamp: number
  type: 'text' | 'image' | 'mixed'
  likes: number
  isLiked: boolean
}

interface Comment {
  id?: number
  postId: number
  characterId?: number
  content: string
  timestamp: number
}

const QQDynamic: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [showCommentsForId, setShowCommentsForId] = useState<number | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const postData = await db.posts.toArray()
      setPosts(postData.sort((a: any, b: any) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error('加载动态失败:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    const post: Post = {
      characterId: undefined, // 用户发布
      content: newPostContent,
      timestamp: Date.now(),
      type: 'text',
      likes: 0,
      isLiked: false
    }

    await db.posts.add(post)
    await loadPosts()
    setNewPostContent('')
    setShowCreateModal(false)
  }

  const handleLike = async (post: Post) => {
    const updated = { ...post, likes: post.likes + 1, isLiked: !post.isLiked }
    await db.posts.update(post.id!, updated)
    await loadPosts()
  }

  const handleLoadComments = async (postId: number) => {
    try {
      const commentData = await db.comments.where({ postId }).toArray()
      setComments(commentData.sort((a: any, b: any) => a.timestamp - b.timestamp))
      setShowCommentsForId(postId)
    } catch (error) {
      console.error('加载评论失败:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || showCommentsForId === null) return

    const comment: Comment = {
      postId: showCommentsForId,
      characterId: undefined,
      content: newComment,
      timestamp: Date.now()
    }

    await db.comments.add(comment)
    await handleLoadComments(showCommentsForId)
    setNewComment('')
  }

  const handleFavorite = async (post: Post) => {
    try {
      const existing = await db.favorites.where({ itemId: post.id, type: 'post' }).first()
      if (existing) {
        await db.favorites.delete(existing.id!)
      } else {
        await db.favorites.add({
          itemId: post.id,
          type: 'post',
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error('收藏失败:', error)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
      {/* 顶部栏 */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <BackButton />
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>动态</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            background: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          发布
        </button>
      </div>

      {/* 动态列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {posts.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#666' }}>
            <p>还没有动态，点击发布第一条吧</p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
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
                  {post.characterId ? '👤' : '👤'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {post.characterId ? '角色' : '我'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(post.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                {post.content}
              </div>

              {post.images && post.images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: post.images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {post.images.map((_img: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        aspectRatio: '1',
                        background: '#e5e5e5',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}
                    >
                      📷
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
                <button
                  onClick={() => handleLike(post)}
                  style={{
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    color: post.isLiked ? '#ff3b30' : '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ❤ {post.likes}
                </button>
                <button
                  onClick={() => handleLoadComments(post.id!)}
                  style={{
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    color: '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  💬 评论
                </button>
                <button
                  onClick={() => handleFavorite(post)}
                  style={{
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    color: '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ⭐ 收藏
                </button>
              </div>

              {/* 评论区 */}
              {showCommentsForId === post.id && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
                  {comments.map(comment => (
                    <div
                      key={comment.id}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        {comment.characterId ? '角色' : '我'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#333' }}>{comment.content}</div>
                    </div>
                  ))}
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="写评论..."
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      style={{
                        padding: '8px 16px',
                        background: '#007aff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      发送
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 发布动态弹窗 */}
      {showCreateModal && (
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>发布动态</h3>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="分享你的想法..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCreatePost}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#007aff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                发布
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewPostContent('')
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

export default QQDynamic
