'use client'

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

const Stairs = ({ roofs }) => {
  const [open, setOpen] = useState(false);
  const [openMaterials, setOpenMaterials] = useState(false);
  
  return (
    <div className="bg-white mb-4 p-4 rounded-lg w-full">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpen(prev => !prev)}>
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-gold text-xl">Крыши ({roofs?.totalCount ? roofs.totalCount : 0})</h3>
          <div>
            <h4 className="text-black">Количество: {roofs?.totalCount} шт</h4>
            <h4 className="text-black">Общий объем: {roofs?.totalVolume} м³</h4>
            <h4 className="text-black">Общая площадь: {roofs?.totalArea} м³</h4>
            <h4 className="text-black">Описание: {roofs?.description}</h4>
          </div>
        </div>
        <button className="p-5">
          {open ? <IoIosArrowUp color="#f69220" size={30} /> : <IoIosArrowDown color="#f69220" size={30} />}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          {roofs?.roofs?.length > 0 ? (
            <div className="space-y-4">
              {roofs.roofs.map((roof, index) => (
                <div key={roof.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="font-medium text-black text-lg">Крыша #{index+1}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Название:</p>
                      <p className="text-black">{roof.name}</p>
                    </div>  
                    <div className="flex items-center gap-1">
                      <p className="text-black">Тип:</p>
                      <p className="text-black">{roof.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Уровень:</p>
                      <p className="text-black">{roof.level}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Значение уровня:</p>
                      <p className="text-black">{roof.elevation}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Объем:</p>
                      <p className="text-black">{roof.volume} м³</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">Размеры:</p>
                      <p className="text-black">
                        {roof.height && roof.width && roof.length 
                          ? `${roof.height} × ${roof.width} × ${roof.length} мм`
                          : "Н/Д"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-black">GlobalID:</p>
                      <p className="text-black truncate">{roof.globalId}</p>
                    </div>
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenMaterials(prev => !prev)}>
                      <div className="flex items-center gap-1">
                        <p className="text-black">Материалы:</p>
                        <p className="text-black truncate">{roof.materials.length}</p>
                      </div>
                      <button className="p-5">
                        {openMaterials ? <IoIosArrowUp color="#f69220" size={30} /> : <IoIosArrowDown color="#f69220" size={30} />}
                      </button>
                    </div>
                    {openMaterials && (
                      <div className="mt-4">
                        {roof?.materials?.length > 0 ? (
                          <div className="space-y-4">
                            {roof.materials.map((material, index) => (
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