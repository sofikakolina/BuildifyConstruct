'use client'
import { Box, Typography, Button, Paper } from '@mui/material';
import { useState } from 'react';
import TaskFormComponent from './TaskForm';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useKanban } from './KanbanContext';  // Используем KanbanContext

export default function Tasks({ /*formatDate*/ task }) {
    // const [editingTaskId, setEditingTaskId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { addTask } = useKanban();

    // const tasks = task.tasks;  

    // const startEditTask = (taskId) => {
    //     console.log("starting")
    //     setEditingTaskId(taskId);
    // };

    // const saveEditedTask = async task => {
    //     if (!task.description) task.description = null;
    //     try {
    //         await axios.post("/api/editTask", {
    //             id: task.id, title: task.title, description: task.description,
    //             assigneeId: task.assigneeId, dueDate: task.dueDate, done: task.done
    //         });
    //         updateTask(task.id, task.id, task); 
    //         setEditingTaskId(null);
    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // };

	const saveNewTask = async task => {
		if (!task.description) delete task.description;
		try {
			const response = await axios.post("/api/createTask", {
				orderId: task.id, title: task.title, description: task.description,
				dueDate: task.dueDate, assigneeId: task.assignee.id
			});
			if (response && response.task && response.task.id) {
				const newTaskWithId = { ...task, id: response.task.id }; 
				addTask(task.id, newTaskWithId);
				setShowCreateForm(false);
			} else {
				throw new Error("Failed to receive task ID from the server");
			}
		} catch (error) {
			toast.error(error.message || "Failed to create task");
		}
	};
	


    // const handleDeleteTask = async taskId => {
    //     try {
    //         await axios.post("/api/deleteTask", { id: taskId });
    //         removeTask(task.id, taskId); 
    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // };

    // const handleToggleDone = async taskId => {
    //     const task = tasks.find(t => t.id === taskId);
    //     if (task) {
    //         const updatedTask = { ...task, done: !task.done };
    //         try {
    //             await axios.post("/api/editTask", { id: taskId, done: !task.done });
    //             updateTask(task.id, taskId, updatedTask); 
    //         } catch (error) {
    //             toast.error(error.message);
    //         }
    //     }
    // };

	
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography sx={{ fontWeight: 'bold', mb: 2 }} variant='body1'>Tasks {/*({tasks.filter(task => task.done).length} / {tasks.length})*/}</Typography>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button size="large" onClick={() => setShowCreateForm(true)} sx={{ color: 'white', display: 'flex' }} variant="contained">
						Add new task
					</Button>
				</Box>
			</Box>
			<Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
				{showCreateForm && (
					<TaskFormComponent task={task} onSave={saveNewTask} onCancel={() => setShowCreateForm(false)} />
				)}
				{/* {task.map((task, index) => (
					<Box key={task.id}>
						{editingTaskId === task.id ? (
							<TaskFormComponent task={task} initialValue={task} onSave={saveEditedTask} onCancel={() => setEditingTaskId(null)} />
						) : (
							<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', pb: 2 }}>
								<Checkbox
									checked={task.done}
									onChange={() => handleToggleDone(task.id)}
								/>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
											<Typography sx={{ fontWeight: 'bold' }} variant='body1'>{task.title}</Typography>
											<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
												<IconButton
													aria-label="edit"
													onClick={(e) => {
														e.preventDefault();
														startEditTask(task.id);
													}}
													sx={{
														color: (theme) => theme.palette.grey[500],
													}}
												>
													<EditIcon />
												</IconButton>
												<IconButton
													aria-label="delete"
													onClick={() => handleDeleteTask(task.id)}
													sx={{
														color: (theme) => theme.palette.grey[500],
													}}
												>
													<Delete />
												</IconButton>
											</Box>
										</Box>
										<Typography sx={{ fontSize: '14px' }} variant="body2">{task.description}</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} key={task.assignee.id}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
												{task.assignee.image ? (
													<Avatar alt={task.assignee.name} src={task.assignee.image} />
												) : (
													<Avatar sx={{ bgcolor: grey[500] }}>{task.assignee.name[0]}</Avatar>
												)}
												<Typography sx={{ fontSize: '16px', fontWeight: 'bold' }} variant="body2">{task.assignee.name}</Typography>
											</Box>
											<Typography sx={{ fontSize: '14px', fontWeight: 'bold', color: 'grey' }} variant="body2">{formatDate(task.dueDate)}</Typography>
											<Typography sx={{ fontSize: '14px', borderRadius: '8px', py: 1, px: 2, border: '1px solid grey' }} variant="body2">{task.assignee.role}</Typography>
										</Box>
									</Box>

								</Box>
							</Box>
						)}
						{index !== task.tasks.length - 1 && <Divider />}
					</Box>
				))} */}
			</Paper>
		</Box>
	)
}