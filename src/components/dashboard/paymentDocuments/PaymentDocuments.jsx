'use client';
import { useEffect, useState } from "react";
import axios from 'axios'; // Импортируем AxiosError для типизации ошибок
import { useAppSelector } from '@/lib/hooks';
import toast from "react-hot-toast";
// import IFCViewer from "@/components/dashboard/project/ifc/IFCViewer";
import { InputAdornment, OutlinedInput, TextField } from "@mui/material";
import { MdDelete, MdDownload } from 'react-icons/md';
import { downloadFile } from "@/lib/download";
import { formatMoney } from "@/lib/formatMoney";

const PaymentDocuments = () => {
	const [file, setFile] = useState(null);
	const [documents, setDocuments] = useState([]);
	const [nameFile, setNameFile] = useState('');
	const [cost, setCost] = useState(0);
	const [titleFile, setTitleFile] = useState('');
	//   const [selectedIFC, setSelectedIFC] = useState(null);
	const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);
	useEffect(() => {
		const fetchData = async ()  => {
			try{
				const { data: paymentDocuments}  = await axios.get("/api/dashboard/projects/tasks/paymentDocuments", {
					params: {
						projectId: idCurrentProject
					}
				})
				console.log(paymentDocuments.paymentDocuments)
				setDocuments(paymentDocuments.paymentDocuments)
			} catch (error) {
				toast.error(`Ошибка загрузки документа: ${error.message}`);
			}
		}
		fetchData()
	},[])
	const handleFileUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setFile(file); // Заменяем существующий IFC-файл
	}
	const handleDocumentUpload = async () => {
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);
		formData.append("projectId", idCurrentProject);
		// formData.append("taskId", task.id);
		formData.append("cost", Math.round(cost*100));
		formData.append("name", nameFile);
		formData.append("title", titleFile);

		try {
		const response = await axios.post("/api/dashboard/projects/tasks/paymentDocuments", formData, {
			headers: {
			"Content-Type": "multipart/form-data",
			},
		});

		if (response.status === 200) {
			setDocuments(prev => [response.data.paymentDocument, ...prev]) // Заменяем существующий IFC-файл
			setNameFile('')
			setTitleFile('')
			setFile(null)
			toast.success("Документ успешно загружен!");
		}
		} catch (error) {
		if (axios.isAxiosError(error)) {
			// Обработка ошибок Axios
			if (error.response?.data?.error === "An Document file already exists for this project") {
				toast.error("IFC-файл уже существует для этого проекта. Удалите его перед загрузкой нового.");
			} else {
				toast.error("Не удалось загрузить документ");
			}
		} else if (error instanceof Error) {
			// Обработка других ошибок
			toast.error(`Ошибка: ${error.message}`);
		} else {
			toast.error("Произошла неизвестная ошибка");
		}
		}
	};

	const handleDeleteFile = async (documentId) => {
		const response = await axios.delete("/api/dashboard/projects/tasks/paymentDocuments", {
			params: {
			documentId: documentId
		}});

		if (response.status === 200) {
			setDocuments(prev => prev.filter(document => document.id != documentId))
			toast.success("IFC-файл успешно удален!");
		}	
	};

	const handleChangeNameFile = (event) => {
		setNameFile(event.target.value);
	};
	const handleChangeTitleFile = (event) => {
		setTitleFile(event.target.value);
	};
	const handleChangeCost = (event) => {
		const value = event.target.value;
		if (value[0]==0) value.slice(0,1)
		// Проверка на пустое значение
		if (value === "") {
		  setCost("");
		  return;
		}
	
		// Проверка на число и неотрицательное значение
		if (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0) {
		  setCost(value);
		}
	};
	const handleFocus = (event) => {
		// Стираем "0" при фокусе
		if (event.target.value === "0") {
		  setCost("");
		}
	};
	
	const handleBlur = (event) => {
		// Если поле пустое, возвращаем "0"
		if (event.target.value === "") {
		  setCost("0");
		}
	};
	
	return (
		<div className="flex flex-col gap-4 shadow-2xl p-4 border-2 rounded-lg">
			<h2 className="font-bold text-lg">Документы</h2>
			<div className="flex flex-col items-center gap-4 bg-gray-50 hover:bg-gray-100 p-6 border-2 border-gray-300 border-dashed rounded-lg transition-colors duration-200">
				{/* Иконка и текст */}
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
					<p className="text-gray-600 text-sm">
					Перетащите файл сюда или
					</p>
				</div>

				{/* Кнопка для выбора файла */}
				<label className="bg-gold hover:bg-gold-hover shadow-md px-6 py-2 rounded-lg text-white transition-colors duration-200 cursor-pointer">
					Выбрать файл
					<input
					type="file"
					onChange={handleFileUpload}
					className="hidden"
					/>
				</label>

				{/* Отображение имени файла */}
				{file && (
					<p className="mt-2 text-gray-700 text-sm">
					Выбран файл: <span className="font-medium">{file.name}</span>
					</p>
				)}
			</div>
			<div className="flex flex-col gap-1">
				<TextField
					aria-label="nameFile"
					rows={1}
					placeholder="Название файла..."
					multiline
					style={{ width: "100%" }}
					value={nameFile}
					onChange={handleChangeNameFile}
				/>
				<OutlinedInput
					id="outlined-adornment-weight"
					placeholder="Сумма..."
					type="text" // Меняем на text, чтобы контролировать ввод
					value={cost}
					onChange={handleChangeCost}
					onFocus={handleFocus} // Обработчик фокуса
					onBlur={handleBlur} // Обработчик потери фокуса
					endAdornment={<InputAdornment position="end">руб</InputAdornment>}
					aria-describedby="outlined-weight-helper-text"
					inputProps={{
						"aria-label": "weight",
						inputMode: "numeric", // Подсказка для мобильных устройств
						pattern: "[0-9]*", // Паттерн для числового ввода
					}}
				/>
				<TextField
					aria-label="titleFile"
					rows={4}
					placeholder="Описание файла..."
					multiline
					style={{ width: "100%" }}
					value={titleFile}
					onChange={handleChangeTitleFile}
				/>
			</div>
			<button  
				onClick={handleDocumentUpload}
				className="bg-gold hover:bg-gold-hover shadow-md py-2 rounded-md text-white transition"
			>
				Сохранить документ
			</button>
			<div className="flex flex-col p-4">
			{
				documents && documents.map(document => (
					<div className="flex justify-between items-center bg-white shadow-md hover:shadow-lg mb-3 p-4 rounded-lg transition-shadow duration-300" key={document.id}>
					<div className="flex flex-col items-start">
						<h3 className="font-semibold text-gray-800 text-lg">{document.name}</h3>
						<h3 className="text-gray-600 text-lg">{document.title}</h3>
						<h3 className="text-gray-600 text-lg">{formatMoney(document.cost/100)}</h3>
						{document.taskId && <h3 className="text-gray-600 text-lg">taskId: {document.taskId}</h3>}
					</div>
					<div className="flex items-center gap-2">
						{/* Кнопка скачивания */}
						<button 
							onClick={() => downloadFile(document.path)} 
							className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors duration-200"
						>
							<MdDownload size={20} className="text-white" />
						</button>
						{/* Кнопка удаления */}
						<button 
							onClick={() => handleDeleteFile(document.id)} 
							className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors duration-200"
						>
							<MdDelete size={20} className="text-white"/>
						</button>
					</div>
					</div>
				))
			}
			</div>	
		</div>
	);
};

export default PaymentDocuments;