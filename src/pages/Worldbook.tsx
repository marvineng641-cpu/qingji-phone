import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Worldbook {
  id?: number
  name: string
  content: string
  categoryId?: number
  isGlobalPrivate: boolean
  isGlobalGroup: boolean
}

interface WorldbookCategory {
  id?: number
  name: string
}

const Worldbook: React.FC = () => {
  const [worldbooks, setWorldbooks] = useState<Worldbook[]>([])
  const [categories, setCategories] = useState<WorldbookCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<Worldbook | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [wbData, catData] = await Promise.all([
        db.worldbooks.toArray(),
        db.worldbookCategories.toArray()
      ])
      setWorldbooks(wbData)
      setCategories(catData)
    } catch (error) {
      console.error('加载世界书失败:', error)
    }
  }

  const handleAdd = () => {
    setEditingItem({
      name: '',
      content: '',
      categoryId: undefined,
      isGlobalPrivate: false,
      isGlobalGroup: false
    })
    setIsEditing(true)
  }

  const handleEdit = (item: Worldbook) => {
    setEditingItem({ ...item })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editingItem || !editingItem.name.trim()) return

    try {
      if (editingItem.id) {
        await db.worldbooks.update(editingItem.id, editingItem)
      } else {
        await db.worldbooks.add(editingItem)
      }
      await loadData()
      setIsEditing(false)
      setEditingItem(null)
    } catch (error) {
      console.error('保存世界书失败:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条世界书吗？')) return
    try {
      await db.worldbooks.delete(id)
      await loadData()
    } catch (error) {
      console.error('删除世界书失败:', error)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await db.worldbookCategories.add({ name: newCategoryName })
      await loadData()
      setNewCategoryName('')
      setShowCategoryModal(false)
    } catch (error) {
      console.error('添加分类失败:', error)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定删除这个分类吗？分类下的世界书将变为未分类。')) return
    try {
      await db.worldbookCategories.delete(id)
      // 更新该分类下的世界书
      const items = await db.worldbooks.where({ categoryId: id }).toArray()
      await Promise.all(items.map(item => db.worldbooks.update(item.id!, { categoryId: undefined })))
      await loadData()
    } catch (error) {
      console.error('删除分类失败:', error)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        let content = e.target?.result as string
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content)
          if (Array.isArray(data)) {
            await db.worldbooks.bulkAdd(data)
          } else {
            await db.worldbooks.add(data)
          }
        } else {
          // txt 或其他文本格式
          await db.worldbooks.add({
            name: file.name.replace(/\.[^/.]+$/, ''),
            content,
            isGlobalPrivate: false,
            isGlobalGroup: false
          })
        }
        await loadData()
      } catch (error) {
        console.error('导入失败:', error)
        alert('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleExport = async () => {
    try {
      const data = await db.worldbooks.toArray()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'worldbooks.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  const filteredWorldbooks = worldbooks.filter(wb =>
    wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wb.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isEditing && editingItem) {
    return (
      <div style={{ padding: '60px 16px 16px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
        <BackButton />
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          {editingItem.id ? '编辑世界书' : '新建世界书'}
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>名称</label>
          <input
            type="text"
            value={editingItem.name}
            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>分类</label>
          <select
            value={editingItem.categoryId || ''}
            onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value ? Number(e.target.value) : undefined })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">未分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>内容</label>
          <textarea
            value={editingItem.content}
            onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
            rows={10}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={editingItem.isGlobalPrivate}
              onChange={(e) => setEditingItem({ ...editingItem, isGlobalPrivate: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '14px' }}>私聊全局（所有私聊自动应用）</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={editingItem.isGlobalGroup}
              onChange={(e) => setEditingItem({ ...editingItem, isGlobalGroup: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '14px' }}>群聊全局（所有群聊自动应用）</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
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
            保存
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setEditingItem(null)
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
    )
  }

  return (
    <div style={{ padding: '60px 16px 16px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />
      
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>世界书</h1>
      
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="搜索世界书..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={handleAdd}
          style={{
            padding: '8px 16px',
            background: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          新建
        </button>
        <button
          onClick={() => setShowCategoryModal(true)}
          style={{
            padding: '8px 16px',
            background: '#5856d6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          新建分类
        </button>
        <label style={{
          padding: '8px 16px',
          background: '#ff9500',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          导入
          <input type="file" accept=".txt,.json,.docx" onChange={handleImport} style={{ display: 'none' }} />
        </label>
        <button
          onClick={handleExport}
          style={{
            padding: '8px 16px',
            background: '#34c759',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          导出
        </button>
      </div>

      {/* 分类列表 */}
      {categories.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>分类</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  padding: '6px 12px',
                  background: 'white',
                  borderRadius: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {cat.name}
                <button
                  onClick={() => cat.id && handleDeleteCategory(cat.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff3b30',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: 0
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 世界书列表 */}
      <div>
        {filteredWorldbooks.map(wb => (
          <div
            key={wb.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{wb.name}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(wb)}
                  style={{
                    padding: '4px 8px',
                    background: '#007aff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => wb.id && handleDelete(wb.id)}
                  style={{
                    padding: '4px 8px',
                    background: '#ff3b30',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              {wb.categoryId ? categories.find(c => c.id === wb.categoryId)?.name : '未分类'}
              {wb.isGlobalPrivate && <span style={{ marginLeft: '8px', color: '#007aff' }}>私聊全局</span>}
              {wb.isGlobalGroup && <span style={{ marginLeft: '8px', color: '#5856d6' }}>群聊全局</span>}
            </div>
            
            <p style={{ fontSize: '14px', color: '#333', margin: 0, maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {wb.content}
            </p>
          </div>
        ))}
      </div>

      {/* 新建分类弹窗 */}
      {showCategoryModal && (
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
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>新建分类</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="分类名称"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddCategory}
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
                确定
              </button>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
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

export default Worldbook
