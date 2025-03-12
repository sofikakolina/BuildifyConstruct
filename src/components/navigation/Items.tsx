import { Role } from '@prisma/client';

export const AdminMenuItems = [
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