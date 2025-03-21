'use client';
import { useEffect, useState } from "react";
import axios from 'axios'; // Импортируем AxiosError для типизации ошибок
import { useAppSelector } from '@/lib/hooks';
import toast from "react-hot-toast";
// import IFCViewer from "@/components/dashboard/project/ifc/IFCViewer";
import { TextField } from "@mui/material";

const Documents = ({task}) => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [nameFile, setNameFile] = useState('');
  const [titleFile, setTitleFile] = useState('');
//   const [selectedIFC, setSelectedIFC] = useState(null);
  const idCurrentProject = useAppSelector(state => state.idCurrentProject.value);
	useEffect(() => {
		setDocuments(task.documents)
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
	formData.append("taskId", task.id);
	formData.append("name", nameFile);
	formData.append("title", titleFile);

	try {
	  const response = await axios.post("/api/dashboard/projects/tasks/documents", formData, {
		headers: {
		  "Content-Type": "multipart/form-data",
		},
	  });

	  if (response.status === 200) {
		setDocuments(prev => [response.data, ...prev]) // Заменяем существующий IFC-файл
		toast.success("IFC-файл успешно загружен!");
	  }
	} catch (error) {
	  if (axios.isAxiosError(error)) {
		// Обработка ошибок Axios
		if (error.response?.data?.error === "An IFC file already exists for this project") {
		  toast.error("IFC-файл уже существует для этого проекта. Удалите его перед загрузкой нового.");
		} else {
		  toast.error("Не удалось загрузить IFC-файл");
		}
	  } else if (error instanceof Error) {
		// Обработка других ошибок
		toast.error(`Ошибка: ${error.message}`);
	  } else {
		toast.error("Произошла неизвестная ошибка");
	  }
	}
  };

  const handleChangeNameFile = (event) => {
	setNameFile(event.target.value);
	};
	const handleChangeTitleFile = (event) => {
		setTitleFile(event.target.value);
	};
  return (
	<div>
	  <div className="flex flex-col gap-4 shadow-2xl p-4 border-2 rounded-lg">
		<h1 className="mb-4 font-bold text-xl">Документы</h1>
		<input
		  type="file"
		//   accept=".ifc"
		  onChange={handleFileUpload}
		  className="mb-4"
		/>
		<div className="flex gap-1">
			<TextField
				aria-label="nameFile"
				rows={1}
				placeholder="Название файла..."
				multiline
				style={{ width: "100%" }}
				value={nameFile}
				onChange={handleChangeNameFile}
			/>
			<TextField
				aria-label="titleFile"
				rows={1}
				placeholder="Описание файла..."
				multiline
				style={{ width: "100%" }}
				value={titleFile}
				onChange={handleChangeTitleFile}
			/>
		</div>
		<button  
			onClick={handleDocumentUpload}
			className="bg-gold py-2 rounded-md text-white"
		>
			Сохранить файл
		</button>
		<div className="flex flex-col p-4">
			{
				documents && documents.map(document => 
					<div className="flex gap-1" key={document.id}>
						<h3>{document.name}</h3>
						<h3>{document.title}</h3>
					</div>
				)
			}
	  	</div>	
	  </div>
	</div>
  );
};

export default Documents;