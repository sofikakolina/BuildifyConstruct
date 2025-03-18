'use client';
import { Box, TextField, Typography, Button, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useKanban } from './KanbanContext';

export default function DetailsTextarea({ order }) {
	const { data, updateData } = useKanban();
	const [isEditing, setIsEditing] = useState(false);
	const [text, setText] = useState(order.details || '');


	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = async () => {
		try {
			await axios.post("/api/editOrder", { id: order.id, details: text });
			const updatedOrder = { ...order, details: text };
			const columnIndex = data.columnOrder.findIndex(col => data.columns[col].orders.some(o => o.id === order.id));
			const orderIndex = data.columns[data.columnOrder[columnIndex]].orders.findIndex(o => o.id === order.id);
			updateData(data.columnOrder[columnIndex], orderIndex, updatedOrder);
	
			toast.success("Details saved successfully");
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
			<Typography sx={{ fontWeight: 'bold', mb: 2 }} variant='body1'>Details</Typography>
			<Paper elevation={2} sx={{ p: 2, minHeight: '150px' }}>
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
							<Button size="large" onClick={handleSave}
								sx={{ color: 'white', display: 'flex' }}
								variant="contained">
								Save
							</Button>
						</Box>
					</Box>
				)}
			</Paper>
		</Box>
	)
}