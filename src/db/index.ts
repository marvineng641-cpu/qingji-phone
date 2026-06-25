import Dexie, { Table } from 'dexie'

// 数据库版本
const DB_VERSION = 1

class QingjiDB extends Dexie {
  // 各个表将在后续任务中定义
  settings!: Table<any>
  characters!: Table<any>
  messages!: Table<any>
  worldbooks!: Table<any>
  worldbookCategories!: Table<any>
  groups!: Table<any>
  posts!: Table<any>
  comments!: Table<any>
  favorites!: Table<any>
  coupleSpaces!: Table<any>
  coupleTasks!: Table<any>
  coupleNotes!: Table<any>
  coupleQuestions!: Table<any>
  coupleDiaries!: Table<any>
  couplePets!: Table<any>
  coupleWishes!: Table<any>
  coupleMoods!: Table<any>
  coupleSleeps!: Table<any>
  xiaohongshuPosts!: Table<any>
  orders!: Table<any>
  products!: Table<any>
  wallet!: Table<any>
  xPosts!: Table<any>
  homeScreen!: Table<any>
  memos!: Table<any>
  widgets!: Table<any>
  groupMessages!: Table<any>
  themes!: Table<any>
  backgroundTasks!: Table<any>

  constructor() {
    super('QingjiDB')
    
    // 版本 1：初始数据库结构
    this.version(DB_VERSION).stores({
      settings: '++id, key',
      characters: '++id, name, avatar',
      messages: '++id, characterId, groupId, timestamp',
      worldbooks: '++id, name, categoryId',
      worldbookCategories: '++id, name',
      groups: '++id, name',
      posts: '++id, characterId, type, timestamp',
      comments: '++id, postId, characterId, timestamp',
      favorites: '++id, characterId, type, itemId',
      coupleSpaces: '++id, characterId',
      coupleTasks: '++id, characterId, type, date',
      coupleNotes: '++id, characterId, timestamp',
      coupleQuestions: '++id, characterId, answered',
      coupleDiaries: '++id, characterId, timestamp',
      couplePets: '++id, characterId',
      coupleWishes: '++id, characterId, fulfilled',
      coupleMoods: '++id, characterId, date',
      coupleSleeps: '++id, characterId, date',
      xiaohongshuPosts: '++id, characterId, timestamp',
      orders: '++id, type, timestamp',
      products: '++id',
      wallet: '++id',
      xPosts: '++id, characterId, timestamp',
      homeScreen: '++id, screen, position',
      memos: '++id, timestamp',
      widgets: '++id, type, position',
      groupMessages: '++id, groupId, timestamp',
      themes: '++id, name',
      backgroundTasks: '++id, name, isActive'
    })
  }
}

export const db = new QingjiDB()

// 统一 CRUD 封装层
export class DBService<T> {
  constructor(private table: Table<any>) {}

  async create(data: any): Promise<number> {
    const result = await this.table.add(data)
    return typeof result === 'number' ? result : 0
  }

  async getById(id: number): Promise<T | undefined> {
    return await this.table.get(id)
  }

  async getAll(): Promise<T[]> {
    return await this.table.toArray()
  }

  async update(id: number, data: Partial<T>): Promise<number> {
    const result = await this.table.update(id, data)
    return typeof result === 'number' ? result : 0
  }

  async delete(id: number): Promise<void> {
    await this.table.delete(id)
  }

  async deleteAll(): Promise<void> {
    await this.table.clear()
  }

  async where(condition: any): Promise<T[]> {
    // @ts-ignore - Dexie 类型兼容性问题
    return await this.table.where(condition).toArray()
  }

  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll()
    return all.filter(predicate)
  }
}

// 版本迁移机制
export async function migrateDatabase() {
  // 未来版本升级时在这里添加迁移逻辑
  console.log('Database version:', DB_VERSION)
}
