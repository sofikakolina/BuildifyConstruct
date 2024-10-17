import Link from 'next/link'
import React from 'react'
import { NavbarHeight, SidebarWidth } from './Sizes'
import { getSidebarItems } from './Items'

const Sidebar = () => {
	const role = "Admin"
	const menuItems = getSidebarItems({role})

	return (
		<div
			className="bg-primary absolute border-t-2 border-t-[#0000001f] flex justify-center"
			style={{
				width: `${SidebarWidth}px`,
				height: `calc(100vh - ${NavbarHeight}px)`,
				top: `${NavbarHeight}px`
			}}
		>
	        <div className='flex flex-col gap-0 pt-10'>
				{
					menuItems.map((item, index) => (
						<Link
							href={item.path}
							className='text-white px-10 py-3'
							key={index}
						>
							{item.text}
						</Link>
					))
				}
			</div>
		</div>
	)
}

export default Sidebar