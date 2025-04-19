'use client'
import { useAppSelector } from "@/lib/hooks";
import axios from "axios";
import { useEffect, useState } from "react"
import Link from "next/link";
import { ProcurementStatus } from "@prisma/client";

// Компонент карточки закупки
const ProcurementCard = ({ procurement }) => {
  const translateStatus = (status) => {
    const statusTranslations = {
      [ProcurementStatus.Initial]: 'Начальный',
      [ProcurementStatus.InWork]: 'В работе',
      [ProcurementStatus.Check]: 'На проверке',
      [ProcurementStatus.ForCorrection]: 'На исправлении',
      [ProcurementStatus.Complete]: 'Завершен',
      [ProcurementStatus.Cancelled]: 'Отменен'
    };
    return statusTranslations[status] || status;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{procurement.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{procurement.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          procurement.status === 'Complete' ? 'bg-green-100 text-green-800' :
          procurement.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {translateStatus(procurement.status)}
        </span>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Ответственные:</h4>
        <div className="flex flex-wrap gap-2">
          {procurement.assignedStaff.map(staff => (
            <span key={staff.id} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
              {staff.firstName} {staff.lastName}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Основные документы:</h4>
          <ul className="space-y-1">
            {procurement.documents.slice(0, 2).map(doc => (
              <li key={doc.id} className="text-sm text-gray-600 truncate">
                {doc.name}
              </li>
            ))}
            {procurement.documents.length > 2 && (
              <li className="text-sm text-gray-500">+{procurement.documents.length - 2} еще</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Проектная документация:</h4>
          <ul className="space-y-1">
            {procurement.designDocuments.slice(0, 2).map(doc => (
              <li key={doc.id} className="text-sm text-gray-600 truncate">
                {doc.name}
              </li>
            ))}
            {procurement.designDocuments.length > 2 && (
              <li className="text-sm text-gray-500">+{procurement.designDocuments.length - 2} еще</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Требования к закупке:</h4>
          <ul className="space-y-1">
            {procurement.procurementDocumentation.slice(0, 2).map(doc => (
              <li key={doc.id} className="text-sm text-gray-600 truncate">
                {doc.name}
              </li>
            ))}
            {procurement.procurementDocumentation.length > 2 && (
              <li className="text-sm text-gray-500">+{procurement.procurementDocumentation.length - 2} еще</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Документы поставки:</h4>
          <ul className="space-y-1">
            {procurement.deliveryDocumentation.slice(0, 2).map(doc => (
              <li key={doc.id} className="text-sm text-gray-600 truncate">
                {doc.name}
              </li>
            ))}
            {procurement.deliveryDocumentation.length > 2 && (
              <li className="text-sm text-gray-500">+{procurement.deliveryDocumentation.length - 2} еще</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Отчетные документы:</h4>
          <ul className="space-y-1">
            {procurement.accountingDocuments.slice(0, 2).map(doc => (
              <li key={doc.id} className="text-sm text-gray-600 truncate">
                {doc.name}
              </li>
            ))}
            {procurement.accountingDocuments.length > 2 && (
              <li className="text-sm text-gray-500">+{procurement.accountingDocuments.length - 2} еще</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link 
          href={`/dashboard/project/procurement/${procurement.id}`}
          className="text-sm text-gold hover:text-gold-hover font-medium"
        >
          Подробнее →
        </Link>
      </div>
    </div>
  );
};

// Основная страница
const Page = () => {
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/dashboard/projects/procurements", {
          params: { projectId: idCurrentProject }
        });
        setProcurements(data);
      } catch (error) {
        console.error("Ошибка при загрузке закупок:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idCurrentProject]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-gold text-2xl font-bold">Инициализация Закупок</h1>
          <Link 
            href={"procurement/create"} 
            className="flex justify-center items-center bg-gold text-white text-xl px-5 py-2 rounded-md gap-2"
          >
            Создать
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-gold text-2xl font-bold">Инициализация Закупок</h1>
        <Link 
          href={"procurement/create"} 
          className="flex justify-center items-center bg-gold text-white text-xl px-5 py-2 rounded-md gap-2 hover:bg-gold-dark transition-colors"
        >
          Создать
        </Link>
      </div>

      {procurements.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Нет созданных закупок</p>
          <Link 
            href="procurement/create" 
            className="mt-4 inline-block text-gold hover:text-gold-dark font-medium"
          >
            Создать первую закупку
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {procurements.map(procurement => (
            <ProcurementCard key={procurement.id} procurement={procurement} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;