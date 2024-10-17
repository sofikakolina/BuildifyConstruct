import { NavbarHeight } from './Sizes'
const Navbar = () => {
  console.log(NavbarHeight)

  return (
    <div 
      style={{ height: `${NavbarHeight}px` }}
      className={`bg-primary flex justify-center`}
    >
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