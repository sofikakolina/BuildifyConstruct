'use client'

import { useState, React, Fragment } from 'react';

export default function WorkVolume() {
  const [activeTab, setActiveTab] = useState('walls');
  const [expandedLevels, setExpandedLevels] = useState({});

  // Mock data - replace with your actual data fetching logic
  const mockWalls = [
    {
      id: 'wall-1',
      name: 'Наружные стены',
      totalCount: 10,
      totalVolume: 45.2,
      totalArea: 120.5,
      description: 'Основные несущие стены',
      projectId: 'project-1',
      walls: [
        {
          id: 'wall-el-1',
          wallId: 'wall-1',
          name: 'Стена 1',
          globalId: 'WALL-001',
          type: 'Несущая',
          level: '1 этаж',
          elevation: 0,
          volume: 12.5,
          area: 35.2,
          height: 3.2,
          length: 11,
          width: 0.4,
          materials: [
            {
              id: 'mat-1',
              wallElementId: 'wall-el-1',
              name: 'Кирпич керамический',
              type: 'Кладка',
              thickness: 400,
              volume: 12.5,
              area: 35.2,
              elevation: 0
            }
          ]
        },
        // More wall elements...
      ]
    }
  ];

  const mockRailings = [
    // Similar structure for railings
  ];

  const mockRoofs = [
    // Similar structure for roofs
  ];

  const transformWallData = (wall) => {
    return wall.walls.map(wallEl => ({
      id: wallEl.id,
      name: wallEl.name,
      unit: 'м3',
      quantity: wallEl.volume || 0,
      justification: 'ГЭСН 07-01-001-06',
      laborCost: 213.12,
      totalLaborCost: (wallEl.volume || 0) * 213.12,
      machine: 'Кран гусеничный до 16 т',
      machineTime: 52.49,
      totalMachineTime: (wallEl.volume || 0) * 52.49,
      workers: 2,
      machines: 1,
      shifts: 1,
      mechDuration: Math.ceil(((wallEl.volume || 0) * 52.49) / (1 * 8 * 1)),
      nonMechDuration: Math.ceil(((wallEl.volume || 0) * 213.12) / (8 * 1 * 2)),
      totalDuration: Math.max(
        Math.ceil(((wallEl.volume || 0) * 52.49) / (1 * 8 * 1),
        Math.ceil(((wallEl.volume || 0) * 213.12) / (8 * 1 * 2))
      )),
      crew: 'Рабочие-строители 3, 4 разряда; машинисты',
      volumeCalc: `Площадь: ${wallEl.area?.toFixed(2)} м2`,
      level: wallEl.level
    }));
  };

  const transformRailingData = (railing) => {
    // Similar transformation for railings
    return [];
  };

  const transformRoofData = (roof) => {
    // Similar transformation for roofs
    return [];
  };

  const getDataForCurrentTab = () => {
    switch (activeTab) {
      case 'railings':
        return mockRailings.flatMap(transformRailingData);
      case 'walls':
        return mockWalls.flatMap(transformWallData);
      case 'roofs':
        return mockRoofs.flatMap(transformRoofData);
      default:
        return [];
    }
  };

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const groupedData = getDataForCurrentTab().reduce((acc, item) => {
    const level = item.level || 'Без уровня';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(item);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-gold text-2xl">Ведомость объема работ</h1>
      
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'walls' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('walls')}
        >
          Стены
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'railings' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('railings')}
        >
          Ограждения
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'roofs' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          onClick={() => setActiveTab('roofs')}
        >
          Кровля
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">№</th>
              <th className="border p-2">Наименование работ</th>
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
            {Object.entries(groupedData).map(([level, items], levelIndex) => (
            <Fragment key={`level-${level}`}>                
                <tr 
                  key={`level-${level}`} 
                  className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleLevel(level)}
                >
                  <td colSpan={17} className="border p-2 font-semibold">
                    <div className="flex items-center">
                      {expandedLevels[level] ? '▼' : '►'} {level}
                    </div>
                  </td>
                </tr>
                {expandedLevels[level] && items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2">
                      <div>{item.quantity.toFixed(2)} {item.unit}</div>
                    </td>
                    <td className="border p-2">{item.justification}</td>
                    <td className="border p-2">{item.laborCost.toFixed(2)}</td>
                    <td className="border p-2">{item.totalLaborCost.toFixed(2)}</td>
                    <td className="border p-2">{item.machine}</td>
                    <td className="border p-2">{item.machineTime.toFixed(2)}</td>
                    <td className="border p-2">{item.totalMachineTime.toFixed(2)}</td>
                    <td className="border p-2">{item.workers}</td>
                    <td className="border p-2">{item.machines}</td>
                    <td className="border p-2">{item.shifts}</td>
                    <td className="border p-2">{item.mechDuration.toFixed(1)}</td>
                    <td className="border p-2">{item.nonMechDuration.toFixed(1)}</td>
                    <td className="border p-2">{item.totalDuration.toFixed(1)}</td>
                    <td className="border p-2">{item.crew}</td>
                    <td className="border p-2">{item.volumeCalc}</td>
                  </tr>
                ))}
                </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={5} className="border p-2">Итого:</td>
              <td className="border p-2">
                {Object.values(groupedData)
                  .flat()
                  .reduce((sum, item) => sum + item.totalLaborCost, 0)
                  .toFixed(2)}
              </td>
              <td colSpan={3} className="border p-2"></td>
              <td className="border p-2">
                {Object.values(groupedData)
                  .flat()
                  .reduce((sum, item) => sum + item.totalMachineTime, 0)
                  .toFixed(2)}
              </td>
              <td colSpan={8} className="border p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}