import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useHomeScreenStore } from '../store/homeScreenStore'
import { getAppById } from '../registry/appsRegistry'

interface SortableItemProps {
  id: string
  appId: string
  isEditMode: boolean
  onLongPress: () => void
}

function SortableItem({ id, appId, isEditMode, onLongPress }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const app = getAppById(appId)
  const [pressTimer, setPressTimer] = useState<number | null>(null)
  const navigate = useNavigate()

  const handlePointerDown = () => {
    if (!isEditMode) {
      const timer = window.setTimeout(() => {
        onLongPress()
      }, 500)
      setPressTimer(timer)
    }
  }

  const handlePointerUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
  }

  const handleClick = () => {
    if (!isEditMode) {
      const app = getAppById(appId)
      if (app) {
        navigate(app.route)
      }
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      className="home-screen-item"
    >
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '12px',
        background: isEditMode ? 'rgba(255, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        marginBottom: '8px',
        cursor: isEditMode ? 'grab' : 'pointer',
        position: 'relative'
      }}>
        {app?.icon}
        {isEditMode && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            background: '#ff4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white'
          }}>
            ×
          </div>
        )}
      </div>
      <span style={{ color: 'white', fontSize: '11px', textAlign: 'center' }}>
        {app?.name}
      </span>
    </div>
  )
}

interface HomeScreenGridProps {
  screenIndex: number
  items: any[]
  isEditMode: boolean
  onLongPress: () => void
}

const HomeScreenGrid: React.FC<HomeScreenGridProps> = ({ screenIndex, items, isEditMode, onLongPress }) => {
  const { moveItem } = useHomeScreenStore()

  const sensors = useSensors(
    useSensor(PointerSensor)
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      moveItem(screenIndex, oldIndex, screenIndex, newIndex)
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      maxWidth: '400px',
      width: '100%',
      padding: '20px'
    }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              appId={item.appId}
              isEditMode={isEditMode}
              onLongPress={onLongPress}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default HomeScreenGrid
