import Link from 'next/link'
import React from 'react'

type Props = {
    item:{
        id: string,
        name: string
    }
}

const ProjectCard = ({item}: Props) => {
  return (
    <Link 
      href={`/dashboard/project/${item.id}`} 
      className='flex justify-center items-center bg-primary rounded-md w-full aspect-[16/9]'
    >
        <h3 className='text-white'>{item.name}</h3>
    </Link>
  )
}

export default ProjectCard