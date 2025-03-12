"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Запрашиваем данные с API
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/dashboard/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Пользователи</h1>
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
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b">{user.id}</td>
              <td className="px-4 py-2 border-b">{user.firstName}</td>
              <td className="px-4 py-2 border-b">{user.lastName}</td>
              <td className="px-4 py-2 border-b">{user.email}</td>
              <td className="px-4 py-2 border-b">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}