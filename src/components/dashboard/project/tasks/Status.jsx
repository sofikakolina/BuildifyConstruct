'use client';
import { useState } from 'react';
import { Box, Typography, Button, Popover, Autocomplete, TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { TaskStatus } from '@prisma/client';
// import axios from 'axios';
// import toast from 'react-hot-toast';
import { useKanban } from './KanbanContext';

export default function Status({ task, formatDate }) {
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedStatus, setSelectedStatus] = useState(task.status);
	const [selectedDate, setSelectedDate] = useState(dayjs(task.targetEnd));
	const [dateAnchorEl, setDateAnchorEl] = useState(null);
	const {updateOrderStatus, updateOrderDueDate} = useKanban();

	const handleStatusClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleStatusClose = () => {
		setAnchorEl(null);
	};

	const handleDateClick = (event) => {
		setDateAnchorEl(event.currentTarget);
	};

	const handleDateClose = () => {
		setDateAnchorEl(null);
	};

	const statusOpen = Boolean(anchorEl);
	const statusId = statusOpen ? 'status-popover' : undefined;

	const dateOpen = Boolean(dateAnchorEl);
	const dateId = dateOpen ? 'date-popover' : undefined;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				<Typography variant="h6" component="h2">
					Статус
				</Typography>
				<Box>
					<Button sx={{ color: 'white', borderRadius: '8px' }} aria-describedby={statusId} variant="contained" onClick={handleStatusClick}>
						{selectedStatus}
					</Button>
				</Box>
				<Popover
					id={statusId}
					open={statusOpen}
					anchorEl={anchorEl}
					onClose={handleStatusClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
				>
					<Box sx={{ p: 2 }}>
						<Autocomplete
							options={Object.keys(TaskStatus)}
							style={{ padding: 2, width: 300 }}
							renderInput={(params) => <TextField {...params} label="Status" />}
							onChange={(event, newValue) => {
                                if (newValue) {
                                    updateOrderStatus(task.id, newValue).then(() => {
                                        setSelectedStatus(newValue);
                                    });
                                }
                                handleStatusClose();
                            }}
						/>
					</Box>
				</Popover>
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				<Typography variant="body1" component="h5">
					Due Date
				</Typography>
				<Box>
					<Button sx={{ borderRadius: '8px' }} aria-describedby={dateId} variant="text" onClick={handleDateClick}>
						{formatDate(selectedDate)}
					</Button>
				</Box>
				<Popover
					id={dateId}
					open={dateOpen}
					anchorEl={dateAnchorEl}
					onClose={handleDateClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
				>
					<Box sx={{ p: 2 }}>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DatePicker
								label="Select Date"
								value={selectedDate}
								onChange={(newValue) => {
                                    if (newValue) {
                                        updateOrderDueDate(task.id, newValue).then(() => {
                                            setSelectedDate(newValue);
                                        });
                                    }
                                    handleDateClose();
                                }}
								renderInput={(params) => <TextField {...params} />}
							/>
						</LocalizationProvider>
					</Box>
				</Popover>
			</Box>
		</Box>
	);
}

