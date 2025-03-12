import ProjectCard from "../../components/general/ProjectCard";
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
      className="flex flex-col justify-items-center items-start gap-16 p-8 sm:p-20 pb-20 font-[family-name:var(--font-geist-sans)]"
      style={{ height: "calc(100vh - 50px)" }}
    >
      <Link href="/create-project">Создать проект...</Link>
      <div className="gap-8 grid grid-cols-3 w-full h-full">
        {
          projectItems.map(item => <ProjectCard item={item} key={item.id} />)
        }
      </div>
    </div>
  );
}
