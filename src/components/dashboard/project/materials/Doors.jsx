'use client'

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

const Stairs = ({ doors }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="bg-white mb-4 p-4 rounded-lg w-full">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(prev => !prev)}>
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-gold text-xl">Двери ({doors?.totalCount ? doors.totalCount : 0})</h3>
          <div>
            <h4 className="text-black">Количество: {doors?.totalCount} шт</h4>
            <h4 className="text-black">Описание: {doors?.description}</h4>
          </div>
        </div>
        <button className="p-5">
          {open ? <IoIosArrowUp color="#f69220" size={30} /> : <IoIosArrowDown color="#f69220" size={30} />}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          {doors?.doors?.length > 0 ? (
            <div className="space-y-4">
              {doors.doors.map((door, index) => (
                <div key={door.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="font-medium text-black text-lg">Дверь #{index+1}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Название:</p>
                      <p className="text-black">{door.name}</p>
                    </div>  
                    <div className="flex items-center gap-1">
                      <p className="text-black">Тип:</p>
                      <p className="text-black">{door.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Уровень:</p>
                      <p className="text-black">{door.level}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Значение уровня:</p>
                      <p className="text-black">{door.elevation}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">площадь:</p>
                      <p className="text-black">{door.area} м²</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Размеры:</p>
                      <p className="text-black">
                        {door.height && door.width 
                          ? `${door.height} × ${door.width} мм`
                          : "Н/Д"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">GlobalID:</p>
                      <p className="text-black truncate">{door.globalId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-gray-500 text-center">Нет данных о балках</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Stairs;