'use client';
import { Modal, Box, Typography, IconButton, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { OrderPriority } from '@prisma/client';
import DetailsTextarea from './DetailsTextarea';
import Documents from './Documents';
import PaymentDocuments from './PaymentDocuments';
// import Customer from './Customer';
import Status from './Status';
import TeamAssigment from './TeamAssigment';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import GeneratePdf from "./GeneratePdf";
import { useEffect, useState } from 'react';

export default function OrderModal({ task, openOrder, handleCloseOrder, priority, setPriority, formatDate, staff, data, updateData }) {
	const [newPriority, setNewPriority] = useState('')
	useEffect(()=>{
		setNewPriority(priority)
	}, [])
	const handleChange = async event => {
		const newPriorityFromUser = event.target.value;
		try {
			await axios.post("/api/dashboard/projects/tasks", { id: task.id, priority: newPriorityFromUser });
			setPriority(newPriorityFromUser);
			setNewPriority(newPriorityFromUser);

			const updatedTask = { ...task, priority: newPriorityFromUser };
			const columnIndex = data.columnTask.findIndex(col => data.columns[col].tasks.some(o => o.id === task.id));
			const taskIndex = data.columns[data.columnTask[columnIndex]].tasks.findIndex(o => o.id === task.id);
			updateData(data.columnTask[columnIndex], taskIndex, updatedTask);

			toast.success("Приоритет удачно обновлен");
		} catch (error) {
			toast.error(error.message);
		}
	};

  return (
    <Modal
      open={openOrder}
      onClose={handleCloseOrder}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto', // Добавляем прокрутку для модального окна
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          position: 'relative',
          maxHeight: '90vh', // Ограничиваем максимальную высоту модального окна
          overflowY: 'auto', // Добавляем прокрутку внутри модального окна
          width: '90%', // Ограничиваем ширину модального окна
          maxWidth: '1200px', // Максимальная ширина модального окна
        }}
      >
        <IconButton
          aria-label="close"
          onClick={handleCloseOrder}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: "15px" }}>
                <GeneratePdf task={task} />
                <Link href={`/dashboard/jobs/${task.id}`}>
                  <IconButton
                    aria-label="edit"
                    sx={{
                      borderRadius: '4px',
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: 'white',
                      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.dark,
                        boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
                        color: 'white',
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Link>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5">TSK #{task.id}</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="priority">Priority</InputLabel>
                    <Select
                      labelId="priority"
                      id="priority"
                      value={newPriority}
                      label="Приоритет"
                      onChange={handleChange}
                    >
                      <MenuItem value={OrderPriority.Normal}>{OrderPriority.Normal}</MenuItem>
                      <MenuItem value={OrderPriority.Rush}>{OrderPriority.Rush}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <DetailsTextarea task={task} />
              <Documents formatDate={formatDate} task={task} />
              <PaymentDocuments formatDate={formatDate} task={task} />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* <Customer task={task} /> */}
              <Status formatDate={formatDate} task={task} data={data} />
              <TeamAssigment task={task} staff={staff} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}