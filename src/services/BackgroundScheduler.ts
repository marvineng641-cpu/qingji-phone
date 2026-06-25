// 后台活动调度器 - 用于处理定时任务和后台保活
import { db } from '../db'

export interface ScheduledTask {
  id?: number
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'once'
  lastRun: number
  nextRun: number
  isActive: boolean
  action: string
}

class BackgroundScheduler {
  private intervalId: number | null = null
  private tasks: ScheduledTask[] = []
  private listeners: Map<string, (() => void)[]> = new Map()

  constructor() {
    this.init()
  }

  private async init() {
    await this.loadTasks()
    this.startScheduler()
  }

  private async loadTasks() {
    try {
      const tasks = await db.backgroundTasks.toArray()
      this.tasks = tasks
    } catch (error) {
      console.error('加载后台任务失败:', error)
    }
  }

  startScheduler() {
    if (this.intervalId) return

    this.intervalId = window.setInterval(() => {
      this.checkAndRunTasks()
    }, 60000) // 每分钟检查一次

    console.log('后台调度器已启动')
  }

  stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('后台调度器已停止')
    }
  }

  private async checkAndRunTasks() {
    const now = Date.now()

    for (const task of this.tasks) {
      if (!task.isActive) continue
      if (now < task.nextRun) continue

      await this.runTask(task)
    }
  }

  private async runTask(task: ScheduledTask) {
    console.log(`执行任务: ${task.name}`)

    try {
      switch (task.action) {
        case 'reset_daily_tasks':
          await this.resetDailyTasks()
          break
        case 'reset_weekly_tasks':
          await this.resetWeeklyTasks()
          break
        case 'cleanup_old_messages':
          await this.cleanupOldMessages()
          break
        case 'send_notification':
          await this.sendNotification(task.name)
          break
        default:
          console.log(`未知任务类型: ${task.action}`)
      }

      // 更新任务执行时间
      await this.updateTaskRunTime(task)
    } catch (error) {
      console.error(`任务执行失败: ${task.name}`, error)
    }
  }

  private async resetDailyTasks() {
    // 重置情侣每日任务
    const tasks = await db.coupleTasks.where('type').equals('daily').toArray()
    for (const task of tasks) {
      await db.coupleTasks.update(task.id!, { completed: false })
    }
    console.log('每日任务已重置')
  }

  private async resetWeeklyTasks() {
    // 重置情侣每周任务
    const tasks = await db.coupleTasks.where('type').equals('weekly').toArray()
    for (const task of tasks) {
      await db.coupleTasks.update(task.id!, { completed: false })
    }
    console.log('每周任务已重置')
  }

  private async cleanupOldMessages() {
    // 清理超过 30 天的消息
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const oldMessages = await db.messages.where('timestamp').below(thirtyDaysAgo).toArray()
    
    for (const msg of oldMessages) {
      await db.messages.delete(msg.id!)
    }
    
    console.log(`清理了 ${oldMessages.length} 条旧消息`)
  }

  private async sendNotification(title: string) {
    // 发送系统通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: '你有新的提醒',
        icon: '/favicon.ico'
      })
    }
  }

  private async updateTaskRunTime(task: ScheduledTask) {
    if (!task.id) return

    const now = Date.now()
    let nextRun: number

    switch (task.type) {
      case 'daily':
        nextRun = now + 24 * 60 * 60 * 1000
        break
      case 'weekly':
        nextRun = now + 7 * 24 * 60 * 60 * 1000
        break
      case 'monthly':
        nextRun = now + 30 * 24 * 60 * 60 * 1000
        break
      case 'once':
        nextRun = 0
        break
      default:
        nextRun = now + 24 * 60 * 60 * 1000
    }

    await db.backgroundTasks.update(task.id, {
      lastRun: now,
      nextRun,
      isActive: task.type !== 'once'
    })

    await this.loadTasks()
  }

  async addTask(task: Omit<ScheduledTask, 'id'>) {
    await db.backgroundTasks.add(task)
    await this.loadTasks()
  }

  async removeTask(taskId: number) {
    await db.backgroundTasks.delete(taskId)
    await this.loadTasks()
  }

  async toggleTask(taskId: number) {
    const task = await db.backgroundTasks.get(taskId)
    if (task) {
      await db.backgroundTasks.update(taskId, { isActive: !task.isActive })
      await this.loadTasks()
    }
  }

  getTasks() {
    return this.tasks
  }

  // 事件监听
  on(event: string, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: () => void) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }

  // 保活机制 - 通过定期发送心跳来保持应用活跃
  private keepAliveInterval: number | null = null

  startKeepAlive() {
    if (this.keepAliveInterval) return

    this.keepAliveInterval = window.setInterval(() => {
      this.emit('keepalive')
      console.log('保活心跳')
    }, 5 * 60 * 1000) // 每 5 分钟发送一次心跳

    console.log('保活机制已启动')
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval)
      this.keepAliveInterval = null
      console.log('保活机制已停止')
    }
  }
}

// 单例
export const backgroundScheduler = new BackgroundScheduler()

// 初始化默认任务
export async function initDefaultTasks() {
  const existingTasks = await db.backgroundTasks.toArray()
  
  if (existingTasks.length === 0) {
    const now = Date.now()
    const defaultTasks: Omit<ScheduledTask, 'id'>[] = [
      {
        name: '每日任务重置',
        type: 'daily',
        lastRun: now,
        nextRun: now + 24 * 60 * 60 * 1000,
        isActive: true,
        action: 'reset_daily_tasks'
      },
      {
        name: '每周任务重置',
        type: 'weekly',
        lastRun: now,
        nextRun: now + 7 * 24 * 60 * 60 * 1000,
        isActive: true,
        action: 'reset_weekly_tasks'
      },
      {
        name: '清理旧消息',
        type: 'weekly',
        lastRun: now,
        nextRun: now + 7 * 24 * 60 * 60 * 1000,
        isActive: true,
        action: 'cleanup_old_messages'
      }
    ]

    for (const task of defaultTasks) {
      await db.backgroundTasks.add(task)
    }

    console.log('默认后台任务已初始化')
  }
}
