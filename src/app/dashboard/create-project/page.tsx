"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = await response.json();
      router.push(`/dashboard/project/${project.id}`); // Перенаправляем на страницу проекта
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-gold text-3xl">Create Project</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium text-gray-700">
            Название
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block font-medium text-gray-700">
            Описание
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-gold hover:bg-gold-hover px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-white"
        >
          Создать Проект
        </button>
      </form>
    </div>
  );
}