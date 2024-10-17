import Link from 'next/link'
import React from 'react'
import { NavbarHeight, SidebarWidth } from './Sizes'

export const menuItems = [
		{
			text: 'Аналитика',
			path: '/dashboard/users',
		},
		{
			text: 'Календарный график',
			path: '/dashboard/taxes',
		},
		{
			text: 'Ведомость объемов работ',
			path: '/dashboard/products'
		},
		{
			text: 'Конъюктурный анализ',
			path: '/dashboard/productsRequests'
		},
		{
			text: 'Доска задач',
			path: '/dashboard/materials'
		},
		{
			text: 'Сообщения',
			path: '/dashboard/orders'
		},
		{
			text: 'Клиенты',
			path: '/dashboard/deliveryMethods'
		},
		{
			text: 'Команда проекта',
			path: '/dashboard/emailTemplates'
		},
		{
			text: 'Документы',
			path: '/dashboard/invoices'
		},
		{
			text: 'Платежные документы',
			path: '/dashboard/payments'
		},
		{
			text: 'Материалы',
			path: '/dashboard/payments'
		},
		{
			text: 'Расчет временных сооружений',
			path: '/dashboard/payments'
		},
		{
			text: 'Фотоотчеты',
			path: '/dashboard/payments'
		},
		{
			text: 'Инициализация закупок',
			path: '/dashboard/payments'
		}
]

const Sidebar = () => {
  return (
    <div className={`bg-primary w-[${SidebarWidth}px] h-[calc(100vh-${NavbarHeight}px)] absolute top-[${NavbarHeight}px]  border-t-2 border-t-[#0000001f] flex justify-center`}>
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