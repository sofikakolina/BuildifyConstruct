'use client'

import { useAppSelector } from '@/lib/hooks'
import { useState, useEffect, Fragment, useRef } from 'react'
import axios from 'axios'

export default function WorkVolume() {
  const [expandedLevels, setExpandedLevels] = useState({})
  const [workVolume, setWorkVolume] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [gasnList, setGasnList] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [editingCell, setEditingCell] = useState(null) // { level, name, field, value }
  const tableRef = useRef(null)
  const inputRef = useRef(null)
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value)

  useEffect(() => {
    const fetchData = async () => {
      if (!idCurrentProject) return
      setIsLoading(true)
      try {
        const [res, gasnRes] = await Promise.all([
          axios.get('/api/dashboard/projects/workVolume', {
            params: { projectId: idCurrentProject }
          }),
          axios.get('/api/dashboard/projects/gasn')
        ])

        setGasnList(gasnRes.data.gasn)

        const grouped = {}
        res.data.forEach(item => {
          const level = item.level || 'Не указан'
          if (!grouped[level]) grouped[level] = []
          grouped[level].push(item)
        })

        setWorkVolume(grouped)
      } catch (err) {
        console.error('Ошибка при загрузке данных объема работ:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [idCurrentProject])

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingCell])

  const toggleLevel = (level, e) => {
    const scrollPosition = tableRef.current?.scrollTop
    
    setExpandedLevels(prev => {
      const newState = {
        ...prev,
        [level]: !prev[level]
      }
      
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollTop = scrollPosition
        }
      }, 0)
      
      return newState
    })
    
    e.stopPropagation()
  }

  const handleCellClick = (item, level, field, e) => {
    if (field === 'gasn') {
      handleGasnClick(item, level, e)
    } else {
      handleEditableCellClick(item, level, field, e)
    }
  }

  const handleGasnClick = async (item, level, e) => {
    try {
      setIsLoading(true)
      const scrollPosition = tableRef.current?.scrollTop
      
      if (selectedCell?.level === level && selectedCell?.name === item.name) {
        setSelectedCell(null)
        return
      }

      setSelectedCell({
        level,
        name: item.name,
        gasnId: item.gasn?.id || ''
      })
      
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollTop = scrollPosition
        }
      }, 0)
      
    } catch (err) {
      console.error('Ошибка при выборе ГЭСН/ЕНиР:', err)
    } finally {
      setIsLoading(false)
    }
    
    e.stopPropagation()
  }

  const handleEditableCellClick = (item, level, field, e) => {
    const scrollPosition = tableRef.current?.scrollTop
    
    setEditingCell({
      level,
      name: item.name,
      id: item.id,
      field,
      value: item[field] || ''
    })
    
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollTop = scrollPosition
      }
    }, 0)
    
    e.stopPropagation()
  }

  const handleGasnSelect = async (gasnId) => {
    if (!selectedCell || !gasnId) return

    try {
      setIsLoading(true)
      const scrollPosition = tableRef.current?.scrollTop
      const selectedGasnObj = gasnList.find(g => g.id === gasnId)
      if (!selectedGasnObj) return

      await axios.put('/api/dashboard/projects/workVolume', {
        projectId: idCurrentProject,
        elementName: selectedCell.name,
        gasnId: gasnId
      })

      setWorkVolume(prev => {
        const updated = {...prev}
        for (const level in updated) {
          updated[level] = updated[level].map(item => {
            if (item.name === selectedCell.name) {
              return { ...item, gasn: selectedGasnObj }
            }
            return item
          })
        }
        return updated
      })

      setSelectedCell(null)
      
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollTop = scrollPosition
        }
      }, 0)
      
    } catch (err) {
      console.error('Ошибка при обновлении ГЭСН/ЕНиР:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditableCellChange = async (e) => {
    e.stopPropagation()
    const newValue = e.target.value

    setEditingCell(prev => ({
      ...prev,
      value: newValue
    }))
  }

  const handleEditableCellBlur = async () => {
    if (!editingCell) return

    try {
      setIsLoading(true)
      const scrollPosition = tableRef.current?.scrollTop
      const { name, id, field, value } = editingCell
      console.log(id)
      await axios.put('/api/dashboard/projects/workVolume', {
        projectId: idCurrentProject,
        elementName: name,
        elementId: id,
        [field]: Number(value) || 0
      })

      setWorkVolume(prev => {
        const updated = {...prev}
        for (const lvl in updated) {
          updated[lvl] = updated[lvl].map(item => {
            if (item.name === name) {
              return { ...item, [field]: Number(value) || 0 }
            }
            return item
          })
        }
        return updated
      })

      setEditingCell(null)
      
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollTop = scrollPosition
        }
      }, 0)
      
    } catch (err) {
      console.error('Ошибка при обновлении данных:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditableCellKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditableCellBlur()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  const renderEditableCell = (item, level, field) => {
    if (editingCell?.level === level && 
        editingCell?.name === item.name && 
        editingCell?.field === field) {
      return (
        <td className="border p-0" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            type="number"
            value={editingCell.value}
            onChange={handleEditableCellChange}
            onBlur={handleEditableCellBlur}
            onKeyDown={handleEditableCellKeyDown}
            className="w-full p-2 border-0 focus:ring-0"
            min="0"
            step="1"
          />
        </td>
      )
    }

    return (
      <td 
        className="border p-2 cursor-pointer hover:bg-blue-50"
        onClick={(e) => handleCellClick(item, level, field, e)}
      >
        {item[field] || ''}
      </td>
    )
  }

  const renderGasnCell = (item, level) => {
    if (selectedCell && selectedCell.level === level && selectedCell.name === item.name) {
      return (
        <td className="border p-0" onClick={(e) => e.stopPropagation()}>
          <select
            value={selectedCell.gasnId}
            onChange={(e) => handleGasnSelect(e.target.value)}
            className="w-full p-2 border-0 focus:ring-0"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Выберите ГЭСН/ЕНиР</option>
            {gasnList.map(gasn => (
              <option key={gasn.id} value={gasn.id}>
                {gasn.justification} - {gasn.name}
              </option>
            ))}
          </select>
        </td>
      )
    }

    return (
      <td 
        className="border p-2 cursor-pointer hover:bg-blue-50"
        onClick={(e) => handleCellClick(item, level, 'gasn', e)}
      >
        {item.gasn ? item.gasn.justification : 'Не выбрано'}
      </td>
    )
  }

  const renderRow = (item, level) => {
    const volume = item.volume/item.gasn?.countOfUnit ?? 0
    // const area = item.area/item.gasn?.countOfUnit ?? 0
    const count = item.count/item.gasn?.countOfUnit ?? 0

    const isCountable = item.gasn?.unit === 'шт'
    const quantity = isCountable ? count : volume

    const totalPeopleTime = volume * item.gasn?.normalHoursPeople
    const totalMachineTime = volume * item.gasn?.normalHoursMashine
    const peopleQ = volume * item.gasn?.normalHoursPeople.toFixed(2) || ''
    // const mechDays = totalMachineTime ? Math.ceil(totalMachineTime / 8) : ''
    // const totalDays = Math.max(mechDays || 0, nonMechDays || 0) || ''
    const totalMachineWork =  (totalMachineTime && item.gasn?.normalHoursMashine && item.numberOfChanges) ? Math.ceil(totalMachineTime/(parseFloat(item.gasn?.normalHoursMashine) * 8 * parseFloat(item.numberOfChanges))) : ""
    const totalPeopleWork =  (totalPeopleTime && item.gasn?.normalHoursPeople && item.numberOfChanges) ? Math.ceil(totalMachineTime/(parseFloat(item.gasn?.normalHoursMashine) * 8 * parseFloat(item.numberOfChanges))) : ""
    return (
      <tr key={`${level}-${item.name}`} className="hover:bg-gray-50">
        <td className="border p-2">{level}</td>
        <td className="border p-2">{item.name}</td>
        <td className="border p-2">{item.gasn?.name}</td>
        <td className="border p-2">{item.gasn?.countOfUnit} {item.gasn?.unit || ''}</td>
        <td className="border p-2">{item.gasn?.unit ? `${quantity.toFixed(2)}` : ''}</td>
        {renderGasnCell(item, level)}
        <td className="border p-2">{item.gasn?.normalHoursPeople || ''}</td>
        <td className="border p-2">{typeof(peopleQ)=="number" ? peopleQ.toFixed(2) : ''}</td>
        <td className="border p-2">{item.gasn?.machine || ''}</td>
        <td className="border p-2">{item.gasn?.normalHoursMashine || ''}</td>
        <td className="border p-2">{totalMachineTime ? totalMachineTime.toFixed(2) : ''}</td>
        {renderEditableCell(item, level, 'numberOfWorkers')}
        {renderEditableCell(item, level, 'numberOfMashine')}
        {renderEditableCell(item, level, 'numberOfChanges')}
        <td className="border p-2">{totalMachineWork}</td>
        <td className="border p-2">{totalPeopleWork}</td>
        <td className="border p-2">{(totalPeopleWork && totalMachineWork) && Math.max(totalPeopleWork, totalMachineWork)}</td>
        <td className="border p-2">{item.gasn?.crew || ''}</td>
        <td className="border p-2">
          {/* {isCountable
            ? `Количество: ${count}`
            : (item.gasn?.unit === 'м2'
              ? `Площадь: ${area.toFixed(2)} м²`
              : `Объем: ${volume.toFixed(2)} м³`)} */}
          {item.gasn?.volumeCalculation}
        </td>
      </tr>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-gold">Ведомость объема работ</h1>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="overflow-auto max-h-screen" ref={tableRef}>
          <table className="min-w-full border border-collapse text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border p-2">Этаж</th>
                <th className="border p-2">Название элемента</th>
                <th className="border p-2">Тип</th>
                <th className="border p-2">Ед. изм.</th>
                <th className="border p-2">Объём</th>
                <th className="border p-2">ГЭСН/ЕНиР</th>
                <th className="border p-2">Норм. чел. ч.</th>
                <th className="border p-2">Q чел.ч</th>
                <th className="border p-2">Машина</th>
                <th className="border p-2">Маш.ч норм</th>
                <th className="border p-2">Q маш.ч</th>
                <th className="border p-2">Рабочие</th>
                <th className="border p-2">Машины</th>
                <th className="border p-2">Смены</th>
                <th className="border p-2">Мех. дней</th>
                <th className="border p-2">Немех. дней</th>
                <th className="border p-2">Всего дней</th>
                <th className="border p-2">Бригада</th>
                <th className="border p-2">Расчёт</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(workVolume).map(([level, items]) => (
                <Fragment key={level}>
                  <tr
                    onClick={(e) => toggleLevel(level, e)}
                    className="cursor-pointer bg-blue-50 hover:bg-blue-100"
                  >
                    <td colSpan={19} className="p-2 font-semibold">
                      {expandedLevels[level] ? '▼' : '►'} {level}
                    </td>
                  </tr>
                  {expandedLevels[level] && items.map(item => renderRow(item, level))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}