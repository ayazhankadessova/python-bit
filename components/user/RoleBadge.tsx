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
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800'
    }
  `}
  >
    {role}
  </span>
)
