'use client';
import { useEffect, useState } from "react";
import axios from 'axios';
import { useAppSelector } from '@/lib/hooks';
import toast from "react-hot-toast";
import { TextField, Button } from "@mui/material";
import { MdDelete, MdAdd } from 'react-icons/md';
// import { downloadFile } from "@/lib/download";

interface GasnItem {
  id: string;
  name: string;
  countOfUnit: number;
  unit: string;
  justification: string;
  normalHoursPeaple: number;
  machine: string;
  normalHoursMashine: number;
  crew: string;
  volumeCalculation?: string;
}

const Gasn = () => {
  const [gasnList, setGasnList] = useState<GasnItem[]>([]);
  const [newGasn, setNewGasn] = useState<Omit<GasnItem, 'id'>>({
    name: '',
    countOfUnit: 0,
    unit: '',
    justification: '',
    normalHoursPeaple: 0,
    machine: '',
    normalHoursMashine: 0,
    crew: '',
    volumeCalculation: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);

  useEffect(() => {
    const fetchGasn = async () => {
      try {
        const { data } = await axios.get("/api/dashboard/projects/gasn", {
          params: { projectId: idCurrentProject }
        });
        setGasnList(data.gasn);
      } catch (error) {
        toast.error(`Ошибка загрузки ГЭСН: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    };

    if (idCurrentProject) fetchGasn();
  }, [idCurrentProject]);

  const handleCreateGasn = async () => {
    try {
      const { data } = await axios.post("/api/dashboard/projects/gasn", {
        ...newGasn,
        projectId: idCurrentProject
      });
      
      setGasnList(prev => [...prev, data.gasn]);
      setNewGasn({
        name: '',
        countOfUnit: 0,
        unit: '',
        justification: '',
        normalHoursPeaple: 0,
        machine: '',
        normalHoursMashine: 0,
        crew: '',
        volumeCalculation: ''
      });
      setIsCreating(false);
      toast.success("ГЭСН успешно создан!");
    } catch (error) {
      toast.error(`Ошибка создания ГЭСН: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleDeleteGasn = async (id: string) => {
    try {
      await axios.delete("/api/dashboard/projects/gasn", {
        params: { gasnId: id }
      });
      setGasnList(prev => prev.filter(item => item.id !== id));
      toast.success("ГЭСН успешно удален!");
    } catch (error) {
      toast.error(`Ошибка удаления ГЭСН: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGasn(prev => ({
      ...prev,
      [name]: name.includes('countOfUnit') || 
              name.includes('normalHours') || name.includes('numberOf') ? 
              Number(value) : value
    }));
  };

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Управление ГЭСН</h1>
      
      <div className="mb-6">
        <button 
          className="bg-gold text-white flex items-center px-5 py-2 rounded-lg"
          onClick={() => setIsCreating(true)}
        >
          <MdAdd />Добавить ГЭСН
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Создать новый ГЭСН</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Название"
              name="name"
              value={newGasn.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Единица измерения"
              name="unit"
              value={newGasn.unit}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Количество единиц"
              name="countOfUnit"
              type="number"
              value={newGasn.countOfUnit}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Обоснование"
              name="justification"
              value={newGasn.justification}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Норма часов (люди)"
              name="normalHoursPeaple"
              type="number"
              value={newGasn.normalHoursPeaple}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Машина"
              name="machine"
              value={newGasn.machine}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Норма часов (машина)"
              name="normalHoursMashine"
              type="number"
              value={newGasn.normalHoursMashine}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Состав бригады"
              name="crew"
              value={newGasn.crew}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Расчет объема"
              name="volumeCalculation"
              value={newGasn.volumeCalculation}
              onChange={handleInputChange}
              fullWidth
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outlined" 
			  color="error"
              onClick={() => setIsCreating(false)}
            >
              Отмена
            </Button>
            <button
			  className="bg-gold text-white flex items-center px-5 py-2 rounded-lg"
              onClick={handleCreateGasn}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ед. изм.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Обоснование</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Объем работ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gasnList.map((gasn) => (
              <tr key={gasn.id}>
                <td className="px-6 py-4 whitespace-nowrap">{gasn.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{gasn.countOfUnit} {gasn.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">{gasn.justification}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleDeleteGasn(gasn.id)} 
                    className="text-red-500 hover:text-red-700"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Gasn;