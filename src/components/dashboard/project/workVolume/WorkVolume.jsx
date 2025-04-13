// React Component (WorkVolume.tsx)
'use client'

import { useAppSelector } from '@/lib/hooks';
import axios from 'axios';
import { useState, React, Fragment, useEffect } from 'react';

export default function WorkVolume() {
  const [expandedLevels, setExpandedLevels] = useState({});
  const [workVolume, setWorkVolume] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try { 
        const response = await axios.get(`/api/dashboard/projects/workVolume`, {
          params: { projectId: idCurrentProject }
        });
        setWorkVolume(response.data);
      } catch (error) {
        console.error('Error fetching work volume:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (idCurrentProject) {
      fetchData();
    }
  }, [idCurrentProject]);

  const calculateTypeTotals = (elements, type) => {
    // Параметры для разных типов элементов
    const typeConfig = {
      slabs: {
        name: 'Перекрытия',
        justification: "ГЭСН 07-01-006-06",
        unit: 'м3',
        laborCost: 213.12,
        machine: 'Кран',
        machineTime: 52.49,
        workers: 2,
        crew: 'Рабочие 3 разряда'
      },
      beams: {
        name: 'Балки',
        justification:"ГЭСН 06-07-001-02",
        unit: 'м3',
        laborCost: 213.12,
        machine: 'Кран',
        machineTime: 52.49,
        workers: 2,
        crew: 'Рабочие 3 разряда'
      },
      columns: {
        name: 'Колонны',
        justification:"ГЭСН 07-01-001-06",
        unit: 'шт',
        laborCost: 230.50,
        machine: 'Кран',
        machineTime: 45.30,
        workers: 2,
        crew: 'Рабочие 3 разряда'
      },
      stairs: {
        name: 'Лестницы',
        justification:"ГЭСН 29-01-216-01",
        unit: 'м3',
        laborCost: 150,
        machine: 'Бетономешалка',
        machineTime: 30,
        workers: 3,
        crew: 'Рабочие 4 разряда'
      },
      railings: {
        name: 'Ограждения',
        justification:"ГЭСН 07-05-016-03",
        unit: 'м.п.',
        laborCost: 85.75,
        machine: 'Сварочный аппарат',
        machineTime: 15.20,
        workers: 2,
        crew: 'Сварщики'
      },
      doors: {
        name: 'Двери',
        justification:"ГЭСН 09-04-012-01",
        unit: 'м3',
        laborCost: 120,
        machine: 'Электроинструмент',
        machineTime: 8.50,
        workers: 2,
        crew: 'Плотники'
      },
      windows: {
        name: 'Окна',
        justification:"ГЭСН 10-01-034-03",
        unit: 'м3',
        laborCost: 135,
        machine: 'Электроинструмент',
        machineTime: 10.25,
        workers: 2,
        crew: 'Монтажники'
      },
      walls: {
        name: 'Стены',
        justification:"ГЭСН 08-01-001-09",
        unit: 'м3',
        laborCost: 95.30,
        machine: 'Растворонасос',
        machineTime: 25.40,
        workers: 3,
        crew: 'Каменщики'
      },
      roofs: {
        name: 'Крыши',
        justification:"ГЭСН 12-01-002-06",
        unit: 'м2',
        laborCost: 110.75,
        machine: 'Кран',
        machineTime: 35.60,
        workers: 3,
        crew: 'Кровельщики'
      }
    };

    const config = typeConfig[type] || typeConfig.slabs;
    const isCountable = type === 'stairs' || type === 'doors' || type === 'windows';
    
    const volume = isCountable 
      ? elements.length 
      : elements.reduce((sum, el) => sum + (el.volume || 0), 0);
    const area = elements.reduce((sum, el) => sum + (el.area || 0), 0);
    
    const laborCost = config.laborCost;
    const totalLaborCost = volume * laborCost;
    const machineTime = config.machineTime;
    const totalMachineTime = volume * machineTime;
    
    return {
      type: config.name,
      volume: isCountable ? volume.toString() : volume.toFixed(2),
      // count: isCountable ? volume.toString() : volume.toFixed(2),
      unit: config.unit,
      justification: config.justification,
      laborCost: laborCost.toFixed(2),
      totalLaborCost: totalLaborCost.toFixed(2),
      machine: config.machine,
      machineTime: machineTime.toFixed(2),
      totalMachineTime: totalMachineTime.toFixed(2),
      workers: config.workers,
      machines: 1,
      shifts: 1,
      mechDuration: Math.ceil(totalMachineTime / (1 * 8 * 1)),
      nonMechDuration: Math.ceil(totalLaborCost / (8 * 1 * config.workers)),
      totalDuration: Math.max(
        Math.ceil(totalMachineTime / (1 * 8 * 1)),
        Math.ceil(totalLaborCost / (8 * 1 * config.workers))
      ),
      crew: config.crew,
      volumeCalc: isCountable 
        ? `Количество: ${volume} ${config.unit}`
        : type === 'walls' || type === 'roofs'
          ? `Площадь: ${area.toFixed(2)} м2`
          : `Объем: ${volume.toFixed(2)} м3`
    };
  };

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // Список типов элементов для отображения
  const elementTypes = [
    'columns', 'slabs', 'beams', 'stairs', 
    'railings', 'doors', 'windows', 'walls', 'roofs'
  ];

  return (
    <div className="">
      {isLoading ? (
        <div>Загрузка данных...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Этаж</th>
                <th className="border p-2">Тип</th>
                <th className="border p-2">Объём работ</th>
                <th className="border p-2">Обоснование(ГЭСН)</th>
                <th className="border p-2">Затраты труда</th>
                <th className="border p-2">Q всего чел. ч.</th>
                <th className="border p-2">Машина</th>
                <th className="border p-2">норм маш.ч.</th>
                <th className="border p-2">Q всего маш.ч.</th>
                <th className="border p-2">Число рабочих</th>
                <th className="border p-2">Число машин</th>
                <th className="border p-2">Число смен</th>
                <th className="border p-2">Продолжит. Механ. Работ дн</th>
                <th className="border p-2">Продолжит. Немехан. Работ дн</th>
                <th className="border p-2">Продолжит. Раб, дн.</th>
                <th className="border p-2">Состав бригады чел.</th>
                <th className="border p-2">Расчёт объёма</th>
              </tr>
            </thead>
            <tbody>
              {workVolume.map((floorData, floorIndex) => (
                <Fragment key={`floor-${floorIndex}`}>
                  <tr 
                    className="bg-blue-50 cursor-pointer hover:bg-blue-100"
                    onClick={() => toggleLevel(floorData.level)}
                  >
                    <td colSpan={17} className="border p-2 font-semibold">
                      <div className="flex items-center">
                        {expandedLevels[floorData.level] ? '▼' : '►'} {floorData.level}
                        <div className="ml-4 text-sm text-gray-600">
                          {Object.entries(floorData.counts)
                            .filter(([type, count]) => type !== 'total' && count > 0)
                            .map(([type, count]) => `${type}: ${count}`)
                            .join(', ')}
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedLevels[floorData.level] && elementTypes.map(type => (
                    floorData.counts[type] > 0 && (
                      <tr key={`${floorData.level}-${type}`} className="hover:bg-gray-50">
                        <td className="border p-2">{floorData.level}</td>
                        {(() => {
                          const totals = calculateTypeTotals(floorData.elements[type], type);
                          return (
                            <>
                              <td className="border p-2">{totals.type}</td>
                              <td className="border p-2">
                                  {(() => {
                                    switch(totals.type) {
                                      case 'Лестница':
                                      case 'Перекрытие':
                                      case 'Стены':
                                        return totals.volume;
                                      case 'Колонны':
                                        // ваш код для value2
                                        return floorData.counts[type].toFixed(2);
                                      case 'Двери':
                                      case 'Окна':
                                      case 'Крыши':
                                        return floorData.areas[type].toFixed(2);
                                      case 'Перила':
                                        return floorData.lengths[type].toFixed(2);
                                      default:
                                        return totals.volume;
                                    }
                                  })()} {totals.unit}
                              </td>
                              <td className="border p-2">{totals.justification}</td>
                              <td className="border p-2">{totals.laborCost}</td>
                              <td className="border p-2">{totals.totalLaborCost}</td>
                              <td className="border p-2">{totals.machine}</td>
                              <td className="border p-2">{totals.machineTime}</td>
                              <td className="border p-2">{totals.totalMachineTime}</td>
                              <td className="border p-2">{totals.workers}</td>
                              <td className="border p-2">{totals.machines}</td>
                              <td className="border p-2">{totals.shifts}</td>
                              <td className="border p-2">{totals.mechDuration}</td>
                              <td className="border p-2">{totals.nonMechDuration}</td>
                              <td className="border p-2">{totals.totalDuration}</td>
                              <td className="border p-2">{totals.crew}</td>
                              <td className="border p-2">{totals.volumeCalc}</td>
                            </>
                          );
                        })()}
                      </tr>
                    )
                  ))}
                </Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={2} className="border p-2">Итого по проекту:</td>
                <td colSpan={16} className="border p-2">
                  {Object.entries(workVolume.reduce((acc, floor) => {
                    ['columns', 'slabs', 'beams'].forEach(type => {
                      acc[type] = (acc[type] || 0) + 
                        floor.elements[type].reduce((sum, el) => sum + (el.volume || 0), 0);
                    });
                    ['stairs', 'doors', 'windows'].forEach(type => {
                      acc[type] = (acc[type] || 0) + floor.elements[type].length;
                    });
                    ['walls', 'roofs'].forEach(type => {
                      acc[type] = (acc[type] || 0) + 
                        floor.elements[type].reduce((sum, el) => sum + (el.area || 0), 0);
                    });
                    return acc;
                  }, {}))
                  .map(([type, value]) => `${type}: ${value.toFixed(2)} ${type === 'stairs' || type === 'doors' || type === 'windows' ? 'шт' : 'м3/м2'}`)
                  .join(', ')}
                </td>
                {/* <td colSpan={10} className="border p-2"></td> */}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}