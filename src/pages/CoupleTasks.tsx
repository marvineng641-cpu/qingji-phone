import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Task {
  id?: number
  title: string
  description: string
  type: 'daily' | 'weekly'
  points: number
  completed: boolean
  date: string
  progress: number
  target: number
}

const CoupleTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily')
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    loadTasks()
    checkAndResetTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const taskData = await db.coupleTasks.toArray()
      setTasks(taskData)
      
      const points = taskData.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0)
      setTotalPoints(points)
    } catch (error) {
      console.error('加载任务失败:', error)
    }
  }

  const checkAndResetTasks = async () => {
    const today = new Date().toISOString().split('T')[0]
    const weekStart = getWeekStart()

    // 重置每日任务
    const dailyTasks = tasks.filter(t => t.type === 'daily' && t.date !== today)
    for (const task of dailyTasks) {
      if (task.id) {
        await db.coupleTasks.update(task.id, {
          completed: false,
          progress: 0,
          date: today
        })
      }
    }

    // 重置每周任务
    const weeklyTasks = tasks.filter(t => t.type === 'weekly' && t.date !== weekStart)
    for (const task of weeklyTasks) {
      if (task.id) {
        await db.coupleTasks.update(task.id, {
          completed: false,
          progress: 0,
          date: weekStart
        })
      }
    }

    await loadTasks()
  }

  const getWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const handleCompleteTask = async (task: Task) => {
    if (!task.id) return

    const updated = { ...task, completed: true, progress: task.target }
    await db.coupleTasks.update(task.id, updated)
    await loadTasks()
  }

  const handleUpdateProgress = async (task: Task, progress: number) => {
    if (!task.id) return

    const newProgress = Math.min(progress, task.target)
    const completed = newProgress >= task.target

    const updated = { ...task, progress: newProgress, completed }
    await db.coupleTasks.update(task.id, updated)
    await loadTasks()
  }

  const handleAddTask = async () => {
    const title = prompt('输入任务标题:')
    if (!title) return

    const points = parseInt(prompt('输入积分奖励:', '10') || '10')
    const target = parseInt(prompt('输入目标数量:', '1') || '1')

    const today = new Date().toISOString().split('T')[0]
    const weekStart = getWeekStart()

    const newTask: Task = {
      title,
      description: '',
      type: activeTab,
      points,
      completed: false,
      date: activeTab === 'daily' ? today : weekStart,
      progress: 0,
      target
    }

    await db.coupleTasks.add(newTask)
    await loadTasks()
  }

  const filteredTasks = tasks.filter(t => t.type === activeTab)

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      {/* 头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>情侣任务</h1>
        <div style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
          borderRadius: '20px',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {totalPoints} 积分
        </div>
      </div>

      {/* 标签切换 */}
      <div style={{
        display: 'flex',
        background: 'white',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'daily' ? '#ff6b6b' : 'transparent',
            color: activeTab === 'daily' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          每日任务
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'weekly' ? '#ff6b6b' : 'transparent',
            color: activeTab === 'weekly' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          每周任务
        </button>
      </div>

      {/* 添加任务按钮 */}
      <button
        onClick={handleAddTask}
        style={{
          width: '100%',
          padding: '12px',
          background: '#007aff',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '16px',
          cursor: 'pointer'
        }}
      >
        + 添加任务
      </button>

      {/* 任务列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: '#666',
            background: 'white',
            borderRadius: '12px'
          }}>
            <p>还没有{activeTab === 'daily' ? '每日' : '每周'}任务</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                opacity: task.completed ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {task.points} 积分
                  </div>
                </div>
                {task.completed ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#34c759',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    ✓
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteTask(task)}
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
                    完成
                  </button>
                )}
              </div>

              {/* 进度条 */}
              {task.target > 1 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#666' }}>进度</span>
                    <span style={{ fontWeight: '600' }}>{task.progress}/{task.target}</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#e5e5e5',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(task.progress / task.target) * 100}%`,
                      background: task.completed ? '#34c759' : '#007aff',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  {!task.completed && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => handleUpdateProgress(task, task.progress + 1)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: '#f5f5f5',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleUpdateProgress(task, task.progress - 1)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: '#f5f5f5',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        -1
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CoupleTasks
