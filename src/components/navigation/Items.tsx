type Props = {
    role: string
}

export const AdminMenuItems = [
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

export const ExecuteMenuItems = [
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

export const ClientMenuItems = [
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




const Items = ({role}: Props) => {

    switch(role){
        case "Admin": return AdminMenuItems
        case "Executer": return AdminMenuItems
        case "Client": return AdminMenuItems
    }
}

export default Items