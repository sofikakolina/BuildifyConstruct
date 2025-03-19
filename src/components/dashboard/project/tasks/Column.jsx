'use client';
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Paper, Typography, Box } from '@mui/material';
import TaskCard from './TaskCard';

const Column = ({ columnId, column, session, staff }) => {
	return (
		<Paper sx={{
			mx: 1,
			display: 'flex',
			boxShadow: 'none',
			backgroundColor: '#e9edf1',
			flexDirection: 'column',
			gap: '5px',
			borderRadius: '10px',
			minWidth: '320px',
			overflow: 'hidden', // Добавлено для предотвращения выхода содержимого за пределы Paper
		}}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: '15px', pt: '15px' }}>
				<Typography variant="h6" sx={{ fontSize: '16px' }}>{column.title}</Typography>
				<Typography variant="h6" sx={{ fontSize: '12px' }}>{column.tasks.length}</Typography>
			</Box>
			<Droppable droppableId={columnId}>
				{(provided) => (
					<Box
						ref={provided.innerRef}
						{...provided.droppableProps}
						sx={{
							height: 'calc(100vh - 230px)', // Пример высоты, адаптируйте под ваш случай
							overflow: 'hidden auto',
							backgroundColor: '#e9edf1',
							paddingX: '8px',
							marginX: '8px',
							display: 'flex', flexDirection: 'column',
						}}
					>
						{column.tasks.map((task, index) => (
							<Draggable key={task.id} draggableId={task.id} index={index}>
								{(provided) => (
									<Box
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										sx={{ mb: '8px' }}
									>
										<TaskCard task={task} session={session} staff={staff}/>
									</Box>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</Box>
				)}
			</Droppable>
		</Paper>
	);
};

export default Column;
