'use client';
import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Box, Button, Typography } from '@mui/material';
import { KanbanProvider, useKanban } from './KanbanContext';
import Column from './Column';
import Link from 'next/link';
import axios from 'axios';
import { Session } from "next-auth";

interface KanbanBoardComponentProps {
  session: Session | null; // Тип для session
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface StaffResponse {
  staff: StaffMember[];
}

const KanbanBoardComponent = ({ session }: KanbanBoardComponentProps) => {
  const { data, onDragEnd } = useKanban();
  const totalTasks = data.columnOrder.reduce((acc: number, columnId: string) => acc + data.columns[columnId].orders.length, 0);
  const [staff, setStaff] = useState<StaffMember[]>([]); // Укажите тип для состояния `staff`
  useEffect(() => {
    axios.get<StaffResponse>("/api/getStaff")
      .then((response) => setStaff(response.data.staff))
      .catch((error) => console.error("Ошибка при загрузке staff:", error));
  }, []);  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: '20px' }}>
        <Typography variant='h4' className='flex items-center gap-1'>
          Jobs<span className='text-sm'>({totalTasks})</span>
        </Typography>
        <Link href={"/dashboard/jobs/create"} className='font-bold hover:text-primary text-sm hover:underline'>
          <Button variant="contained" sx={{ color: 'white', backgroundColor: 'primary.main' }}>Add new</Button>
        </Link>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ display: 'flex', flexGrow: 1, my: 2 }}>
            {data.columnOrder.map((columnId: string) => {
              const column = data.columns[columnId];
              return (
                <Column key={column.id} columnId={column.id} column={column} session={session} staff={staff} />
              );
            })}
          </Box>
        </DragDropContext>
      </Box>
    </>
  );
};


const KanbanBoard = ({ session }: KanbanBoardComponentProps) => (
  <KanbanProvider>
    <KanbanBoardComponent session={session} />
  </KanbanProvider>
);

export default KanbanBoard;
