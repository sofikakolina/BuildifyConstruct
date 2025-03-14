'use client'
import { useEffect, useState } from "react"
import axios from 'axios';

export type Worker = {
  id: string,
  firstName: string,
  lastName: string,
  email:string,
  role: string
}
const Page = () => {
  const [team, setTeam] = useState<Worker[]>([])

  useEffect(()=>{
    const fetchData = async () => {
      const team = await axios.get("/api/dashboard/projects/team")
      setTeam(team.data)
    }
    fetchData()
  }, [])
  console.log(team)

  if (team) 
    return (
      <div>
          <div className="p-4">
            <h1 className="mb-4 font-bold text-2xl">Команда проекта</h1>
            <table className="bg-white border border-gray-300 min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-start">ID</th>
                  <th className="px-4 py-2 border-b text-start">Имя</th>
                  <th className="px-4 py-2 border-b text-start">Фамилия</th>
                  <th className="px-4 py-2 border-b text-start">Email</th>
                  <th className="px-4 py-2 border-b text-start">Роль</th>
                </tr>
              </thead>
              <tbody>
                {team.map(worker => (
                  <tr key={worker.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{worker.id}</td>
                    <td className="px-4 py-2 border-b">{worker.firstName}</td>
                    <td className="px-4 py-2 border-b">{worker.lastName}</td>
                    <td className="px-4 py-2 border-b">{worker.email}</td>
                    <td className="px-4 py-2 border-b">{worker.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          

          <div className="p-4">
            <h1 className="mb-4 font-bold text-2xl">Все Работники</h1>
            <table className="bg-white border border-gray-300 min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-start">ID</th>
                  <th className="px-4 py-2 border-b text-start">Имя</th>
                  <th className="px-4 py-2 border-b text-start">Фамилия</th>
                  <th className="px-4 py-2 border-b text-start">Email</th>
                  <th className="px-4 py-2 border-b text-start">Роль</th>
                </tr>
              </thead>
              <tbody>
                {team.map(worker => (
                  <tr key={worker.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{worker.id}</td>
                    <td className="px-4 py-2 border-b">{worker.firstName}</td>
                    <td className="px-4 py-2 border-b">{worker.lastName}</td>
                    <td className="px-4 py-2 border-b">{worker.email}</td>
                    <td className="px-4 py-2 border-b">{worker.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    )
  
    return(
      <div>Вы не собрали команду</div>
    )
}

export default Page