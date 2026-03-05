import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ListTodo, Mic, Settings, Newspaper
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { path: '/',          icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/saksliste', icon: Newspaper,       label: 'Saksliste' },
  { path: '/tasks',     icon: ListTodo,        label: 'Tasks' },
  { path: '/voice',     icon: Mic,             label: 'Voice' },
  { path: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <motion.aside
      initial={{ width: '220px' }}
      animate={{ width: '220px' }}
      className="flex-shrink-0 h-full flex flex-col relative z-20 bg-space-900 border-r border-white/5"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-neon/20 flex items-center justify-center">
            <span className="text-cyan-neon font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-white">Vev</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-online/5 border border-status-online/10">
          <div className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
          <span className="text-xs text-gray-400">System Online</span>
        </div>
      </div>
    </motion.aside>
  )
}
