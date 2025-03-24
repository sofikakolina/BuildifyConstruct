"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Autocomplete,
  Chip,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TaskStatus } from "@prisma/client";
import { useAppSelector } from "@/lib/hooks";
import { MdDelete } from "react-icons/md";

export default function CreateTask() {
	const taskStatuses = Object.keys(TaskStatus);
	const [taskStatus, setTaskStatus] = useState("Todo");
	const [usersForTeam, setUsersForTeam] = useState([]);
	const [team, setTeam] = useState([]); // Состояние для хранения выбранных участников
	const [taskName, setTaskName] = useState("");
	const [details, setDetails] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { control } = useForm({});
	const idCurrentProject = useAppSelector((state) => state.idCurrentProject.value);
	const [nameFile, setNameFile] = useState('');
	const [titleFile, setTitleFile] = useState('');
	const [file, setFile] = useState(null);
	const [documents, setDocuments] = useState([]);
	// Обработчик изменения выбора пользователей
	const handleAutocompleteChange = (event, value) => {
		setTeam(value); // Обновляем состояние team выбранными пользователями
	};
	const handleFileUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setFile(file); // Заменяем существующий IFC-файл
	}
	// Удаление участника из команды
	const handleRemoveUser = (userId) => {
		setTeam((prevTeam) => prevTeam.filter((user) => user.id !== userId));
	};
	const handleAddDocumentToArray = async () => {
		if (nameFile && file) {
			setDocuments(prev => [ {name: nameFile, file, title: titleFile}, ...prev])
			setNameFile('')
			setFile(null)
			setTitleFile('')
		}
	}

	// Отправка данных
	const sendData = async () => {
		// setIsLoading(true);
		try {
		  const { data: task } = await axios.post("/api/dashboard/projects/tasks", {
			details,
			status: taskStatus,
			name: taskName,
			projectId: idCurrentProject
		  });
		  await Promise.all([
			...documents.map(async (document) => {
			  try {
				const formData = new FormData();
				formData.append("file", document.file);
				formData.append("projectId", idCurrentProject);
				formData.append("taskId", task.id);
				formData.append("name", document.name);
				formData.append("title", document.title);
				await axios.post("/api/dashboard/projects/tasks/documents", formData, {
				  headers: {
					"Content-Type": "multipart/form-data",
				  },
				});
			  } catch (error) {
				toast.error(`Ошибка загрузки документа: ${error.message}`);
				throw error; // Прерываем выполнение при ошибке
			  }
			}),
			...team.map(async (user) => {
			  try {
				await axios.post("/api/dashboard/projects/tasks/teamAssigment", {
				  userId: user.id,
				  taskId: task.id,
				});
			  } catch (error) {
				toast.error(`Ошибка назначения пользователя: ${error.message}`);
				throw error;
			  }
			})
		  ]);
		  toast.success("Задача успешно создана!");
		  router.push("/dashboard/project/tasks");
		} catch (error) {
		  toast.error(error.message);
		} finally {
		  setIsLoading(false);
		}
	};

	// Загрузка данных о команде проекта
	useEffect(() => {
		setIsLoading(true);
		const fetchData = async () => {
		try {
			const staffOfProject = await axios.post("/api/dashboard/projects/team", {
			idCurrentProject,
			});
			setUsersForTeam(staffOfProject.data);
		} catch (error) {
			toast.error(error.message);
		}
		};
		fetchData();
	}, [idCurrentProject]);
	const handleChangeNameFile = (event) => {
		setNameFile(event.target.value);
	};
	const handleChangeTitleFile = (event) => {
		setTitleFile(event.target.value);
	};

	const handleDeleteFile = (fileName) => {
		setDocuments(prev => prev.filter(doc => doc.name !== fileName));
	}
  return (
    <>
      <Paper square={false} elevation={1} sx={{ padding: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography color="#f69220" variant="h2" sx={{ fontSize: "32px" }}>
            Создать задачу
          </Typography>
        </Box>
        <Box>
          <div>
			<Grid item xs={12} sx={{ mb: 4 }}>
              <TextField
                id="textarea-details"
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                label="Название задачи"
                multiline
                sx={{ width: "100%" }}
                rows={1}
              />
            </Grid>
            {/* Выбор статуса задачи */}
            <Grid item xs={12} sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
              >
                <Controller
                  name="taskStatus"
                  control={control}
                  render={({}) => (
                    <Autocomplete
                      disablePortal
                      fullWidth
                      id="order-status-select"
                      isOptionEqualToValue={(option, value) => option === value}
                      getOptionLabel={(option) => option}
                      options={taskStatuses}
                      onChange={(event, value) => setTaskStatus(value)}
                      renderInput={(params) => (
                        <TextField {...params} label="Статус задачи" />
                      )}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Выбор команды */}
            <Grid item xs={12} sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
              >
                <Controller
                  name="team"
                  control={control}
                  render={({}) => (
                    <Autocomplete
                      disablePortal
                      fullWidth
                      id="team-select"
                      multiple
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      getOptionLabel={(option) =>
                        `${option.firstName} ${option.lastName}`
                      }
                      options={usersForTeam}
                      onChange={handleAutocompleteChange}
                      value={team}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.id}>
                          {`${option.lastName} ${option.firstName}, ${option.role}`}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} label="Назначить команду" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { ...otherProps } = getTagProps({ index }); // Извлекаем key и остальные пропсы
                          return (
                            <Chip
                              key={option.id} // Передаем key напрямую
                              label={`${option.firstName} ${option.lastName}`}
                              onDelete={() => handleRemoveUser(option.id)}
                              {...otherProps} // Передаем остальные пропсы через spread
                            />
                          );
                        })
                      }
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Детали задачи */}
            <Grid item xs={12} sx={{ mb: 4 }}>
              <TextField
                id="textarea-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                label="Детали задачи"
                multiline
                sx={{ width: "100%" }}
                rows={4}
              />
            </Grid>

			<Grid item xs={12} sx={{ mb: 4 }}>
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
							onClick={handleAddDocumentToArray}
							className="bg-gold hover:bg-gold-hover shadow-md py-2 rounded-md text-white transition"
						>
							Добавить документ
						</button>
						<div className="flex flex-col p-4">
						{
							documents && documents.map(document => (
								<div className="flex justify-between items-center bg-white shadow-md hover:shadow-lg mb-3 p-4 rounded-lg transition-shadow duration-300" key={document.name}>
								<div className="flex flex-col items-start">
									<h3 className="font-semibold text-gray-800 text-lg">{document.name}</h3>
									<h3 className="text-gray-600 text-lg">{document.title}</h3>
								</div>
								<div className="flex items-center gap-2">
									<button 
									onClick={() => handleDeleteFile(document.name)} 
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
            </Grid>

            {/* Кнопка создания задачи */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
              <Button
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                sx={{ color: "white" }}
                onClick={sendData}
                disabled={!taskName || !taskStatus}
              >
                {isLoading ? "Создание..." : "Создать задачу"}
              </Button>
            </Box>
          </div>
        </Box>
      </Paper>
    </>
  );
}