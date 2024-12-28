// projects/page.tsx
"use client"
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Gamepad2,
  Trees,
  Swords,
  Cat,
  Shirt,
  Trophy,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeImage } from '@/components/ThemeImage'


const ProjectThemes = () => {

  const themes = [
    {
      title: 'Gaming Universe',
      description: 'Create games and game-related projects',
      projects: [
        'Aura Points Calculator',
        'Pokemon Battle Simulator',
        'Minecraft Resource Calculator',
      ],
      icon: <Gamepad2 className='w-8 h-8' />,
      difficulty: 'Beginner',
      estimatedTime: '2-3 hours',
      image: 'gaming.webp',
    },
    {
      title: 'Pet Companion',
      description: 'Projects for animal lovers',
      projects: [
        'Virtual Pet Simulator',
        'Pet Care Schedule Tracker',
        'Animal Species Encyclopedia',
      ],
      icon: <Cat className='w-8 h-8' />,
      difficulty: 'Beginner',
      estimatedTime: '2-3 hours',
      image: 'animals.webp',
    },
    {
      title: 'Sports Analytics',
      description: 'Analyze sports data and statistics',
      projects: [
        'Team Performance Tracker',
        'Player Stats Calculator',
        'Tournament Bracket Generator',
      ],
      icon: <Trophy className='w-8 h-8' />,
      difficulty: 'Advanced',
      estimatedTime: '4-5 hours',
      image: 'sports.webp',
    },
    {
      title: 'Fashion & Style',
      description: 'Design fashion-related tools',
      projects: ['Outfit Coordinator', 'Style Quiz', 'Virtual Wardrobe'],
      icon: <Shirt className='w-8 h-8' />,
      difficulty: 'Beginner',
      estimatedTime: '2-3 hours',
      image: 'fashion.webp',
    },
    {
      title: 'Nature & Science',
      description: 'Explore the natural world through code',
      projects: [
        'Ecosystem Simulator',
        'Weather Prediction Tool',
        'Plant Growth Calculator',
      ],
      icon: <Trees className='w-8 h-8' />,
      difficulty: 'Advanced',
      estimatedTime: '4-5 hours',
      image: 'nature.webp',
    },
    {
      title: 'Anime & Manga World',
      description: 'Projects inspired by your favorite anime',
      projects: [
        'Character Power Level System',
        'Anime Quiz Game',
        'Manga Collection Tracker',
      ],
      icon: <Swords className='w-8 h-8' />,
      difficulty: 'Intermediate',
      estimatedTime: '3-4 hours',
      image: 'anime.webp',
    },
  ]
  const router = useRouter()

  return (
    <div className='container max-w-4xl py-2 lg:py-3 px-1'>
      {/* <h1 className='text-4xl font-bold text-center mb-8'>Projects</h1> */}
      <h1 className='text-4xl font-bold mb-8'>Projects</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {themes.map((theme, index) => (
          <Card
            key={index}
            className='hover:shadow-lg transition-shadow overflow-hidden flex flex-col'
          >
            <ThemeImage
              src={theme.image}
              alt={theme.title}
              width={300}
              height={150}
            />
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  {theme.icon}
                  <CardTitle>{theme.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2 mb-4'>
                <Badge variant='outline'>{theme.difficulty}</Badge>
                <Badge variant='outline'>{theme.estimatedTime}</Badge>
              </div>
              <ul className='list-disc ml-4 space-y-2'>
                {theme.projects.map((project, idx) => (
                  <li key={idx}>{project}</li>
                ))}
              </ul>
            </CardContent>
            <Button
                className='mt-auto mb-6 mx-6'
                onClick={() =>
                  router.push(
                    `/projects/${theme.title
                      .toLowerCase()
                      .replace(/\s+/g, '-')}`
                  )
                }
              >
                Go to Theme
              </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProjectThemes
