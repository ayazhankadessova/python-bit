import { Gamepad2, Trees, Swords, Cat, Shirt, Trophy } from 'lucide-react'

export const themes = [
  {
    title: 'Gaming Universe',
    description: 'For true gamers ',
    projects: [
      'Aura Points Calculator',
      'Pokemon Battle Simulator',
      'Minecraft Resource',
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
    title: 'Fashion And Style',
    description: 'Design fashion-related tools',
    projects: ['Outfit Coordinator', 'Style Quiz', 'Virtual Wardrobe'],
    icon: <Shirt className='w-8 h-8' />,
    difficulty: 'Beginner',
    estimatedTime: '2-3 hours',
    image: 'fashion.webp',
  },
  {
    title: 'Nature And Science',
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
