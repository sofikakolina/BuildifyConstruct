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
    if (type === 'slabs' || type === 'beams') {
      const volume = elements.reduce((sum, el) => sum + (el.volume || 0), 0);
      const laborCost = 213.12;
      const totalLaborCost = volume * laborCost;
      const machineTime = 52.49;
      const totalMachineTime = volume * machineTime;
      
      return {
        type: type === 'slabs' ? 'Перекрытия' : 'Балки',
        volume: volume.toFixed(2),
        unit: 'м3',
        justification: 'ГЭСН',
        laborCost: laborCost.toFixed(2),
        totalLaborCost: totalLaborCost.toFixed(2),
        machine: 'Кран',
        machineTime: machineTime.toFixed(2),
        totalMachineTime: totalMachineTime.toFixed(2),
        workers: 2,
        machines: 1,
        shifts: 1,
        mechDuration: Math.ceil(totalMachineTime / (1 * 8 * 1)),
        nonMechDuration: Math.ceil(totalLaborCost / (8 * 1 * 2)),
        totalDuration: Math.max(
          Math.ceil(totalMachineTime / (1 * 8 * 1)),
          Math.ceil(totalLaborCost / (8 * 1 * 2))
        ),
        crew: 'Рабочие 3 разряда',
        volumeCalc: `Объем: ${volume.toFixed(2)} м3`
      };
    } else { // stairs
      const count = elements.length;
      const laborCost = 150;
      const totalLaborCost = count * laborCost;
      const machineTime = 30;
      const totalMachineTime = count * machineTime;
      
      return {
        type: 'Лестницы',
        volume: count,
        unit: 'шт',
        justification: 'ГЭСН',
        laborCost: laborCost.toFixed(2),
        totalLaborCost: totalLaborCost.toFixed(2),
        machine: 'Бетономешалка',
        machineTime: machineTime.toFixed(2),
        totalMachineTime: totalMachineTime.toFixed(2),
        workers: 3,
        machines: 1,
        shifts: 1,
        mechDuration: Math.ceil(totalMachineTime / (1 * 8 * 1)),
        nonMechDuration: Math.ceil(totalLaborCost / (8 * 1 * 3)),
        totalDuration: Math.max(
          Math.ceil(totalMachineTime / (1 * 8 * 1)),
          Math.ceil(totalLaborCost / (8 * 1 * 3))
        ),
        crew: 'Рабочие 4 разряда',
        volumeCalc: `Количество: ${count} шт`
      };
    }
  };

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

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
                          (Перекрытий: {floorData.counts.slabs}, Балок: {floorData.counts.beams}, Лестниц: {floorData.counts.stairs})
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedLevels[floorData.level] && (
                    <>
                      {/* Строка для плит */}
                      {floorData.counts.slabs > 0 && (
                        (() => {
                          const totals = calculateTypeTotals(floorData.elements.slabs, 'slabs');
                          return (
                            <tr className="hover:bg-gray-50">
                              <td className="border p-2">{floorData.level}</td>
                              <td className="border p-2">{totals.type}</td>
                              <td className="border p-2">{totals.volume} {totals.unit}</td>
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
                            </tr>
                          );
                        })()
                      )}
                      
                      {/* Строка для балок */}
                      {floorData.counts.beams > 0 && (
                        (() => {
                          const totals = calculateTypeTotals(floorData.elements.beams, 'beams');
                          return (
                            <tr className="hover:bg-gray-50">
                              <td className="border p-2">{floorData.level}</td>
                              <td className="border p-2">{totals.type}</td>
                              <td className="border p-2">{totals.volume} {totals.unit}</td>
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
                            </tr>
                          );
                        })()
                      )}
                      
                      {/* Строка для лестниц */}
                      {floorData.counts.stairs > 0 && (
                        (() => {
                          const totals = calculateTypeTotals(floorData.elements.stairs, 'stairs');
                          return (
                            <tr className="hover:bg-gray-50">
                              <td className="border p-2">{floorData.level}</td>
                              <td className="border p-2">{totals.type}</td>
                              <td className="border p-2">{totals.volume} {totals.unit}</td>
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
                            </tr>
                          );
                        })()
                      )}
                    </>
                  )}
                </Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={2} className="border p-2">Итого по проекту:</td>
                <td className="border p-2">
                  {workVolume.reduce((sum, floor) => 
                    sum + floor.elements.slabs.reduce((s, slab) => s + (slab.volume || 0), 0) +
                    floor.elements.beams.reduce((s, beam) => s + (beam.volume || 0), 0)
                  , 0).toFixed(2)} м3 + {' '}
                  {workVolume.reduce((sum, floor) => sum + floor.elements.stairs.length, 0)} шт
                </td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
                <td className="border p-2">
                  {workVolume.reduce((sum, floor) => 
                    sum + floor.elements.slabs.reduce((s, slab) => s + ((slab.volume || 0) * 213.12), 0) +
                    floor.elements.beams.reduce((s, beam) => s + ((beam.volume || 0) * 213.12), 0) +
                    floor.elements.stairs.length * 150
                  , 0).toFixed(2)}
                </td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
                <td className="border p-2">
                  {workVolume.reduce((sum, floor) => 
                    sum + floor.elements.slabs.reduce((s, slab) => s + ((slab.volume || 0) * 52.49), 0) +
                    floor.elements.beams.reduce((s, beam) => s + ((beam.volume || 0) * 52.49), 0) +
                    floor.elements.stairs.length * 30
                  , 0).toFixed(2)}
                </td>
                <td colSpan={8} className="border p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}