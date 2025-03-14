'use client'
import { useEffect, useState } from "react"
import axios from 'axios';
import { useAppSelector } from '@/lib/hooks'

type Client = {
  id: string,
  firstName: string,
  lastName: string,
  email:string,
  role: string
}
const Page = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [clientsOfProject, setClientsOfProject] = useState<Client[]>([])
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value)
  useEffect(()=>{
    const fetchData = async () => {
      const clients = await axios.get("/api/dashboard/projects/clients")
      const clientsOfProject = await axios.post("/api/dashboard/projects/clients", {idCurrentProject: idCurrentProject})
      setClients(clients.data)
      setClientsOfProject(clientsOfProject.data)    
    }

    fetchData()
  }, [])
  console.log(clientsOfProject)
  const hadnleAddUserToProject = async(userId: string) =>{
    await axios.post("/api/dashboard/projects/addUser", {projectId: idCurrentProject, userId: userId})
  }
  if (clients) 
    return (
      <div>
          <div className="p-4">
            <h1 className="mb-4 font-bold text-2xl">Клиенты проекта</h1>
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
                {clientsOfProject.map(client => (
                  <tr key={client.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{client.id}</td>
                    <td className="px-4 py-2 border-b">{client.firstName}</td>
                    <td className="px-4 py-2 border-b">{client.lastName}</td>
                    <td className="px-4 py-2 border-b">{client.email}</td>
                    <td className="px-4 py-2 border-b">{client.role}</td>
                    <td className="px-4 py-2 border-b"><button>Add to project</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          

          <div className="p-4">
            <h1 className="mb-4 font-bold text-2xl">Все Клиенты</h1>
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
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{client.id}</td>
                    <td className="px-4 py-2 border-b">{client.firstName}</td>
                    <td className="px-4 py-2 border-b">{client.lastName}</td>
                    <td className="px-4 py-2 border-b">{client.email}</td>
                    <td className="px-4 py-2 border-b">{client.role}</td>
                    <td className="px-4 py-2 border-b"><button onClick={() => hadnleAddUserToProject(client.id)}>Add to project</button></td>
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