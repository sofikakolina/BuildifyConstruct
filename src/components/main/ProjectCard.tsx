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
    <Link href={`project/${item.id}`} className=' bg-primary w-full flex items-center justify-center rounded-md'>
        <h3 className='text-white'>{item.name}</h3>
    </Link>
  )
}

export default ProjectCard