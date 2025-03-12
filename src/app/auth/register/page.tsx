"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { Role } from '@prisma/client';

const roles: Role[] = ["Executer", "Client"];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "" as Role,
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { email, password, firstName, lastName, role } = formData;

    if (!email || !password || !firstName || !lastName || !role) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      // Регистрация успешна, перенаправляем на страницу входа
      router.push("/auth/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md p-8 rounded-lg w-full max-w-md">
        <h1 className="mb-6 font-bold text-2xl text-center">Регистрация</h1>
        {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block font-medium text-gray-700 text-sm">
              Имя
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block font-medium text-gray-700 text-sm">
              Фамилия
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700 text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block font-medium text-gray-700 text-sm">
              Роль
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full"
              required
            >
              <option value="" disabled>
                Выберите роль
              </option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block font-medium text-gray-700 text-sm">
              Пароль
            </label>
            <div className="flex items-center border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 h-full">
              <input
                type={showPassword ? "text" : `password`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block shadow-sm px-3 py-2 border border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full"
                required
              >
              </input>
              <div>
                <button
                  className="block px-3 h-[41px] cursor-pointer"
                  onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <FaRegEyeSlash/>: <FaRegEye/>}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="bg-gold hover:bg-gold-hover px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full text-white"
            >
              Зарегестрироваться
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            Есть аккаунт?{" "}
            <a href="/auth/signin" className="text-blue-500 hover:underline">
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}