import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Note {
  id?: number
  content: string
  timestamp: number
  from: 'user' | 'partner'
}

interface Question {
  id?: number
  question: string
  answer?: string
  answered: boolean
  timestamp: number
}

interface Diary {
  id?: number
  content: string
  mood: string
  timestamp: number
}

interface Pet {
  id?: number
  name: string
  type: string
  level: number
  exp: number
  hunger: number
  happiness: number
}

interface Wish {
  id?: number
  content: string
  fulfilled: boolean
  timestamp: number
}

interface Mood {
  id?: number
  mood: string
  note?: string
  date: string
}

interface Sleep {
  id?: number
  hours: number
  quality: string
  date: string
}

const CoupleSubPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'questions' | 'diary' | 'pet' | 'wishes' | 'mood' | 'sleep'>('notes')
  const [notes, setNotes] = useState<Note[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [pet, setPet] = useState<Pet | null>(null)
  const [wishes, setWishes] = useState<Wish[]>([])
  const [moods, setMoods] = useState<Mood[]>([])
  const [sleeps, setSleeps] = useState<Sleep[]>([])

  // 表单状态
  const [newNote, setNewNote] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [newDiary, setNewDiary] = useState('')
  const [newDiaryMood, setNewDiaryMood] = useState('😊')
  const [newWish, setNewWish] = useState('')
  const [newMood, setNewMood] = useState('😊')
  const [newMoodNote, setNewMoodNote] = useState('')
  const [newSleepHours, setNewSleepHours] = useState(8)
  const [newSleepQuality, setNewSleepQuality] = useState('好')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [notesData, questionsData, diariesData, petsData, wishesData, moodsData, sleepsData] = await Promise.all([
        db.coupleNotes.toArray(),
        db.coupleQuestions.toArray(),
        db.coupleDiaries.toArray(),
        db.couplePets.toArray(),
        db.coupleWishes.toArray(),
        db.coupleMoods.toArray(),
        db.coupleSleeps.toArray()
      ])
      setNotes(notesData.sort((a: any, b: any) => b.timestamp - a.timestamp))
      setQuestions(questionsData.sort((a: any, b: any) => b.timestamp - a.timestamp))
      setDiaries(diariesData.sort((a: any, b: any) => b.timestamp - a.timestamp))
      setWishes(wishesData.sort((a: any, b: any) => b.timestamp - a.timestamp))
      setMoods(moodsData.sort((_: any, b: any) => b.date))
      setSleeps(sleepsData.sort((_: any, b: any) => b.date))
      if (petsData.length > 0) setPet(petsData[0])
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  // 小纸条
  const handleAddNote = async () => {
    if (!newNote.trim()) return
    const note: Note = { content: newNote, timestamp: Date.now(), from: 'user' }
    await db.coupleNotes.add(note)
    setNotes([note, ...notes])
    setNewNote('')
  }

  // 情侣提问
  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return
    const question: Question = { question: newQuestion, answered: false, timestamp: Date.now() }
    await db.coupleQuestions.add(question)
    setQuestions([question, ...questions])
    setNewQuestion('')
  }

  const handleAnswerQuestion = async (question: Question, answer: string) => {
    if (!question.id) return
    await db.coupleQuestions.update(question.id, { answered: true, answer })
    await loadData()
  }

  // 日记
  const handleAddDiary = async () => {
    if (!newDiary.trim()) return
    const diary: Diary = { content: newDiary, mood: newDiaryMood, timestamp: Date.now() }
    await db.coupleDiaries.add(diary)
    setDiaries([diary, ...diaries])
    setNewDiary('')
  }

  // 宠物
  const handleCreatePet = async () => {
    const name = prompt('给宠物起个名字:')
    if (!name) return
    const newPet: Pet = { name, type: '🐱', level: 1, exp: 0, hunger: 100, happiness: 100 }
    await db.couplePets.add(newPet)
    await loadData()
  }

  const handleFeedPet = async () => {
    if (!pet || !pet.id) return
    const updated = { ...pet, hunger: Math.min(100, pet.hunger + 20), happiness: Math.min(100, pet.happiness + 5) }
    await db.couplePets.update(pet.id, updated)
    setPet(updated)
  }

  const handlePlayPet = async () => {
    if (!pet || !pet.id) return
    const updated = { ...pet, happiness: Math.min(100, pet.happiness + 20), hunger: Math.max(0, pet.hunger - 10), exp: pet.exp + 10 }
    if (updated.exp >= updated.level * 100) {
      updated.level += 1
      updated.exp = 0
    }
    await db.couplePets.update(pet.id, updated)
    setPet(updated)
  }

  // 许愿树
  const handleAddWish = async () => {
    if (!newWish.trim()) return
    const wish: Wish = { content: newWish, fulfilled: false, timestamp: Date.now() }
    await db.coupleWishes.add(wish)
    setWishes([wish, ...wishes])
    setNewWish('')
  }

  const handleFulfillWish = async (wish: Wish) => {
    if (!wish.id) return
    await db.coupleWishes.update(wish.id, { fulfilled: true })
    await loadData()
  }

  // 心情日历
  const handleAddMood = async () => {
    const today = new Date().toISOString().split('T')[0]
    const mood: Mood = { mood: newMood, note: newMoodNote, date: today }
    await db.coupleMoods.add(mood)
    setMoods([...moods, mood])
    setNewMoodNote('')
  }

  // 睡眠记录
  const handleAddSleep = async () => {
    const today = new Date().toISOString().split('T')[0]
    const sleep: Sleep = { hours: newSleepHours, quality: newSleepQuality, date: today }
    await db.coupleSleeps.add(sleep)
    setSleeps([...sleeps, sleep])
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>情侣空间</h1>

      {/* 标签导航 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflow: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px',
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'notes', label: '小纸条', icon: '📝' },
          { id: 'questions', label: '提问', icon: '❓' },
          { id: 'diary', label: '日记', icon: '📔' },
          { id: 'pet', label: '宠物', icon: '🐱' },
          { id: 'wishes', label: '许愿', icon: '🌟' },
          { id: 'mood', label: '心情', icon: '😊' },
          { id: 'sleep', label: '睡眠', icon: '😴' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab.id ? '#ff6b6b' : 'white',
              color: activeTab === tab.id ? 'white' : '#666',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 小纸条 */}
      {activeTab === 'notes' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="写一张小纸条..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '24px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleAddNote}
              style={{
                padding: '12px 20px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              发送
            </button>
          </div>
          {notes.map(note => (
            <div
              key={note.id}
              style={{
                background: note.from === 'user' ? '#ff6b6b' : '#667eea',
                color: 'white',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '14px' }}>{note.content}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                {new Date(note.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 情侣提问 */}
      {activeTab === 'questions' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="提一个问题..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '24px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleAddQuestion}
              style={{
                padding: '12px 20px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              提问
            </button>
          </div>
          {questions.map(q => (
            <div
              key={q.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {q.question}
              </div>
              {q.answered ? (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  回答: {q.answer}
                </div>
              ) : (
                <button
                  onClick={() => {
                    const answer = prompt('回答这个问题:')
                    if (answer) handleAnswerQuestion(q, answer)
                  }}
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
                  回答
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 日记 */}
      {activeTab === 'diary' && (
        <div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <textarea
              value={newDiary}
              onChange={(e) => setNewDiary(e.target.value)}
              placeholder="写日记..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>心情:</span>
              {['😊', '😢', '😠', '😴', '🥳'].map(mood => (
                <button
                  key={mood}
                  onClick={() => setNewDiaryMood(mood)}
                  style={{
                    padding: '8px',
                    background: newDiaryMood === mood ? '#ff6b6b' : '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  {mood}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddDiary}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              保存日记
            </button>
          </div>
          {diaries.map(diary => (
            <div
              key={diary.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{diary.mood}</div>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{diary.content}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                {new Date(diary.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 宠物 */}
      {activeTab === 'pet' && (
        <div>
          {!pet ? (
            <button
              onClick={handleCreatePet}
              style={{
                width: '100%',
                padding: '16px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              🐱 领养宠物
            </button>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{pet.type}</div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{pet.name}</h2>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                Lv.{pet.level} | EXP: {pet.exp}/{pet.level * 100}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🍖</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>饱食度</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{pet.hunger}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>❤</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>开心度</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{pet.happiness}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleFeedPet}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#ff9500',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  喂食
                </button>
                <button
                  onClick={handlePlayPet}
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
                  玩耍
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 许愿树 */}
      {activeTab === 'wishes' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              placeholder="许个愿望..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '24px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleAddWish}
              style={{
                padding: '12px 20px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              许愿
            </button>
          </div>
          {wishes.map(wish => (
            <div
              key={wish.id}
              style={{
                background: wish.fulfilled ? '#d4edda' : 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                opacity: wish.fulfilled ? 0.7 : 1
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                {wish.fulfilled ? '✅' : '🌟'} {wish.content}
              </div>
              {!wish.fulfilled && (
                <button
                  onClick={() => handleFulfillWish(wish)}
                  style={{
                    padding: '8px 16px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  实现
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 心情日历 */}
      {activeTab === 'mood' && (
        <div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>今天心情:</span>
              {['😊', '😢', '😠', '😴', '🥳'].map(mood => (
                <button
                  key={mood}
                  onClick={() => setNewMood(mood)}
                  style={{
                    padding: '8px',
                    background: newMood === mood ? '#ff6b6b' : '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  {mood}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={newMoodNote}
              onChange={(e) => setNewMoodNote(e.target.value)}
              placeholder="备注..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px'
              }}
            />
            <button
              onClick={handleAddMood}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              记录
            </button>
          </div>
          {moods.map(mood => (
            <div
              key={mood.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{mood.mood}</div>
              {mood.note && <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{mood.note}</div>}
              <div style={{ fontSize: '12px', color: '#999' }}>{mood.date}</div>
            </div>
          ))}
        </div>
      )}

      {/* 睡眠记录 */}
      {activeTab === 'sleep' && (
        <div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>睡眠时长 (小时)</label>
              <input
                type="number"
                value={newSleepHours}
                onChange={(e) => setNewSleepHours(Number(e.target.value))}
                min="0"
                max="24"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>睡眠质量</label>
              <select
                value={newSleepQuality}
                onChange={(e) => setNewSleepQuality(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="好">好</option>
                <option value="一般">一般</option>
                <option value="差">差</option>
              </select>
            </div>
            <button
              onClick={handleAddSleep}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              记录
            </button>
          </div>
          {sleeps.map(sleep => (
            <div
              key={sleep.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {sleep.hours} 小时
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                质量: {sleep.quality}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>{sleep.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoupleSubPages
