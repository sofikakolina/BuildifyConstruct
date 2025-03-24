'use client';
import { Box, TextField, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useKanban } from './KanbanContext';

export default function DetailsTextarea({ task }) {
	const { data, updateData } = useKanban();
	const [isEditing, setIsEditing] = useState(false);
	const [text, setText] = useState(task.details || '');


	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = async () => {
		try {
			await axios.put("/api/dashboard/projects/tasks", { id: task.id, details: text });
			const updatedOrder = { ...task, details: text };
			const columnIndex = data.columnTask.findIndex(col => data.columns[col].tasks.some(o => o.id === task.id));
			const orderIndex = data.columns[data.columnTask[columnIndex]].tasks.findIndex(o => o.id === task.id);
			updateData(data.columnTask[columnIndex], orderIndex, updatedOrder);
	
			toast.success("Детали успешно сохранены!");
			setIsEditing(false);
		} catch (error) {
			toast.error(error.message);
		}
	};
	

	const handleChangeDetails = (event) => {
		setText(event.target.value);
	};

	return (
		<Box>
			<Paper elevation={2} sx={{ p: 2, minHeight: '150px' }}>
				<h2 className="font-bold text-lg">Детали</h2>
				{!isEditing ? (
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Box sx={{ flexGrow: 1 }}>{text}</Box>
						<EditIcon onClick={handleEdit} sx={{ cursor: 'pointer' }} />
					</Box>
				) : (
					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField
							aria-label="details"
							rows={4}
							placeholder="Details"
							multiline
							style={{ width: "100%" }}
							value={text}
							onChange={handleChangeDetails}
						/>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<button 
								size="large" 
								onClick={handleSave}
								className='bg-gold hover:bg-gold-hover px-6 py-2 rounded-lg text-white transition-colors duration-200'
								variant="contained">
								Сохранить
							</button>
						</Box>
					</Box>
				)}
			</Paper>
		</Box>
	)
}