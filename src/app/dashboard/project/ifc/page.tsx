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

  const handleMaterialExport = async () => {
    if (!ifcFile?.path) {
      toast.error('IFC path not found');
      return;
    }
  
    const loadingToast = toast.loading('Экспорт материалов...');
  
    try {
      const endpoints = [
        "/api/python/roofs",
        "/api/python/walls",
        "/api/python/beams",
        "/api/python/railings",
        "/api/python/columns",
        "/api/python/doors",
        "/api/python/slabs",
        "/api/python/stairs",
        "/api/python/windows"
      ];
  
      // Функция для выполнения запроса с повторением при ошибках
      const fetchWithRetry = async (endpoint: string, retries = 5) => {
        try {
          const response = await axios.get(endpoint, {
            params: { ifcPath: ifcFile.path },
            timeout: 12000000
          });
          return response;
        } catch (error) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Ждем 3 секунды
            console.log(`Повторная попытка для ${endpoint}, осталось попыток: ${retries - 1}`);
            return fetchWithRetry(endpoint, retries - 1);
          }
          throw error; // Если попытки закончились, пробрасываем ошибку дальше
        }
      };
  
      // Выполняем запросы последовательно
      for (const endpoint of endpoints) {
        await fetchWithRetry(endpoint);
        await new Promise(resolve => setTimeout(resolve, 500)); // Небольшая задержка между разными эндпоинтами
      }
      
      toast.success('Материалы успешно экспортированы!', { id: loadingToast });
    } catch (error) {
      console.error('Export failed:', error);
      
      let errorMessage = 'Ошибка при экспорте материалов';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <div>
      <div className="flex flex-col p-4">
        <h1 className="mb-4 font-bold text-gold text-2xl">IFC-файлы</h1>
        <div className="flex justify-between items-center">
          <input
            type="file"
            accept=".ifc"
            onChange={handleFileUpload}
            className=""
          />
          <button onClick={handleMaterialExport} className="bg-gold px-5 py-2 rounded-lg">Экспортировать материалы</button>
        </div>
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