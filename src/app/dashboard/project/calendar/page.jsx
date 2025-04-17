'use client'
import { useState, useRef, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MdDownload, MdDelete, MdUpload } from 'react-icons/md'
import { FiFile } from 'react-icons/fi'

const MPPViewer = () => {
  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [serverFile, setServerFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadFromServer, setIsUploadFromServer] = useState(false)
  const fileInputRef = useRef(null)
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value)

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setIsLoading(true)
        const { data } = await axios.get("/api/dashboard/projects/calendar", {
          params: { projectId: idCurrentProject }
        })
        
        if (data?.calendar) {
          setServerFile({
            path: data.calendar.path,
            name: data.calendar.name
          })
          setFileName(data.calendar.name)
          setIsUploadFromServer(true)
        }
      } catch (error) {
        console.error("Error fetching calendar:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCalendar()
  }, [idCurrentProject])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFileName(selectedFile.name)
      const url = URL.createObjectURL(selectedFile)
      setFileUrl(url)
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("projectId", idCurrentProject)
    formData.append("name", fileName)

    try {
      const response = await axios.post("/api/dashboard/projects/calendar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (response.status === 200) {
        toast.success("Календарный план успешно обновлен!")
        setServerFile({
          path: response.data.calendar.path,
          name: response.data.calendar.name
        })
        setFileName(response.data.calendar.name)
        // Сбрасываем локальный файл после успешной загрузки
        setFile(null)
        setIsUploadFromServer(true)
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (fileUrl) URL.revokeObjectURL(fileUrl)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(
        axios.isAxiosError(error) 
          ? error.response?.data?.error || "Ошибка загрузки файла"
          : "Неизвестная ошибка"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFileName(serverFile?.name || '')
    setFile(null)
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteFile = async () => {
    try {
      setIsLoading(true)
      await axios.delete("/api/dashboard/projects/calendar", {
        params: { projectId: idCurrentProject }
      })
      
      toast.success("Файл календарного плана удален")
      setServerFile(null)
      setFileName('')
      setFile(null)
      setIsUploadFromServer(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Не удалось удалить файл")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-gold to-[#f1a500] p-6">
          <h2 className="text-2xl font-bold text-white">Календарный план проекта</h2>
          <p className="text-blue-100 mt-1">Загрузите MPP-файл для управления проектом</p>
        </div>

        {/* Основное содержимое */}
        <div className="p-6 space-y-6">
          {/* Панель загрузки */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="flex-1 w-full">
              <span className="block text-sm font-medium text-gray-700 mb-1">Выберите MPP-файл</span>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".mpp"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
              </div>
            </label>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleUpload}
                disabled={(!file && !serverFile) || isLoading || !fileInputRef}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium
                  ${(!file && !serverFile) || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                <MdUpload size={18} />
                {isLoading ? 'Загрузка...' : file ? isUploadFromServer ? 'Обновить' : 'Загрузить' : 'Сохранить'}
              </button>

              

              {file && (
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                >
                  Отмена
                </button>
              )}
            </div>
          </div>

          {/* Информация о файле */}
          {(fileName || serverFile?.name) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiFile className="text-blue-500" size={24} />
                  <div>
                    <h3 className="font-medium text-gray-800">{fileName || serverFile?.name}</h3>
                    <p className="text-sm text-gray-500">MPP файл календарного плана</p>
                    {serverFile?.path && (
                      <p className="text-xs text-gray-400 mt-1">
                        Загружен: {new Date().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className='flex items-center gap-5'>
                  {(fileUrl || serverFile?.path) && (
                    <a 
                      href={fileUrl || serverFile.path} 
                      download={fileName || serverFile.name}
                      className="flex items-center gap-2 px-3 py-2 bg-gold text-white rounded-md hover:bg-gold-hover transition-colors"
                    >
                      <MdDownload size={18} />
                      Скачать
                    </a>
                  )}
                  {serverFile && (
                    <button
                      onClick={handleDeleteFile}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 font-medium disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <MdDelete size={18} />
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Пустое состояние */}
          {!fileName && !serverFile?.name && !isLoading && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FiFile className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-700">Нет загруженного файла</h3>
              <p className="mt-1 text-gray-500">Выберите MPP-файл календарного плана проекта</p>
            </div>
          )}

          {/* Состояние загрузки */}
          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MPPViewer