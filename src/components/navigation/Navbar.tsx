import React from 'react'
import { NavbarHeight } from './Sizes'

const Navbar = () => {
  return (
    <div className={`bg-primary flex justify-center h-[${NavbarHeight}px]`}>
        <div className='flex justify-between container items-center'>
            <div>
              <h1 className='text-white text-2xl'>BuildifyConstruct</h1>
            </div>
            <div className='flex items-center gap-3'>
              <h3 className='text-white'>Колдин Тимур</h3>
              <div className='p-4 bg-gray-400 rounded-full'></div>
            </div>
        </div>
    </div>
  )
}

export default Navbar