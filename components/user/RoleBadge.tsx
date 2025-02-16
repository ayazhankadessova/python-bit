import React from 'react'

interface RoleBadgeProps {
  role: string
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => (
  <span
    className={`
    px-2 py-1 text-xs rounded-full 
    ${
      role === 'teacher'
        ? 'bg-purple-100 text-purple-800'
        : 'bg-green-100 text-green-800'
    }
  `}
  >
    {role}
  </span>
)
