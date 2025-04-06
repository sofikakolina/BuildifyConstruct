'use client'
import Beams from "@/components/dashboard/project/materials/Beams"
import Columns from "@/components/dashboard/project/materials/Columns"
import Stairs from "@/components/dashboard/project/materials/Stairs"
import Railings from "@/components/dashboard/project/materials/Railings"
import Slabs from "@/components/dashboard/project/materials/Slabs"
import Doors from "@/components/dashboard/project/materials/Doors"
import Windows from "@/components/dashboard/project/materials/Windows"
import Walls from "@/components/dashboard/project/materials/Walls"
import Roofs from "@/components/dashboard/project/materials/Roofs"

import { useAppSelector } from "@/lib/hooks"
import axios from "axios"
import { useEffect, useState } from "react"

const Page = () => {
    const [ beams, setBeams] = useState(null)
    const [ columns, setColumns] = useState(null)
    const [ roofs, setRoofs] = useState(null)
    const [ walls, setWalls] = useState(null)
    const [ slabs, setSlabs] = useState(null)
    const [ windows, setWindows] = useState(null)
    const [ stairs, setStairs] = useState(null)
    const [ railings, setRailings] = useState(null)
    const [ doors, setDoors] = useState(null)
    const idCurrentProject = useAppSelector(state => state.idCurrentProject.value)
    console.log(roofs, walls, slabs, windows, doors)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoints = [
                    { name: 'beams', setter: setBeams },
                    { name: 'columns', setter: setColumns },
                    { name: 'roofs', setter: setRoofs },
                    { name: 'walls', setter: setWalls },
                    { name: 'slabs', setter: setSlabs },
                    { name: 'windows', setter: setWindows },
                    { name: 'stairs', setter: setStairs },
                    { name: 'railings', setter: setRailings },
                    { name: 'doors', setter: setDoors },     
                ];
                
                const requests = endpoints.map(({ name }) => 
                    axios.get(`/api/dashboard/projects/materials/${name}`, {
                        params: { projectId: idCurrentProject }
                    })
                );
                
                const responses = await Promise.all(requests);
                
                responses.forEach((response, index) => {
                    const { setter } = endpoints[index];
                    const dataKey = endpoints[index].name;
                    setter(response.data[dataKey]);
                });
                
            } catch (error) {
                console.error('Error fetching materials:', error);
            }
        }
        fetchData()
    }, [])
    console.log(beams)

    return (
        <div className="flex flex-col gap-5">
            <h1 className="font-bold text-gold text-3xl">Материалы</h1>
            <div className="flex flex-col gap-3">
                <Beams beams={beams}/>
                <Columns columns={columns}/>
                <Stairs stairs={stairs}/>
                <Railings railings={railings}/>
                <Slabs slabs={slabs}/>
                <Doors doors={doors}/>
                <Windows windows={windows}/>
                <Walls walls={walls}/>
                <Roofs roofs={roofs}/>
            </div>
        </div>
    )
}

export default Page