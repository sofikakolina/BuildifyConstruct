'use client';

import { useEffect, useState } from "react";
import axios from 'axios';
import { useAppSelector } from '@/lib/hooks';
import toast from "react-hot-toast";
import { TextField } from "@mui/material";
import { MdDelete, MdDownload } from 'react-icons/md';
import { downloadFile } from "@/lib/download";
import { Dialog } from "@mui/material";

const PhotoReports = ({ task }) => {
    const [files, setFiles] = useState([]);
	const [photoReports, setPhotoReports] = useState(task.photoReports || []);
	const [name, setName] = useState('');
	const [title, setTitle] = useState('');
	const [selectedImage, setSelectedImage] = useState(null); // Модалка
	const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);

	useEffect(() => {
		if (task.photoReports) {
		setPhotoReports(task.photoReports);
		}
	}, [task.photoReports]);

	const handleFilesUpload = (event) => {
		const selectedFiles = Array.from(event.target.files || []);
		setFiles(selectedFiles);
	};

	const handlePhotoReportUpload = async () => {
		if (files.length === 0) {
		toast.error("Пожалуйста, выберите хотя бы один файл");
		return;
		}

		const formData = new FormData();
		files.forEach(file => formData.append("files", file));
		formData.append("projectId", idCurrentProject);
		formData.append("taskId", task.id);
		formData.append("name", name);
		formData.append("title", title);

		try {
		const response = await axios.post("/api/dashboard/projects/tasks/photoReports", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		if (response.status === 200) {
			setPhotoReports(prev => [response.data.photoReport, ...prev]);
			setName('');
			setTitle('');
			setFiles([]);
			toast.success("Фотоотчет успешно загружен!");
		}
		} catch (error) {
		toast.error(axios.isAxiosError(error)
			? error.response?.data?.error || "Ошибка при загрузке"
			: "Неизвестная ошибка");
		}
	};

	const handleDeletePhotoReport = async (photoReportId) => {
		try {
		const response = await axios.delete("/api/dashboard/projects/tasks/photoReports", {
			params: { photoReportId }
		});

		if (response.status === 200) {
			setPhotoReports(prev => prev.filter(report => report.id !== photoReportId));
			toast.success("Фотоотчет удалён");
		}
		} catch (error) {
			toast.error(`Не удалось удалить фотоотчет ${error.response?.data?.error}`);
		}
	};

	const handleDownloadFiles = (images) => {
		images.forEach(img => downloadFile(img.src));
	};
	return (
		<div className="flex flex-col gap-4 shadow-2xl p-4 border-2 rounded-lg">
		<h2 className="font-bold text-lg">Фотоотчеты</h2>

		{/* Загрузка файлов и ввод названия/описания — без изменений */}
{/* Зона загрузки файлов */}
<div className="flex flex-col items-center gap-4 bg-gray-50 hover:bg-gray-100 p-6 border-2 border-gray-300 border-dashed rounded-lg transition-colors duration-200">
        <div className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="text-gray-600 text-sm">Перетащите файлы сюда или</p>
        </div>

        <label className="bg-gold hover:bg-gold-hover shadow-md px-6 py-2 rounded-lg text-white cursor-pointer">
          Выбрать файлы
          <input
            type="file"
            accept="image/png, image/gif, image/jpeg"
            onChange={handleFilesUpload}
            className="hidden"
            multiple
          />
        </label>

        {files.length > 0 && (
          <div className="mt-2 text-sm text-gray-700">
            <p className="font-medium">Выбрано файлов: {files.length}</p>
            <ul className="list-disc pl-5">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Поля ввода */}
      <div className="flex flex-col gap-3">
        <TextField
          label="Название фотоотчета"
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
        className="bg-gold hover:bg-gold-hover shadow-md py-2 rounded-md text-white transition"
      >
        Сохранить фотоотчет
      </button>


		{/* Список фотоотчетов */}
		<div className="flex flex-col gap-3 p-4">
			{photoReports.map((report) => (
			<div
				key={report.id}
				className="flex flex-col gap-2 bg-white shadow-md hover:shadow-lg p-4 rounded-lg transition-shadow duration-300"
			>
				<div className="flex justify-between items-start">
				<div>
					<h3 className="font-semibold text-gray-800 text-lg">{report.name}</h3>
					<p className="text-gray-600">{report.title}</p>
					<p className="text-gray-500 text-sm mt-1">
					{new Date(report.createdAt).toLocaleDateString()}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
					onClick={() => handleDownloadFiles(report.images)}
					className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full"
					title="Скачать все изображения"
					>
					<MdDownload size={20} className="text-white" />
					</button>
					<button
					onClick={() => handleDeletePhotoReport(report.id)}
					className="bg-red-500 hover:bg-red-600 p-2 rounded-full"
					title="Удалить фотоотчет"
					>
					<MdDelete size={20} className="text-white" />
					</button>
				</div>
				</div>

				{report.images?.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-3">
					{report.images.map((img, i) => (
					<img
						key={i}
						src={img.src}
						alt={`img-${i}`}
						className="w-20 h-20 object-cover rounded shadow cursor-pointer"
						onClick={() => setSelectedImage(img.src)} // 👈 клик для модалки
					/>
					))}
				</div>
				)}
			</div>
			))}
		</div>

		{/* Модальное окно для изображения */}
		<Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="lg">
			<div className="p-4">
			<img
				src={selectedImage}
				alt="Просмотр изображения"
				className="max-w-full max-h-[80vh] rounded shadow-lg"
			/>
			</div>
		</Dialog>
		</div>
	);
};

export default PhotoReports;
