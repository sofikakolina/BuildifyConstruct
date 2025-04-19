'use client'
import { Role } from '@prisma/client';

export const AdminMenuItems = [
    { text: 'Аналитика', path: `/dashboard/project/analytics` },
    { text: 'Календарный график', path: `/dashboard/project/calendar` },
    { text: 'Ведомость объемов работ', path: `/dashboard/project/work-volume` },
    { text: 'ГЭСН/ЕНиР', path: `/dashboard/project/gasn` },
    // { text: 'Конъюктурный анализ', path: `market-analysis` },
    { text: 'Доска задач', path: `/dashboard/project/tasks` },
    { text: 'Сообщения', path: `/dashboard/project/messages` },
    { text: 'Клиенты', path: `/dashboard/project/clients` },
    { text: 'Команда проекта', path: `/dashboard/project/team` },
    { text: 'IFC', path: `/dashboard/project/ifc` },
    { text: 'Документы', path: `/dashboard/project/documents` },
    { text: 'Платежные документы', path: `/dashboard/project/payments` },
    { text: 'Фотоотчеты', path: `/dashboard/project/photo-reports` },
    { text: 'Материалы', path: `/dashboard/project/materials` },
    { text: 'Расчет временных сооружений', path: `/dashboard/project/temporary-structures` },
    { text: 'Инициализация закупок', path: `/dashboard/project/procurement` }
];

export const ExecuteMenuItems = [
    { text: 'Аналитика', path: '#' },
    { text: 'Календарный график', path: '#' },
    { text: 'Ведомость объемов работ', path: '#' },
    { text: 'Конъюктурный анализ', path: '#' },
    { text: 'Доска задач', path: '#' },
    { text: 'Сообщения', path: '#' },
    { text: 'Клиенты', path: '#' },
    { text: 'Команда проекта', path: '#' },
    { text: 'Документы', path: '#' },
    { text: 'Платежные документы', path: '#' },
    { text: 'Материалы', path: '#' },
    { text: 'Расчет временных сооружений', path: '#' },
    { text: 'Фотоотчеты', path: '#' },
    { text: 'Инициализация закупок', path: '#' }
]

export const ClientMenuItems = [
    { text: 'Аналитика', path: '#' },
    { text: 'Календарный график', path: '#' },
    { text: 'Ведомость объемов работ', path: '#' },
    { text: 'Конъюктурный анализ', path: '#' },
    { text: 'Доска задач', path: '#' },
    { text: 'Сообщения', path: '#' },
    { text: 'Клиенты', path: '#' },
    { text: 'Команда проекта', path: '#' },
    { text: 'Документы', path: '#' },
    { text: 'Платежные документы', path: '#' },
    { text: 'Материалы', path: '#' },
    { text: 'Расчет временных сооружений', path: '#' },
    { text: 'Фотоотчеты', path: '#' },
    { text: 'Инициализация закупок', path: '#' }
]

type Props = {
    role: Role
}

export function getSidebarItems({role}: Props){
    switch(role){
        case "Admin": return AdminMenuItems
        case "Executer": return ExecuteMenuItems
        case "Client": return ClientMenuItems
    }
}