import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { 
  Plus, MoreHorizontal, Clock, Tag, 
  AlertCircle, CheckCircle2, ArrowRight 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import clsx from 'clsx'

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'gray', icon: '📥' },
  { id: 'research', title: 'Research', color: 'cyan', icon: '🔍' },
  { id: 'write', title: 'Write', color: 'violet', icon: '✍️' },
  { id: 'review', title: 'Review', color: 'amber', icon: '👀' },
  { id: 'done', title: 'Done', color: 'green', icon: '✅' }
]

const PRIORITY_COLORS = {
  critical: { bg: 'bg-status-danger/20', text: 'text-status-danger', border: 'border-status-danger/30' },
  high: { bg: 'bg-status-warning/20', text: 'text-status-warning', border: 'border-status-warning/30' },
  medium: { bg: 'bg-cyan-neon/20', text: 'text-cyan-neon', border: 'border-cyan-neon/30' },
  low: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    loadTasks()
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('vev_tasks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vev_tasks' },
        (payload) => {
          loadTasks()
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('vev_tasks')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setTasks(data || [])
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading tasks:', error)
      setIsLoading(false)
    }
  }

  const onDragEnd = async (result) => {
    setIsDragging(false)
    
    if (!result.destination) return
    
    const { draggableId, destination, source } = result
    const newColumnId = destination.droppableId
    const oldColumnId = source.droppableId
    
    if (newColumnId === oldColumnId) return
    
    // Optimistic update
    setTasks(tasks.map(t => 
      t.id === draggableId 
        ? { ...t, column_id: newColumnId } 
        : t
    ))
    
    // Update database
    try {
      const updates = {
        column_id: newColumnId,
        updated_at: new Date().toISOString()
      }
      
      if (newColumnId === 'done') {
        updates.completed_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('vev_tasks')
        .update(updates)
        .eq('id', draggableId)
      
      if (error) throw error
      
      // Send notification if moved to done
      if (newColumnId === 'done') {
        const task = tasks.find(t => t.id === draggableId)
        if (task) {
          console.log(`✅ Task completed: ${task.title}`)
        }
      }
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert on error
      loadTasks()
    }
  }

  const onDragStart = () => {
    setIsDragging(true)
  }

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.column_id === col.id)
    return acc
  }, {})

  const getColumnColor = (color) => {
    const colors = {
      gray: 'border-gray-500/30 bg-gray-500/5',
      cyan: 'border-cyan-neon/30 bg-cyan-neon/5',
      violet: 'border-violet-neon/30 bg-violet-neon/5',
      amber: 'border-status-warning/30 bg-status-warning/5',
      green: 'border-status-online/30 bg-status-online/5'
    }
    return colors[color] || colors.gray
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex-shrink-0 w-72">
            <div className="glass p-3 rounded-panel border border-white/10 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-white/5 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`
              glass p-3 rounded-panel border 
              ${getColumnColor(column.color)}
              transition-all duration-200
              ${isDragging ? 'opacity-90' : 'opacity-100'}
            `}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{column.icon}</span>
                  <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                    {tasksByColumn[column.id].length}
                  </span>
                </div>
              </div>
              
              {/* Tasks */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      space-y-2 min-h-[120px] rounded-lg p-1
                      transition-colors duration-200
                      ${snapshot.isDraggingOver ? 'bg-white/10' : ''}
                    `}
                  >
                    {tasksByColumn[column.id].map((task, index) => (
                      <Draggable 
                        key={task.id} 
                        draggableId={task.id} 
                        index={index}
                      >
                        {(provided, snapshot) => {
                          const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
                          
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                p-3 rounded-lg border transition-all duration-200
                                ${snapshot.isDragging 
                                  ? 'bg-cyan-neon/10 border-cyan-neon/50 shadow-lg rotate-2 scale-105' 
                                  : 'bg-white/5 border-white/10 hover:border-cyan-neon/30 hover:bg-white/8'}
                              `}
                              style={provided.draggableProps.style}
                            >
                              {/* Task Header */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-xs text-white font-medium leading-relaxed flex-1">
                                  {task.title}
                                </p>
                                
                                {task.priority === 'critical' && (
                                  <AlertCircle size={14} className="text-status-danger flex-shrink-0" />
                                )}
                              </div>
                              
                              {/* Description */}
                              {task.description && (
                                <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">
                                  {task.description}
                                </p>
                              )}
                              
                              {/* Task Footer */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {/* Priority Badge */}
                                  <span className={`
                                    text-[9px] px-1.5 py-0.5 rounded border
                                    ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}
                                  `}>
                                    {task.priority}
                                  </span>
                                  
                                  {/* Source Badge */}
                                  {task.source === 'morning-routine' && (
                                    <span className="text-[9px] text-violet-neon bg-violet-neon/10 px-1.5 py-0.5 rounded">
                                      🌅
                                    </span>
                                  )}
                                </div>
                                
                                {/* Time */}
                                <div className="flex items-center gap-1 text-[9px] text-gray-600">
                                  <Clock size={10} />
                                  <span>
                                    {new Date(task.created_at).toLocaleDateString('no-NO', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.map(tag => (
                                    <span 
                                      key={tag}
                                      className="text-[8px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
              {/* Add Task Button (only for backlog) */}
              {column.id === 'backlog' && (
                <button 
                  className="w-full mt-3 py-2.5 rounded-lg border border-dashed border-white/20 
                           text-xs text-gray-500 hover:text-white hover:border-cyan-neon/40
                           hover:bg-cyan-neon/5 transition-all flex items-center justify-center gap-2
                           group"
                  onClick={() => console.log('Add new task')}
                >
                  <Plus size={14} className="group-hover:text-cyan-neon transition-colors" />
                  <span>Legg til sak</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
