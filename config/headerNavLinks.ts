interface Dropdown {
  title: string
  href: string
  description: string
}

interface DialogInfo {
  title: string
  href: string
  dropdown?: Dropdown[]
  toggle: boolean
}

interface DialogsInfo {
  [key: string]: DialogInfo
}

const dialogsInfo: DialogsInfo = {
  Products: {
    title: 'Teaching Content',
    href: '/teaching-content',
    dropdown: [
      {
        title: 'Full Programmes',
        href: '/teaching-content/programmes',
        description: 'Check out full 7-week or 14-week programmes.',
      },
      {
        title: 'Learning Topics',
        href: '/teaching-content/learning-topics',
        description: 'Explore various topics.',
      },
      {
        title: 'Quizes and tests',
        href: '/teaching-content/quizes-tests',
        description: 'Find a way to test students knowledge.',
      },
      {
        title: 'Teacher Forum',
        href: '/teaching-content/teacher-forum',
        description: 'Connect with fellow teachers.',
      },
    ],
    toggle: true,
  },
  Classrooms: {
    title: 'Classrooms',
    href: '/classrooms',
    toggle: false,
  },
  Projects: {
    title: 'Projects',
    href: '/projects',
    toggle: false,
  },
  Explore: {
    title: 'Explore',
    href: '/explore',
    toggle: false,
  },
}

export default dialogsInfo
