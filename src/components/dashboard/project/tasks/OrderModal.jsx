'use client';
import { Modal, Box, Typography, IconButton, FormControl, Select, MenuItem, InputLabel, } from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { OrderPriority } from '@prisma/client';
import OrderDetails from './OrderDetails';
import DetailsTextarea from './DetailsTextarea';
// import Proofing from './Proofing';
import Tasks from './Tasks';
import Assets from './Assets';
import Customer from './Customer';
import Status from './Status';
import TeamAssigment from './TeamAssigment';
import ShippingAddresses from './ShippingAddresses';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import GeneratePdf from "./GeneratePdf";

export default function OrderModal({ session, order, openOrder, handleCloseOrder, priority, setPriority, formatDate, staff, data, updateData }) {

	const handleChange = async event => {
		const newPriority = event.target.value;
		try {
			await axios.post("/api/editOrder", { id: order.id, priority: newPriority });
			setPriority(newPriority);

			const updatedOrder = { ...order, priority: newPriority };
			const columnIndex = data.columnOrder.findIndex(col => data.columns[col].orders.some(o => o.id === order.id));
			const orderIndex = data.columns[data.columnOrder[columnIndex]].orders.findIndex(o => o.id === order.id);
			updateData(data.columnOrder[columnIndex], orderIndex, updatedOrder);

			toast.success("Priority updated successfully");
		} catch (error) {
			toast.error(error.message);
		}
	};


	return (
		<Box sx={{ position: 'absolute' }}>
			<Modal
				open={openOrder}
				onClose={handleCloseOrder}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				sx={{
					overflowY: 'auto',
				}}
			>
				<Box sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflowY: 'auto',
				}}>

					<Box sx={{
						bgcolor: 'background.paper', boxShadow: 24, p: 4,
						borderRadius: 2,
						position: 'relative',
						marginY: '40px'
					}}>
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
							<Grid item xs={9}>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap:"15px" }}>
										<GeneratePdf order={order} />
										<Link href={`/dashboard/jobs/${order.id}`}>
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
										<Typography variant="h4">ORD #{order.id}</Typography>
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<FormControl sx={{ m: 1, minWidth: 120 }} size="small">
												<InputLabel id="priority">Priority</InputLabel>
												<Select
													labelId="priority"
													id="priority"
													value={priority}
													label="Priority"
													onChange={handleChange}
												>
													<MenuItem value={OrderPriority.Normal}>{OrderPriority.Normal}</MenuItem>
													<MenuItem value={OrderPriority.Rush}>{OrderPriority.Rush}</MenuItem>
												</Select>
											</FormControl>
											<Typography className="bg-primary px-2 py-2 rounded-md font-bold text-white text-sm quantity">Qty: {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
										</Box>

									</Box>
									<OrderDetails order={order} userRole={session.user.role}/>
									{/*<Proofing session={session} formatDate={formatDate} order={order} />*/}
									<DetailsTextarea order={order} />
									<Tasks formatDate={formatDate} order={order} />
									<Assets order={order} />
								</Box>
							</Grid>
							<Grid item xs={3}>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
									<Customer order={order} />
									<Status formatDate={formatDate} order={order} data={data} />
									<TeamAssigment order={order} staff={staff} />
									<ShippingAddresses order={order} />
								</Box>
							</Grid>
						</Grid>
					</Box>
				</Box >
			</Modal >
		</Box>
	);
}
