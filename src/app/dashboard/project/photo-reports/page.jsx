'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TextField, Dialog } from '@mui/material';
import { MdDelete, MdDownload } from 'react-icons/md';
import { downloadFile } from "@/lib/download";
import { useAppSelector } from '@/lib/hooks';

const Page = () => {
  const [files, setFiles] = useState([]);
  const [photoReports, setPhotoReports] = useState([]);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);

  // Загрузка фотоотчетов при монтировании
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/dashboard/projects/tasks/photoReports', {
          params: { 
            projectId: idCurrentProject 
          },
        });
        setPhotoReports(res.data.photoReports || []);
      } catch (error) {
        toast.error(`Ошибка загрузки фотоотчетов ${error.response?.data?.error}`);
      }
    };

    fetchReports();
  }, [idCurrentProject]);

  const handleFilesUpload = (event) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
  };

  const handlePhotoReportUpload = async () => {
    if (files.length === 0) return toast.error('Выберите файлы');

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('projectId', idCurrentProject);
    formData.append('name', name);
    formData.append('title', title);

    try {
      const res = await axios.post('/api/dashboard/projects/tasks/photoReports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoReports(prev => [res.data.photoReport, ...prev]);
      setFiles([]);
      setName('');
      setTitle('');
      toast.success('Фотоотчет загружен');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Ошибка при загрузке');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete('/api/dashboard/projects/tasks/photoReports', { params: { photoReportId: id } });
      setPhotoReports(prev => prev.filter(r => r.id !== id));
      toast.success('Удалено');
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const handleDownloadFiles = (images) => {
    images.forEach(img => downloadFile(img.src));
  };

  return (
		<div className="flex flex-col gap-8 shadow-2xl p-4 border-2 rounded-lg">
      <h1 className="text-gold text-2xl font-bold">Фотоотчеты</h1>

      {/* Зона загрузки */}
			<div className='border-2 flex flex-col gap-4 p-3 rounded-md'>
        <div className="flex flex-col items-center gap-4 bg-gray-50 hover:bg-gray-100 p-6 border-2 border-gray-300 border-dashed rounded-lg transition-colors duration-200">
          <p className="text-gray-600">Перетащите файлы или выберите вручную</p>
          <label className="bg-gold hover:bg-gold-hover px-6 py-2 rounded text-white cursor-pointer shadow">
            Загрузить файлы
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesUpload}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <ul className="text-sm text-gray-700 list-disc pl-5 mt-2">
              {files.map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Название и описание */}
        <div className="flex flex-col gap-3">
          <TextField
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Описание"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </div>

        <button
          onClick={handlePhotoReportUpload}
          className="bg-gold hover:bg-gold-hover py-2 px-4 rounded text-white shadow-md w-fit"
        >
          Сохранить
        </button>

      </div>
      {/* Фотоотчеты */}
      <div className="flex flex-col gap-4">
        {photoReports.map((report) => (
          <div
            key={report.id}
            className="bg-white p-4 shadow rounded-md flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{report.name}</h3>
                <p className="text-gray-600">{report.title}</p>
                <p className="text-sm text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadFiles(report.images)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white"
                  title="Скачать"
                >
                  <MdDownload />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white"
                  title="Удалить"
                >
                  <MdDelete />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {report.images.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt=""
                  className="w-20 h-20 object-cover rounded cursor-pointer shadow"
                  onClick={() => setSelectedImage(img.src)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно */}
      <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="lg">
        <div className="p-4">
          <img
            src={selectedImage || ''}
            alt="Изображение"
            className="max-w-full max-h-[80vh] rounded shadow"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Page;
