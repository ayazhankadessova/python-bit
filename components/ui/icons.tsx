// pass props to svg

type IconProps = React.HTMLAttributes<SVGElement>

const twitterMetadata = {
  'twitter:card': 'summary',
  'twitter:site': '@twitter', // Replace with your Twitter handle
  'twitter:title': 'PythonBit',
  'twitter:description': 'Learn Python Real-time with tutorials',
}

interface MetadataProps {
  title?: string
  description?: string
  siteUrl?: string
  siteName?: string
  // imageUrl?: string
}

const defaultMetadata: MetadataProps = {
  title: 'PythonBit',
  description: 'Learn Python Real-time with tutorials',
  siteUrl: 'https://python-bit.vercel.app',
  siteName: 'PythonBit',
}

export const Icons = {
  Logo: (props: IconProps) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M4 11a9 9 0 0 1 9 9' />
      <path d='M4 4a16 16 0 0 1 16 16' />
      <circle cx='5' cy='19' r='1' />
    </svg>
  ),
  Twitter: (props: IconProps) => (
    <>
      <head>
        {Object.entries(twitterMetadata).map(([name, content]) => (
          <meta key={name} name={name} content={content} />
        ))}
      </head>

      <svg
        {...props}
        height='20'
        viewBox='0 0 1200 1227'
        width='23'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fill='currentColor'
          d='M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z'
        />
      </svg>
    </>
  ),
  GitHub: (props: IconProps) => (
    <>
      <title>{defaultMetadata.title}</title>
      <meta name='description' content={defaultMetadata.description} />

      {/* OpenGraph Metadata */}
      <meta property='og:title' content={defaultMetadata.title} />
      <meta property='og:description' content={defaultMetadata.description} />
      <meta property='og:url' content={defaultMetadata.siteUrl} />
      <meta property='og:site_name' content={defaultMetadata.siteName} />
      {/* <meta property="og:image" content={defaultMetadata.imageUrl} /> */}
      <meta property='og:type' content='website' />

      <svg viewBox='0 0 438.549 438.549' {...props}>
        <path
          fill='currentColor'
          d='M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z'
        ></path>
      </svg>
    </>
  ),
  Youtube: () => (
    <>
      <title>{defaultMetadata.title}</title>
      <meta name='description' content={defaultMetadata.description} />

      {/* OpenGraph Metadata */}
      <meta property='og:title' content={defaultMetadata.title} />
      <meta property='og:description' content={defaultMetadata.description} />
      <meta property='og:url' content={defaultMetadata.siteUrl} />
      <meta property='og:site_name' content={defaultMetadata.siteName} />
      {/* <meta property="og:image" content={defaultMetadata.imageUrl} /> */}
      <meta property='og:type' content='website' />

      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='lucide lucide-youtube'
      >
        <path d='M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17' />
        <path d='m10 15 5-3-5-3z' />
      </svg>
    </>
  ),
  Linkedin: () => (
    <>
      <title>{defaultMetadata.title}</title>
      <meta name='description' content={defaultMetadata.description} />

      {/* OpenGraph Metadata */}
      <meta property='og:title' content={defaultMetadata.title} />
      <meta property='og:description' content={defaultMetadata.description} />
      <meta property='og:url' content={defaultMetadata.siteUrl} />
      <meta property='og:site_name' content={defaultMetadata.siteName} />
      {/* <meta property="og:image" content={defaultMetadata.imageUrl} /> */}
      <meta property='og:type' content='website' />
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='lucide lucide-linkedin'
      >
        <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
        <rect width='4' height='12' x='2' y='9' />
        <circle cx='4' cy='4' r='2' />
      </svg>
    </>
  ),
  Discord: () => (
    <>
      {/* Basic Metadata */}
      <title>{defaultMetadata.title}</title>
      <meta name='description' content={defaultMetadata.description} />

      {/* OpenGraph Metadata */}
      <meta property='og:title' content={defaultMetadata.title} />
      <meta property='og:description' content={defaultMetadata.description} />
      <meta property='og:url' content={defaultMetadata.siteUrl} />
      <meta property='og:site_name' content={defaultMetadata.siteName} />
      {/* <meta property="og:image" content={defaultMetadata.imageUrl} /> */}
      <meta property='og:type' content='website' />

      {/* Discord/Social Specific */}
      {/* <meta name="theme-color" content="#5865F2" /> */}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 32 32'
      >
        <path d='M25.12,6.946c-2.424-1.948-6.257-2.278-6.419-2.292c-0.256-0.022-0.499,0.123-0.604,0.357 c-0.004,0.008-0.218,0.629-0.425,1.228c2.817,0.493,4.731,1.587,4.833,1.647c0.478,0.278,0.638,0.891,0.359,1.368 C22.679,9.572,22.344,9.75,22,9.75c-0.171,0-0.343-0.043-0.501-0.135C21.471,9.598,18.663,8,15.002,8 C11.34,8,8.531,9.599,8.503,9.615C8.026,9.892,7.414,9.729,7.137,9.251C6.86,8.775,7.021,8.164,7.497,7.886 c0.102-0.06,2.023-1.158,4.848-1.65c-0.218-0.606-0.438-1.217-0.442-1.225c-0.105-0.235-0.348-0.383-0.604-0.357 c-0.162,0.013-3.995,0.343-6.451,2.318C3.564,8.158,1,15.092,1,21.087c0,0.106,0.027,0.209,0.08,0.301 c1.771,3.11,6.599,3.924,7.699,3.959c0.007,0.001,0.013,0.001,0.019,0.001c0.194,0,0.377-0.093,0.492-0.25l1.19-1.612 c-2.61-0.629-3.99-1.618-4.073-1.679c-0.444-0.327-0.54-0.953-0.213-1.398c0.326-0.443,0.95-0.541,1.394-0.216 C7.625,20.217,10.172,22,15,22c4.847,0,7.387-1.79,7.412-1.808c0.444-0.322,1.07-0.225,1.395,0.221 c0.324,0.444,0.23,1.066-0.212,1.392c-0.083,0.061-1.456,1.048-4.06,1.677l1.175,1.615c0.115,0.158,0.298,0.25,0.492,0.25 c0.007,0,0.013,0,0.019-0.001c1.101-0.035,5.929-0.849,7.699-3.959c0.053-0.092,0.08-0.195,0.08-0.301 C29,15.092,26.436,8.158,25.12,6.946z M11,19c-1.105,0-2-1.119-2-2.5S9.895,14,11,14s2,1.119,2,2.5S12.105,19,11,19z M19,19 c-1.105,0-2-1.119-2-2.5s0.895-2.5,2-2.5s2,1.119,2,2.5S20.105,19,19,19z'></path>
      </svg>
    </>
  ),
  Medium: () => (
    <>
      <title>{defaultMetadata.title}</title>
      <meta name='description' content={defaultMetadata.description} />

      {/* OpenGraph Metadata */}
      <meta property='og:title' content={defaultMetadata.title} />
      <meta property='og:description' content={defaultMetadata.description} />
      <meta property='og:url' content={defaultMetadata.siteUrl} />
      <meta property='og:site_name' content={defaultMetadata.siteName} />
      {/* <meta property="og:image" content={defaultMetadata.imageUrl} /> */}
      <meta property='og:type' content='website' />

      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 32 32'
      >
        <path d='M8.5 7A8.5 8.5 0 108.5 24 8.5 8.5 0 108.5 7zM22 8A4 7.5 0 1022 23 4 7.5 0 1022 8zM28.5 9A1.5 6.5 0 1028.5 22 1.5 6.5 0 1028.5 9z'></path>
      </svg>
    </>
  ),
}
