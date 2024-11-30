import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface WeekSelectorProps {
  selectedWeek: number | null
  totalWeeks: number
  onSelectWeek: (weekNumber: number) => void
}

export function WeekSelector({
  selectedWeek,
  totalWeeks,
  onSelectWeek,
}: WeekSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempSelectedWeek, setTempSelectedWeek] = useState<string>(
    selectedWeek?.toString() || ''
  )

  const handleStartWeek = () => {
    if (tempSelectedWeek) {
      onSelectWeek(parseInt(tempSelectedWeek))
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Week {selectedWeek || 'Not Selected'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='bg-white dark:bg-gray-800'>
          <DialogHeader>
            <DialogTitle>Select Week</DialogTitle>
            <DialogDescription>Choose which week to teach</DialogDescription>
          </DialogHeader>
          <Select
            value={tempSelectedWeek}
            onValueChange={(value) => setTempSelectedWeek(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select week'>
                {tempSelectedWeek ? `Week ${tempSelectedWeek}` : 'Select week'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalWeeks }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Week {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleStartWeek}>Start Week</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
