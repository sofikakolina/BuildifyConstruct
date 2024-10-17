import ProjectCard from "@/components/main/ProjectCard";
import Link from "next/link";

const projectItems = [
  {
    id: "dsfsdkk33k",
    name: "Дом 16-этажный бирюлево",
  },
  {
    id: "dsfsdkk33k",
    name: "Дом 10-этажный вешняки",
  },
  {
    id: "dsfsdkk33k",
    name: "Дом 41-этажный металлурги",
  },
  {
    id: "dsfsdkk33k",
    name: "Дом 41-этажный щелково",
  },

]

export default function Home() {
  return (
    <div
      className="flex flex-col items-start justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      style={{ height: "calc(100vh - 50px)" }}
    >
      <Link href="/create-project">Создать проект...</Link>
      <div className="grid grid-cols-3 gap-8 w-full h-full">
        {
          projectItems.map(item => <ProjectCard item={item} key={item.id} />)
        }
      </div>
    </div>
  );
}
