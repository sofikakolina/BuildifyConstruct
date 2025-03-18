'use client';
import { useEffect, useState } from "react";
import axios from 'axios'; // Импортируем AxiosError для типизации ошибок
import { useAppSelector } from '@/lib/hooks';
import toast from "react-hot-toast";
import IFCViewer from "@/components/dashboard/project/ifc/IFCViewer";

type IFC = {
  id: string;
  name: string;
  title: string;
  path: string;
  projectId: string;
  createdAt: string;
};

const Page = () => {
  const [ifcFile, setIfcFile] = useState<IFC | null>(null);
  const [selectedIFC, setSelectedIFC] = useState<IFC | null>(null);
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/dashboard/projects/ifc", {
          params: {
            projectId: idCurrentProject,
          },
        });
        setIfcFile(response.data.ifc);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Ошибка: ${error.message}`);
        } else {
          toast.error("Произошла неизвестная ошибка");
        }
      }
    };

    fetchData();
  }, [idCurrentProject]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", idCurrentProject);

    try {
      const response = await axios.post("/api/dashboard/projects/ifc", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setIfcFile(response.data.ifc); // Заменяем существующий IFC-файл
        toast.success("IFC-файл успешно загружен!");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Обработка ошибок Axios
        if (error.response?.data?.error === "An IFC file already exists for this project") {
          toast.error("IFC-файл уже существует для этого проекта. Удалите его перед загрузкой нового.");
        } else {
          toast.error("Не удалось загрузить IFC-файл");
        }
      } else if (error instanceof Error) {
        // Обработка других ошибок
        toast.error(`Ошибка: ${error.message}`);
      } else {
        toast.error("Произошла неизвестная ошибка");
      }
    }
  };

  const handleViewIFC = (ifc: IFC) => {
    setSelectedIFC(ifc); // Устанавливаем выбранный IFC-файл для просмотра
  };

  return (
    <div>
      <div className="flex flex-col p-4">
        <h1 className="mb-4 font-bold text-gold text-2xl">IFC-файлы</h1>
        <input
          type="file"
          accept=".ifc"
          onChange={handleFileUpload}
          className="mb-4"
        />
      </div>

      <div className="p-4">
        <table className="bg-white border border-gray-300 min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-start">ID</th>
              <th className="px-4 py-2 border-b text-start">Название</th>
              <th className="px-4 py-2 border-b text-start">Описание</th>
              <th className="px-4 py-2 border-b text-start">Путь</th>
              <th className="px-4 py-2 border-b text-start">Дата создания</th>
              <th className="px-4 py-2 border-b text-start">Действия</th>
            </tr>
          </thead>
          <tbody>
            {ifcFile && (
              <tr key={ifcFile.id}>
                <td className="px-4 py-2 border-b">{ifcFile.id}</td>
                <td className="px-4 py-2 border-b">{ifcFile.name}</td>
                <td className="px-4 py-2 border-b">{ifcFile.title}</td>
                <td className="px-4 py-2 border-b">{ifcFile.path}</td>
                <td className="px-4 py-2 border-b">{new Date(ifcFile.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleViewIFC(ifcFile)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Просмотр
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Отображение IFC-файла */}
      {selectedIFC && (
        <div className="p-4">
          <h2 className="mb-4 font-bold text-gold text-xl">Просмотр: {selectedIFC.name}</h2>
          <IFCViewer filePath={selectedIFC.path} />
        </div>
      )}
    </div>
  );
};

export default Page;