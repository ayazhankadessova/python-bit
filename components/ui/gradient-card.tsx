import React from 'react'
import { motion } from 'framer-motion'

import { ReactNode } from 'react';

interface GradientCardProps {
  children: ReactNode;
  className?: string;
}

const GradientCard = ({ children, className = '' }: GradientCardProps) => {
  return (
    <motion.div
      className='relative group'
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient background with blur */}
      <div className='absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300' />

      {/* Content container */}
      <div className={`relative bg-background rounded-2xl ${className}`}>
        {children}
      </div>
    </motion.div>
  )
}

export default GradientCard
