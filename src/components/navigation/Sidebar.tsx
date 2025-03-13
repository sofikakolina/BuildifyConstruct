"use client"
import Link from 'next/link'
import React from 'react'
import { NavbarHeight, SidebarWidth } from './Sizes'
import { getSidebarItems } from './Items'
import { useSession } from "next-auth/react";
import { Role } from '@prisma/client';

const Sidebar = () => {
	const { data: session } = useSession();
	const menuItems = getSidebarItems({role: session?.user.role as Role})

	return (
		<div
			className="absolute flex justify-center bg-primary border-t-[#0000001f] border-t-2"
			style={{
				width: `${SidebarWidth}px`,
				height: `calc(100vh - ${NavbarHeight}px)`,
				top: `${NavbarHeight}px`
			}}
		>
	        <div className='flex flex-col gap-0 pt-10'>
				{ menuItems &&
					menuItems.map((item, index) => (
						<Link
							href={item.path}
							className='px-10 py-3 text-white'
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