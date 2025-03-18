'use client';
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Checkbox, Autocomplete } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const TaskFormComponent = ({ initialValue, onSave, onCancel, order }) => {
    useEffect(() => {
        setTitle(initialValue?.title || "");
        setDescription(initialValue?.description || "");
        setSelectedDate(dayjs(initialValue?.dueDate || new Date()));
        setSelectedAssignee(initialValue?.assignee || null);
    }, [initialValue]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedAssignee, setSelectedAssignee] = useState(null);

    const handleSave = () => {
        if (!title || !selectedAssignee || !selectedDate) {
            alert("Please fill all fields correctly.");  // Простое предупреждение, может быть заменено на более продвинутую валидацию
            return;
        }
        onSave({
            ...initialValue,
            title,
            description,
            assignee: selectedAssignee,
            dueDate: selectedDate.toISOString(),
        });
    };

    const handleDateChange = (newValue) => {
        setSelectedDate(newValue);
    };

	return (
		<Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
			<Box>
				<Checkbox />
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2, width: '100%' }}>
				<TextField
					label="Title"
					variant="outlined"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<TextField
					label="Description"
					multiline
					rows={4}
					variant="outlined"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
					<Autocomplete
						disablePortal
						id="users-assignee"
						options={order.staffAssignments.map(a => a.employee)}
						isOptionEqualToValue={(option, value) => option.id == value.id}
						sx={{ minWidth: '320px' }}
						getOptionLabel={option => option.name}
						value={selectedAssignee}
						onChange={(event, newValue) => {
							setSelectedAssignee(newValue);
						}}
						renderInput={(params) => <TextField {...params} label="Assignee" />}
					/>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Due Date"
							value={selectedDate}
							onChange={handleDateChange}
							renderInput={params => <TextField {...params} />}
						/>
					</LocalizationProvider>
				</Box>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
					<Button variant="contained" sx={{ color: 'white', borderRadius: '8px' }} onClick={onCancel} color="warning">
						Cancel
					</Button>
					<Button variant="contained" sx={{ color: 'white', borderRadius: '8px' }} onClick={handleSave} color="primary">
						Save Task
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default TaskFormComponent;

