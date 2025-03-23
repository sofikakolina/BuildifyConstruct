'use client'
import { useEffect, useState } from "react"
import axios from 'axios';
import { useAppSelector } from '@/lib/hooks'
// import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";

type User = {
  id: string,
  firstName: string,
  lastName: string,
  email:string,
  role: string
}
const Page = () => {
  const [documents, setDocuments] = useState<User[]>([])
  // const [usersOfProject, setUsersOfProject] = useState<User[]>([])
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value)
  useEffect(()=>{
    const fetchData = async () => {
      const users = await axios.get("/api/dashboard/projects/tasks/documents", {
        params: {idCurrentProject: idCurrentProject}
      })
      // const usersOfProject = await axios.post("/api/dashboard/projects/clients", {idCurrentProject: idCurrentProject})
      setDocuments(users.data)
      // setUsersOfProject(usersOfProject.data)    
    }

    fetchData()
  }, [idCurrentProject])
  const hadnleAddUserToProject = async(userId: string) =>{
    try{
      const addUser = await axios.post("/api/dashboard/projects/addDeleteUser", {projectId: idCurrentProject, userId: userId})
      if (addUser.status == 200){
        // setUsersOfProject(addUser.data.users)
        console.log(addUser)
        toast.success('Клиент добавлен в проект!');
      }
    } catch (error) {
      toast(`${error}`)
    }
  }
  // const hadnleDeleteUserFromProject = async(userId: string) =>{
  //   try{
  //       const deleteUser = await axios.delete("/api/dashboard/projects/addDeleteUser", {
  //       params: {
  //         projectId: idCurrentProject,
  //         userId: userId,
  //       },
  //     })
  //     if (deleteUser.status == 200){
  //       setUsersOfProject(prev => prev.filter(user => user.id != userId))
  //       toast.success('Клиент удален из проекта!');
  //     }
  //   } catch (error) {
  //     toast(`${error}`)
  //   }
  // }

  if (documents) 
    return (
      <div>
          <div className="p-4">
            <h1 className="mb-4 font-bold text-gold text-2xl">Все Клиенты</h1>
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
              <tbody>
                {documents.map(user => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{user.id}</td>
                    <td className="px-4 py-2 border-b">{user.firstName}</td>
                    <td className="px-4 py-2 border-b">{user.lastName}</td>
                    <td className="px-4 py-2 border-b">{user.email}</td>
                    <td className="px-4 py-2 border-b">{user.role}</td>
                    <td className="px-4 py-2 border-b">
                      <button 
                        onClick={() => hadnleAddUserToProject(user.id)} 
                        className="bg-green-500 p-3 rounded-full"
                      >
                        <IoMdAdd size={20} className="text-white"/>
                      </button>
                    </td>
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