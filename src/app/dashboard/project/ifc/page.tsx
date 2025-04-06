'use client';
import { useEffect, useState } from "react";
import axios from 'axios'; // Импортируем AxiosError для типизации ошибок
import { useAppSelector } from '@/lib/hooks';
import toast from "react-hot-toast";
import IFCViewer from "@/components/dashboard/project/ifc/IFCViewer";
import { GrStatusGood } from "react-icons/gr";
import { AiOutlineClockCircle } from "react-icons/ai";
import { TbProgressDown } from "react-icons/tb"; // Загрузка
import { TbProgressCheck } from "react-icons/tb"; // Успех
import { TbProgressX } from "react-icons/tb"; // Неудача
import { RiProgress6Line } from "react-icons/ri"; // Ожидание
import { TbProgress } from "react-icons/tb"; // Ожидание


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
  
    // Создаем объект с материалами и их статусами
    const materials = [
      { name: 'Крыши', endpoint: '/api/python/roofs', status: 'pending' },
      { name: 'Стены', endpoint: '/api/python/walls', status: 'pending' },
      { name: 'Балки', endpoint: '/api/python/beams', status: 'pending' },
      { name: 'Ограждения', endpoint: '/api/python/railings', status: 'pending' },
      { name: 'Колонны', endpoint: '/api/python/columns', status: 'pending' },
      { name: 'Двери', endpoint: '/api/python/doors', status: 'pending' },
      { name: 'Плиты', endpoint: '/api/python/slabs', status: 'pending' },
      { name: 'Лестницы', endpoint: '/api/python/stairs', status: 'pending' },
      { name: 'Окна', endpoint: '/api/python/windows', status: 'pending' }
    ];
  
//     import { TbProgressDown } from "react-icons/tb"; // Загрузка
// import { TbProgressCheck } from "react-icons/tb"; // Успех
// import { TbProgressX } from "react-icons/tb"; // Неудача
// import { RiProgress6Line } from "react-icons/ri"; // Ожидание
// import { TbProgress } from "react-icons/tb"; // Ожидание

    // Функция для обновления toast с текущими статусами
    const updateToast = () => {
      const message = (
        <div>
          <div className="font-bold mb-2">Экспорт материалов:</div>
          {materials.map((material, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="min-w-[100px]">{material.name}</span>
              {material.status === 'pending' && (
                <span className="flex gap-2 text-yellow-400"><TbProgress size={20}/> Не начат</span>
              )}
              {material.status === 'loading' && (
                <span className="flex gap-2 text-blue-500"><TbProgressDown size={20}/> В процессе</span>
              )}
              {material.status === 'success' && (
                <span className="flex gap-2 text-green-500"><TbProgressCheck size={20}/> Успешно</span>
              )}
              {material.status === 'error' && (
                <span className="flex gap-2 text-red-500"><TbProgressX size={20}/> Ошибка</span>
              )}
            </div>
          ))}
        </div>
      );
  
      toast.loading(message, { id: loadingToast });
    };
  
    const loadingToast = toast.loading('Подготовка к экспорту материалов...');
  
    try {
      // Функция для выполнения запроса с повторением при ошибках
      const fetchWithRetry = async (endpoint: string, materialIndex: number, retries = 5) => {
        try {
          // Обновляем статус на "loading"
          materials[materialIndex].status = 'loading';
          updateToast();
  
          const response = await axios.get(endpoint, {
            params: { ifcId: ifcFile.id },
            timeout: 12000000
          });
  
          // Обновляем статус на "success"
          materials[materialIndex].status = 'success';
          updateToast();
  
          return response;
        } catch (error) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log(`Повторная попытка для ${endpoint}, осталось попыток: ${retries - 1}`);
            return fetchWithRetry(endpoint, materialIndex, retries - 1);
          }
  
          // Обновляем статус на "error"
          materials[materialIndex].status = 'error';
          updateToast();
  
          throw error;
        }
      };
  
      // Выполняем запросы последовательно
      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        await fetchWithRetry(material.endpoint, i);
        await new Promise(resolve => setTimeout(resolve, 500)); // Небольшая задержка
      }
  
      // Финальное сообщение об успехе
      toast.success(
        <div>
          <div className="font-bold">Все материалы успешно экспортированы!</div>
          <div className="text-sm text-gray-600 mt-1">
            Экспортировано {materials.filter(m => m.status === 'success').length} из {materials.length} материалов
          </div>
        </div>, 
        { id: loadingToast, duration: 5000 }
      );
    } catch (error) {
      console.error('Export failed:', error);
  
      // Подсчитываем успешные и неуспешные экспорты
      const successCount = materials.filter(m => m.status === 'success').length;
      const errorCount = materials.filter(m => m.status === 'error').length;
  
      let errorMessage = 'Ошибка при экспорте материалов';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      toast.error(
        <div>
          <div className="font-bold">{errorMessage}</div>
          <div className="text-sm text-gray-600 mt-1">
            Успешно: {successCount}, Ошибка: {errorCount}
          </div>
        </div>, 
        { id: loadingToast, duration: 5000 }
      );
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