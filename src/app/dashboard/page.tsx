"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/general/ProjectCard";
import axios from "axios";

interface Project {
  id: string;
  name: string;
  description: string;
  adminId: string;
  createdAt: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Запрашиваем данные с API
    const fetchProjects = async () => {
      try {
        axios.get("api/python/stairs")
        const response = await fetch("/api/dashboard/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // const handlePythonApi = async() => {
  //   axios.get("api/python/doors")
  // }
  return (
    <div
      className="flex flex-col justify-items-center items-start gap-16 p-8 sm:p-20 pb-20 font-[family-name:var(--font-geist-sans)]"
      style={{ height: "calc(100vh - 50px)" }}
    >
      <div className="flex justify-between w-full">
        {/* <button onClick={handlePythonApi}>
          Питон апи
        </button> */}
        <Link
          href="/dashboard/create-project"
          className="bg-blue-500 hover:bg-blue-600 shadow-md px-6 py-3 rounded-lg text-white transition-colors"
        >
          Создать проект
        </Link>
        <Link
          href="/dashboard/users"
          className="bg-green-500 hover:bg-green-600 shadow-md px-6 py-3 rounded-lg text-white transition-colors"
        >
          Пользователи
        </Link>
      </div>
      <div className="gap-8 grid grid-cols-3 w-full h-full">
        {projects.map((project) => (
          <ProjectCard key={project.id} item={{ id: project.id, name: project.name }} />
        ))}
      </div>
    </div>
  );
}