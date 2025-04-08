'use client'

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

const Stairs = ({ walls }) => {
  const [open, setOpen] = useState(false);
  const [openMaterials, setOpenMaterials] = useState(false);
  
  return (
    <div className="bg-white mb-4 p-4 rounded-lg w-full">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(prev => !prev)}>
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-gold text-xl">Стены ({walls?.totalCount ? walls.totalCount : 0})</h3>
          <div>
            <h4 className="text-black">Количество: {walls?.totalCount} шт</h4>
            <h4 className="text-black">Общий объем: {walls?.totalVolume} м³</h4>
            <h4 className="text-black">Общая площадь: {walls?.totalArea} м³</h4>
            <h4 className="text-black">Описание: {walls?.description}</h4>
          </div>
        </div>
        <button className="p-5">
          {open ? <IoIosArrowUp color="#f69220" size={30} /> : <IoIosArrowDown color="#f69220" size={30} />}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          {walls?.walls?.length > 0 ? (
            <div className="space-y-4">
              {walls.walls.map((wall, index) => (
                <div key={wall.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="font-medium text-black text-lg">Стена #{index+1}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Название:</p>
                      <p className="text-black">{wall.name}</p>
                    </div>  
                    <div className="flex items-center gap-1">
                      <p className="text-black">Тип:</p>
                      <p className="text-black">{wall.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Уровень:</p>
                      <p className="text-black">{wall.level}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Значение уровня:</p>
                      <p className="text-black">{wall.elevation}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Объем:</p>
                      <p className="text-black">{wall.volume} м³</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Размеры:</p>
                      <p className="text-black">
                        {wall.height && wall.width && wall.length 
                          ? `${wall.height} × ${wall.width} × ${wall.length} мм`
                          : "Н/Д"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">GlobalID:</p>
                      <p className="text-black truncate">{wall.globalId}</p>
                    </div>
                    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded-md border-2 hover:border-gray-400 p-4" onClick={() => setOpenMaterials(prev => !prev)}>
                      <div className="flex items-center gap-1">
                        <p className="text-black">Материалы:</p>
                        <p className="text-black truncate">{wall.materials.length}</p>
                      </div>
                      <button className="p-5">
                        {openMaterials ? <IoIosArrowUp color="#f69220" size={30} /> : <IoIosArrowDown color="#f69220" size={30} />}
                      </button>
                    </div>
                    {openMaterials && (
                      <div className="mt-4">
                        {wall?.materials?.length > 0 ? (
                          <div className="space-y-4">
                            {wall.materials.map((material, index) => (
                              <div key={material.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex flex-col gap-2">
                                  <div>
                                    <p className="font-medium text-black text-lg">Материал #{index+1}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <p className="text-black">Название:</p>
                                    <p className="text-black">{material.name}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <p className="text-black">Тип:</p>
                                    <p className="text-black">{material.type}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <p className="text-black">Объем:</p>
                                    <p className="text-black">{material.volume} </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <p className="text-black">Площадь:</p>
                                    <p className="text-black">{material.area} м³</p>
                                  </div>
                                </div>
                              </div>
                            )
                          )
                        }
                        </div>
                        ) : <p className="py-4 text-gray-500 text-center">Нет данных о материалах</p>}
                        </div>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-gray-500 text-center">Нет данных о материалах</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Stairs;