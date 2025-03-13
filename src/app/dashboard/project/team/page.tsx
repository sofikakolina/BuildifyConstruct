'use client'
import { useEffect, useState } from "react"
import axios from 'axios';

const Page = () => {
  const [team, setTeam] = useState([])

  useEffect(()=>{
    const fetchData = async () => {
      const team = await axios.get("/api/dashboard/team")
      setTeam(team.data)
      console.log(team)
    }
    fetchData()
  }, [])
  if (team) 
    return (
      <div>page</div>
    )
  
    return(
      <div>Вы не собрали команду</div>
    )
}

export default Page