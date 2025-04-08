'use client'
const Page = () => {

  return (
    <div>
        <div className="p-4">
          <h1 className="mb-4 font-bold text-gold text-2xl">Сообщения</h1>
          <table className="bg-white border border-gray-300 min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-start">ID</th>
                <th className="px-4 py-2 border-b text-start">Имя</th>
                <th className="px-4 py-2 border-b text-start">Фамилия</th>
                <th className="px-4 py-2 border-b text-start">Email</th>
                <th className="px-4 py-2 border-b text-start">Роль</th>
                <th className="px-4 py-2 border-b text-start"></th>
              </tr>
            </thead>
          </table>
        </div>
    </div>
  )

}

export default Page