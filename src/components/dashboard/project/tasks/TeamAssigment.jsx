'use client'
import { useState } from 'react';
import { Box, Typography, Button, Popover, Autocomplete, TextField, Grid, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Role } from '@prisma/client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useKanban } from './KanbanContext.jsx';
// import ClearIcon from '@mui/icons-material/Clear';

export default function TeamAssignment({ order, staff }) {
	console.log(order.staffAssignments)
	const [anchorEls, setAnchorEls] = useState({});
	const [selectedMembers, setSelectedMembers] = useState({
		'Production Manager': order.staffAssignments
			.filter(assignment => assignment.employee.role === Role.Executor)
			.map(assignment => assignment.employee),
		'Project Manager': order.staffAssignments
			.filter(assignment => assignment.employee.role === Role.Manager)
			.map(assignment => assignment.employee),
		'Sales Rep': order.staffAssignments
			.filter(assignment => assignment.employee.role === Role.Seller)
			.map(assignment => assignment.employee),
		'Designer': order.staffAssignments
			.filter(assignment => assignment.employee.role === Role.Designer)
			.map(assignment => assignment.employee),
	});
	
	const { addTeamMember, removeTeamMember } = useKanban();

	const handleClick = (event, role) => {
		setAnchorEls({
			...anchorEls,
			[role]: event.currentTarget,
		});
	};

	const handleClose = (role) => {
		setAnchorEls({
			...anchorEls,
			[role]: null,
		});
	};

	const handleSelect = async (newAssignees, role) => {
		const roleKey = roles[role];
		const previous = selectedMembers[roleKey];
		
		const addedAssignees = newAssignees.filter(assignee => !previous.includes(assignee));
		const removedAssignees = previous.filter(assignee => !newAssignees.includes(assignee));

		try {
			for (const assignee of addedAssignees) {
				await axios.post("/api/createStaffAssignment", { orderId: order.id, employeeId: assignee.id });
				addTeamMember(order.id, role, assignee);
			}

			for (const assignee of removedAssignees) {
				await axios.post("/api/deleteStaffAssignment", { orderId: order.id, employeeId: assignee.id });
				removeTeamMember(order.id, assignee.id);
			}

			setSelectedMembers(members => ({
				...members,
				[roleKey]: newAssignees
			}));
		} catch (error) {
			toast.error("Failed to update team members: " + error.message);
		}
	};

	const roles = {
		[Role.Executor]: 'Production Manager',
		[Role.Manager]: 'Project Manager',
		[Role.Seller]: 'Sales Rep',
		[Role.Designer]: 'Designer'
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography variant="h6" component="h2">
				Team Assignments
			</Typography>
			<Grid container spacing={2}>
				{Object.keys(roles).map((role, index) => (
					<Grid item xs={6} key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Typography sx={{ fontSize: '14px' }} variant="body1" component="h6">
							{roles[role]}
						</Typography>
						<Box>
							{selectedMembers[roles[role]] && selectedMembers[roles[role]].length > 0 ? (
								<Box sx={{ display: 'flex', flexDirection:"column", alignItems: 'start', gap: 1 }}>
									{selectedMembers[roles[role]].map((member, index) => (
										<Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Avatar sx={{ width: '24px', height: '24px', fontSize: '12px' }} src={member.image || ''}>
												{!member.image ? member.name[0] : null}
											</Avatar>
											<Typography sx={{ p: 0, justifyContent:"start", textAlign:"start" }} variant='text'>{member.name}</Typography>
										</Box>
									))}
								</Box>
							) : null}
							<Button variant='contained' sx={{ borderRadius: '8px', color: 'white', marginTop:"10px" }} onClick={(e) => handleClick(e, roles[role])}>
								<EditIcon />
							</Button>
							<Popover
								open={Boolean(anchorEls[roles[role]])}
								anchorEl={anchorEls[roles[role]]}
								onClose={() => handleClose(roles[role])}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'left',
								}}
							>
								<Box sx={{ p: 2, display: 'flex' }}>
									<Autocomplete
										multiple
										options={staff[role.toLowerCase() + "s"]}
										value={selectedMembers[roles[role]] || []}
										getOptionLabel={(option) => option.name}
										isOptionEqualToValue={(option, value) => option.id === value.id}
										sx={{ width: '100%', minWidth: '300px' }}
										renderOption={(props, option) => (
											<Box key={option.id} {...props} sx={{ display: 'flex', alignItems: 'center' }}>
												<Avatar sx={{ width: '24px', height: '24px', fontSize: '12px', mr: 1 }} src={option.image || ''}>
													{!option.image ? option.name[0] : null}
												</Avatar>
												{option.name}
											</Box>
										)}
										renderInput={(params) => <TextField {...params} label="Select team members" />}
										onChange={(event, newAssignees) => {
											handleSelect(newAssignees, role);
										}}
									/>
								</Box>
							</Popover>

						</Box>
					</Grid>
				))}
			</Grid>
		</Box>
	);
}
