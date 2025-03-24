'use client';
import { useEffect, useState } from "react";
import axios from 'axios';
import { useAppSelector } from '@/lib/hooks';
import toast from "react-hot-toast";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MdCurrencyRuble , MdReceipt } from 'react-icons/md';

const PaymentDocuments = () => {
  const [analytics, setAnalytics] = useState({
    totalCost: 0,
    documentCount: 0,
    averageCost: 0,
    highestCost: 0,
    totalBudget: 0,
  });
  
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: paymentDocuments } = await axios.get(
          "/api/dashboard/projects/tasks/paymentDocuments", 
          { params: { projectId: idCurrentProject } }
        );

        if (paymentDocuments.paymentDocuments.length > 0) {
          const costs = paymentDocuments.paymentDocuments.map(doc => doc.cost);
          const total = costs.reduce((sum, cost) => sum + cost, 0);
          const average = total / costs.length;
          const highest = Math.max(...costs);

          setAnalytics({
            totalCost: total/100,
            documentCount: costs.length,
            averageCost: average/100,
            highestCost: highest/100,
            totalBudget: 10000000.00
          });
        }
      } catch (error) {
        toast.error(`Ошибка загрузки данных: ${error.message}`);
      }
    };
    
    fetchData();
  }, [idCurrentProject]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-xl">
      <h2 className="mb-6 font-bold text-gray-800 text-2xl">Аналитика платежей</h2>
      
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Бюджет */}
        <div className="flex items-center bg-[#ffebd4] p-5 rounded-lg">
          <div className="bg-[#ffdcb4] mr-4 p-3 rounded-full">
            <MdCurrencyRuble  className="text-blue-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Бюджет</p>
            <p className="font-semibold text-gray-800 text-2xl">
              {formatMoney(analytics.totalBudget)}
            </p>
          </div>
        </div>

        {/* Общая сумма */}
        <div className="flex items-center bg-blue-50 p-5 rounded-lg">
          <div className="bg-blue-100 mr-4 p-3 rounded-full">
            <MdCurrencyRuble  className="text-blue-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Общая сумма</p>
            <p className="font-semibold text-gray-800 text-2xl">
              {formatMoney(analytics.totalCost)}
            </p>
          </div>
        </div>

        {/* Количество документов */}
        <div className="flex items-center bg-green-50 p-5 rounded-lg">
          <div className="bg-green-100 mr-4 p-3 rounded-full">
            <MdReceipt className="text-green-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Документов</p>
            <p className="font-semibold text-gray-800 text-2xl">
              {analytics.documentCount}
            </p>
          </div>
        </div>

        {/* Средний платеж */}
        <div className="flex items-center bg-purple-50 p-5 rounded-lg">
          <div className="bg-purple-100 mr-4 p-3 rounded-full">
            <MdCurrencyRuble  className="text-purple-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Средний чек</p>
            <p className="font-semibold text-gray-800 text-2xl">
              {formatMoney(analytics.averageCost)}
            </p>
          </div>
        </div>

        {/* Максимальный платеж */}
        <div className="flex items-center bg-amber-50 p-5 rounded-lg">
          <div className="bg-amber-100 mr-4 p-3 rounded-full">
            <MdCurrencyRuble  className="text-amber-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Максимальный чек</p>
            <p className="font-semibold text-gray-800 text-2xl">
              {formatMoney(analytics.highestCost)}
            </p>
          </div>
        </div>
      </div>

      {/* График заполненности бюджета */}
      {analytics.totalCost > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-semibold text-gray-700 text-lg">Заполнение бюджета</h3>
          <div className="mx-auto max-w-md">
            <CircularProgressbar
              value={analytics.totalCost/analytics.totalBudget * 100} // Примерная логика прогресса
              maxValue={100}
              text={`${Math.round(analytics.totalCost/analytics.totalBudget * 100)}%`}
              styles={{
                path: {
                  stroke: '#4f46e5',
                  strokeLinecap: 'round',
                },
                text: {
                  fill: '#4f46e5',
                  fontSize: '24px',
                  fontWeight: 'bold',
                },
                trail: {
                  stroke: '#e5e7eb',
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDocuments;