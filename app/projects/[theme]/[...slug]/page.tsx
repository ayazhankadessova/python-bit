'use client'

import { projects } from '#site/content'
import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/mdx-components'
import { SharePost } from '@/components/share-post'
import { siteConfig } from '@/config/site'
import BackButton from '@/components/ui/backbutton'
import PythonResizableCodeEditor from '@/components/code-resizable-executor'
import { getExerciseById } from '@/lib/projects/utils'
import { ProjectStatus } from '@/components/projects/project-status'
import '@/styles/mdx-style.css'
import { useState, useEffect } from 'react'

interface PostPageProps {
  params: {
    slug: string[]
  }
}

// --- Section Component ---
// The section content is initially blurred until the user clicks "next".
function Section({ 
  item, 
  index, 
  unlocked, 
  setUnlockedSections, 
  totalSections,
  hiddenButtons, 
  setHiddenButtons
}: { 
  item: any; 
  index: number; 
  unlocked: boolean; 
  setUnlockedSections: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>; 
  totalSections: number; 
  hiddenButtons: { [key: number]: boolean };
  setHiddenButtons: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
}) {
  const handleNext = () => {
    setUnlockedSections(prev => ({ ...prev, [index + 1]: true}));
    setHiddenButtons(prev => ({ ...prev, [index]: true }));
  };  

  return (
    <div className="relative mb-8" key={`section-${index}`}>
      {index !== 0 }
      
      {/* blur content if locked */}
      <div className={`${!unlocked ? 'filter blur-sm' : ''}`}>
        {item.title && (
          <h2 className={item.title.trim().toLowerCase() === "conclusion" ? "text-2xl font-semibold my-4" : "text-lg font-semibold my-4"}>
            {item.title}
          </h2>
        )}
        {item.description && <p className="text-base mt-2">{item.description}</p>}
        {item.features && Array.isArray(item.features) && (
          <ul className="list-disc ml-6 my-2">
            {item.features.map((feature: string, idx: number) => (
              <li key={`feature-${index}-${idx}`} className="text-base">{feature}</li>
            ))}
          </ul>
        )}
        {item.code && typeof item.code === 'object' && item.code.content && (
          <pre className="bg-black p-4 rounded-lg my-4">
            <code className={`language-${item.code.language || 'python'}`}>
              {item.code.content}
            </code>
          </pre>
        )}
        {item.output && Array.isArray(item.output) && (
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg my-4 font-mono whitespace-pre-wrap">
            {item.output.join('\n')}
          </pre>
        )}
        {item.tips && Array.isArray(item.tips) && (
          <ul className="list-disc ml-6 my-2">
            {item.tips.map((tip: string, idx: number) => (
              <li key={`tip-${index}-${idx}`} className="text-xl">{tip}</li>
            ))}
          </ul>
        )}
        {item.final_note && <p className="text-xl mt-6">{item.final_note}</p>}
      </div>

      {/* next btn - only if unlocked & not last section */}
      {unlocked && index !== totalSections - 1 && !hiddenButtons[index] && (
        <div className="flex justify-end mt-4">
        <button   className="mt-4 px-3.5 py-1.5 bg-gradient-to-r from-green-500 to-green-700 
        text-white font-medium rounded-md
        transition-transform duration-300 hover:scale-105 hover:shadow-lg"
           onClick={handleNext}>
          next ->
        </button>
        </div>
      )}



    </div>
  );
}


// --- Data Fetching Functions ---
async function getPostFromParams(params: PostPageProps['params']) {
  const slug = params?.slug?.join('/');
  const post = projects.find((post) => post.slugAsParams === slug);
  return post;
}

async function getJsonFromParams(params: PostPageProps['params']) {
  const slug = params?.slug[0];
  try {
    const response = await fetch(`/projects/${slug}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON for ${slug}`);
    }
    const jsonData = await response.json();
    console.log("this is json data: ", jsonData);
    return jsonData;
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return null;
  }
}

// --- Main Component ---
export default function ProjectPage({ params }: PostPageProps) {
  const [post, setPost] = useState<any>(null);
  const [exercise, setExercise] = useState<any>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [unlockedSections, setUnlockedSections] = useState<{ [key: number]: boolean }>({ 0: true });
  const [hiddenButtons, setHiddenButtons] = useState<{ [key: number]: boolean }>({});


  useEffect(() => {
    const fetchData = async () => {
      const fetchedPost = await getPostFromParams(params);
      const fetchedJson = await getJsonFromParams(params);

      if (!fetchedPost || !fetchedPost.published) {
        notFound();
      }

      setPost(fetchedPost);
      setJsonData(fetchedJson);

      if (fetchedPost) {
        const fetchedExercise = getExerciseById(fetchedPost.id);
        setExercise(fetchedExercise);
      }
    };

    fetchData();
  }, [params]);

  if (!post) {
    return <div>Loading...</div>;
  }

  const totalSections = jsonData?.sections?.length || 0;

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex-none px-4 py-4 border-b'>
        <div className='flex items-start justify-between'>
          <BackButton />
          <SharePost fullLink={`${siteConfig.url}/projects/${post.theme.trim().replace("", '-')}/${params?.slug?.join('/')}`} />
        </div>
      </div>

      <div className='flex flex-1 min-h-0'>
        <div className='w-1/2 overflow-y-auto border-r p-6'>
          <div className='max-w-3xl mx-auto'>
            <article className='prose prose-img:rounded-xl prose dark:prose-invert'>
              <h1 className='mb-2 text-foreground dark:text-foreground'>{post.title}</h1>
              <div className='my-4'>
                <ProjectStatus projectId={post.slugAsParams} detailed={true} />
              </div>
              {post.description && (
                <p className='text-xl mt-0 text-muted-foreground dark:text-muted-foreground'>{post.description}</p>
              )}
              <hr className='my-4' />
              <MDXContent code={post.body} />
              <div className="json-display">
                {jsonData?.sections?.map((section: any, index: number) => (
                  <Section
                    key={index}
                    item={section}
                    index={index}
                    unlocked={!!unlockedSections[index]}
                    setUnlockedSections={setUnlockedSections}
                    totalSections={totalSections}  
                    hiddenButtons={hiddenButtons}
                    setHiddenButtons={setHiddenButtons}
                  />
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className='w-1/2 overflow-hidden'>
          {exercise && (
            <PythonResizableCodeEditor initialCode={exercise?.starterCode} project_id={exercise?.id} isProject={true} />
          )}
        </div>
      </div>
    </div>
  );
}
