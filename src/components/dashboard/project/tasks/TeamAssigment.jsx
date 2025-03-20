'use client'
import { useState, useEffect } from 'react';
import { Box, Typography, Grid, FormControl, Select, OutlinedInput, MenuItem, useTheme  } from '@mui/material';
import axios from 'axios';
import toast from 'react-hot-toast';
// import ClearIcon from '@mui/icons-material/Clear';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, selectedMembers, theme) {
  return {
    fontWeight: selectedMembers.some(member => member.lastName === name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function TeamAssignment({ task, staff }) {
  const theme = useTheme();
  const [selectedMembers, setSelectedMembers] = useState(task.assignedStaff);

  // Синхронизация selectedMembers с task.assignedStaff
  useEffect(() => {
    setSelectedMembers(task.assignedStaff);
  }, [task.assignedStaff]);

  const handleChange = async (event) => {
    const { value } = event.target;

    // Преобразуем массив id в массив объектов worker
    const newSelectedMembers = staff.filter(worker => value.includes(worker.id));

    // Находим добавленных и удалённых сотрудников
    const addedMembers = newSelectedMembers.filter(
      worker => !selectedMembers.some(member => member.id === worker.id)
    );
    const removedMembers = selectedMembers.filter(
      member => !newSelectedMembers.some(worker => worker.id === member.id)
    );

    try {
      // Добавляем новых сотрудников
      for (const worker of addedMembers) {
        await axios.post("/api/dashboard/projects/tasks/teamAssigment", {
          userId: worker.id,
          taskId: task.id,
        });
        console.log("Added worker:", worker.id);
      }

      // Удаляем сотрудников
      for (const worker of removedMembers) {
        await axios.delete("/api/dashboard/projects/tasks/teamAssigment", {
          params: { userId: worker.id, taskId: task.id },
        });
        console.log("Removed worker:", worker.id);
      }

      // Обновляем состояние selectedMembers
      setSelectedMembers(newSelectedMembers);
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: "100%" }}>
      <Typography variant="h6" component="h2">
        Team Assignments
      </Typography>
      <Grid>
        <div>
          {selectedMembers.map(member => (
            <div className='flex justify-between gap-3' key={member.id}>
              <h3 className='flex'>{member.firstName} {member.lastName}</h3>
              <h3>{member.role}</h3>
            </div>
          ))}
        </div>
        <div>
          <FormControl sx={{ m: 1, width: "100%", mt: 3 }}>
            <Select
              multiple
              displayEmpty
              value={selectedMembers.map(member => member.id)} // Используем массив id
              onChange={handleChange} // Передаём только event
              input={<OutlinedInput />}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Выберите работников</em>;
                }

                // Преобразуем worker.id в worker.lastName для отображения
                const selectedNames = selected.map(id => {
                  const worker = staff.find(worker => worker.id === id);
                  return worker ? worker.lastName : '';
                });

                return selectedNames.join(', ');
              }}
              MenuProps={MenuProps}
              inputProps={{ 'aria-label': 'Without label' }}
            >
              {staff.map((worker) => (
                <MenuItem
                  key={worker.id}
                  value={worker.id} // Используем worker.id как значение
                  style={getStyles(worker.lastName, selectedMembers, theme)}
                >
                  {worker.lastName} {worker.firstName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Grid>
    </Box>
  );
}