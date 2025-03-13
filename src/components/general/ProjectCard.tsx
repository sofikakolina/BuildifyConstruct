import Link from 'next/link'
import React from 'react'
import { useAppDispatch } from '@/lib/hooks'
import {
  setIdCurrentProject,
} from '@/lib/features/idCurrentProjectSlice/idCurrentProjectSlice'

type Props = {
    item:{
        id: string,
        name: string
    }
}

const ProjectCard = ({item}: Props) => {
  const dispatch = useAppDispatch()
  return (
    <Link 
      href={`/dashboard/project/${item.id}`} 
      className='flex justify-center items-center bg-primary rounded-md w-full aspect-[16/9]'
      onClick={()=>{dispatch(setIdCurrentProject(item.id))}}
    >
        <h3 className='text-white'>{item.name}</h3>
    </Link>
  )
}

export default ProjectCard