// app/page.tsx
"use client"

import { useState, useEffect } from 'react';

export default function TemporaryBuildingsCalculator() {
  const [structures, setStructures] = useState([]);
  const [workersPerShift, setWorkersPerShift] = useState(10);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [coefficient1, setCoefficient1] = useState(1.16);
  const [coefficient2, setCoefficient2] = useState(1.12);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [calculationId, setCalculationId] = useState('');

  useEffect(() => {
    const fetchLatestCalculation = async () => {
      try {
        const response = await fetch('/api/dashboard/projects/temporaryStructures/latest');
        const data = await response.json();
        if (data) {
          setWorkersPerShift(data.workersPerShift);
          setCoefficient1(data.coefficient1);
          setCoefficient2(data.coefficient2);
          setCalculationId(data.id);
        }
      } catch (error) {
        console.error('Error fetching latest calculation:', error);
      }
    };

    fetchLatestCalculation();
  }, []);

  useEffect(() => {
    const roundedTotalWorkers = Math.ceil(workersPerShift * coefficient1 * coefficient2);
    setTotalWorkers(roundedTotalWorkers);

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/projects/temporaryStructures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            workersPerShift, 
            totalWorkers: roundedTotalWorkers,
            coefficient1,
            coefficient2,
            calculationId
          }),
        });
        
        const data = await response.json();
        setStructures(data.structures);
        setCalculationId(data.calculation.id);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching structures:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [workersPerShift, coefficient1, coefficient2, calculationId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    switch (name) {
      case 'workersPerShift':
        setWorkersPerShift(numValue);
        break;
      case 'coefficient1':
        setCoefficient1(numValue);
        break;
      case 'coefficient2':
        setCoefficient2(numValue);
        break;
      default:
        break;
    }
  };

  const calculateWorkers = () => {
    const itr = Math.ceil(totalWorkers * 0.08);
    const employees = Math.ceil(totalWorkers * 0.05);
    const security = Math.ceil(totalWorkers * 0.03);
    const workersInBusiestShift = Math.ceil(totalWorkers * 0.85);
    const women = Math.ceil(workersInBusiestShift * 0.3);
    const men = Math.ceil(workersInBusiestShift * 0.7);

    return { itr, employees, security, workersInBusiestShift, women, men };
  };

  const { itr, employees, security, workersInBusiestShift, women, men } = calculateWorkers();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Расчет площадей временных зданий и сооружений</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Основные параметры</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Рабочие (макс. в смену)
              </label>
              <input
                type="number"
                name="workersPerShift"
                value={workersPerShift}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Коэф. общего числа (1)
              </label>
              <input
                type="number"
                step="0.01"
                name="coefficient1"
                value={coefficient1}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Коэф. общего числа (2)
              </label>
              <input
                type="number"
                step="0.01"
                name="coefficient2"
                value={coefficient2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            {lastUpdated && (
              <p className="text-sm text-gray-500">Данные обновлены: {lastUpdated}</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Расчетные значения</h2>
          <div className="space-y-2">
            <p className='text-gray-700'><span className="font-medium">Общее дневное число рабочих:</span> {totalWorkers}</p>
            <p className='text-gray-700'><span className="font-medium">ИТР:</span> {itr}</p>
            <p className='text-gray-700'><span className="font-medium">Служащие:</span> {employees}</p>
            <p className='text-gray-700'><span className="font-medium">Охрана:</span> {security}</p>
            <p className='text-gray-700'><span className="font-medium">Численность рабочих в наиболее загруженную смену:</span> {workersInBusiestShift}</p>
            <p className='text-gray-700'><span className="font-medium">Женщины:</span> {women}</p>
            <p className='text-gray-700'><span className="font-medium">Мужчины:</span> {men}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Временные здания и сооружения</h2>
        {loading ? (
          <p>Загрузка данных...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наименование</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Численность персонала</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Норма, м² на 1 чел.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Расчетная площадь, м²</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Принимаемая площадь, м²</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Размеры в плане, м</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Число зданий</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Используемый типовой проект</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {structures.map((structure) => (
                  <tr key={structure.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.numberOfStaff}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.standardOnOneman}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.EstimatedArea.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.AcceptedArea.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.dimensionsInPlan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.numberOfBuildings}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{structure.standardProjectUsed}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium" colSpan={4}>Общая площадь</td>
                  <td className="px-6 py-4 font-medium">
                    {structures.reduce((sum, structure) => sum + structure.AcceptedArea, 0).toFixed(2)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}