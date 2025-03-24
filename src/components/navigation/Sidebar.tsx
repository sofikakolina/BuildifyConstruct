"use client"
import Link from 'next/link'
import React from 'react'
import { NavbarHeight, SidebarWidth } from './Sizes'
import { getSidebarItems } from './Items'
import { useSession } from "next-auth/react";
import { Role } from '@prisma/client';
import { usePathname } from 'next/navigation'

const Sidebar = () => {
	const { data: session } = useSession();
	const menuItems = getSidebarItems({role: session?.user.role as Role})
	const urlPath = usePathname().split("/");
	const activePath = urlPath[urlPath.length - 1]
	console.log(activePath)
	return (
		<div
		className="fixed flex justify-center bg-primary border-t-[#0000001f] border-t-2 overflow-y-auto"
		style={{
			width: `${SidebarWidth}px`,
			height: `calc(100vh - ${NavbarHeight}px)`,
			top: `${NavbarHeight}px`,
			left: 0
		}}
		>
		<div className='flex flex-col gap-0 w-full'>
			{menuItems &&
			menuItems.map((item, index) => (
				<Link
					href={item.path}
					style={{background: activePath == item.path? "#f69220" : "" }}
					className='hover:bg-[#bb6a0e] mx-2 my-1 p-2w-full px-10 py-3 rounded-xl text-white transition-shadow duration-300'
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