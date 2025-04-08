'use client'
import WorkVolume from "@/components/dashboard/project/workVolume/WorkVolume"
const Page = () => {

  return (
    <div>
        <div className="p-4">
          <h1 className="mb-4 font-bold text-gold text-2xl">Ведомость объема работ</h1>
          <WorkVolume/>
        </div>
    </div>
  )

}

export default Page