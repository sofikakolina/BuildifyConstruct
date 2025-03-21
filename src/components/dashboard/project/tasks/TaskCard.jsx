"use client";
import React, { useState, useMemo } from "react";
import {
	Paper,
	Box,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Popover,
	Avatar,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
// import ThumbUpIcon from "@mui/icons-material/ThumbUp";
// import CommentIcon from "@mui/icons-material/Comment";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import dayjs from "dayjs";
import OrderModal from "./OrderModal";
import { OrderPriority } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { useKanban } from "./KanbanContext";

const TaskCard = ({ task, session, staff }) => {
	const { data, updateData } = useKanban();
	const [priority, setPriority] = useState(task.priority || "");
	const [anchorElDate, setAnchorElDate] = useState(null);
	// const [openOrderModal, setOpenOrderModal] = useState(false);
	// изменить потом на false
	const [openOrderModal, setOpenOrderModal] = useState(true);

	const formatDate = (dateString) => dayjs(dateString).format("ddd, MM/DD");

	const handleChangePriority = async (event) => {
		const newPriority = event.target.value;
		try {
			await axios.post("/api/dashboard/projects/tasks", {
				id: task.id,
				priority: newPriority,
			});
			setPriority(newPriority);

			const updatedTask = { ...task, priority: newPriority };
			const columnIndex = data.columnTask.findIndex((col) =>
				data.columns[col].tasks.some((o) => o.id === task.id)
			);
			const taskIndex = data.columns[
				data.columnTask[columnIndex]
			].tasks.findIndex((o) => o.id === task.id);
			updateData(data.columnTask[columnIndex], taskIndex, updatedTask);

			toast.success("Priority updated successfully");
		} catch (error) {
			toast.error(error.message);
		}
	};

	const formattedDate = useMemo(
		() => dayjs(task.targetEnd).format("ddd, MM/DD"),
		[task.targetEnd]
	);
	const formattedDateCreated = useMemo(
		() => dayjs(task.startDate).format("ddd, MM/DD"),
		[task.startDate]
	);

	const handleOpenDatePopover = (event) =>
		setAnchorElDate(event.currentTarget);

	const handleCloseDatePopover = () => setAnchorElDate(null);

	const handleOpenOrderModal = () => setOpenOrderModal(true);
	const handleCloseOrderModal = () => setOpenOrderModal(false);

	// const ImageWithSkeleton = ({ src, alt }) => {
	// 	const [imageLoading, setImageLoading] = useState(true);
	// 	const imgRef = useRef();

	// 	useEffect(() => {
	// 		if (imgRef.current && imgRef.current.complete) {
	// 			setImageLoading(false);
	// 		}
	// 	}, [src]);

	// 	return (
	// 		<>
	// 			{imageLoading && (
	// 				<Skeleton variant="rectangular" width="100%" height={175} />
	// 			)}
	// 			<img
	// 				ref={imgRef}
	// 				src={src}
	// 				alt={alt}
	// 				style={{
	// 					display: imageLoading ? "none" : "block",
	// 					maxWidth: "200px",
	// 					padding: "10px",
	// 				}}
	// 				onLoad={() => setImageLoading(false)}
	// 				className="rounded proofingImage"
	// 			/>
	// 		</>
	// 	);
	// };

	return (
		<Paper>
			<Box className="flex flex-col gap-5 orderPreview">
				<Box
					sx={{
						mt: 2,
						mx: 2,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<button
						onClick={handleOpenOrderModal}
						className="font-bold hover:text-primary text-sm hover:underline cursor-pointer"
					>
						TSK <span className="text-gold">#{task.id}</span>
					</button>
				</Box>
				<Box
					className="orderSummary"
					sx={{ display: "flex", flexDirection: "column", gap: 1 }}
				>
					<Box
						sx={{
							mx: 2,
							display: "flex",
							gap: "10px",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<FormControl sx={{ minWidth: 120 }} size="small">
							<InputLabel id="priority">Приоритет</InputLabel>
							<Select
								labelId="priority"
								id="priority"
								value={priority}
								label="Priority"
								onChange={handleChangePriority}
							>
								<MenuItem value={OrderPriority.Normal}>
									{OrderPriority.Normal}
								</MenuItem>
								<MenuItem value={OrderPriority.Rush}>
									{OrderPriority.Rush}
								</MenuItem>
							</Select>
						</FormControl>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: "10px",
							}}
						>
							<Typography sx={{ fontSize: "12px" }}>
								Создано: {formattedDateCreated}
							</Typography>
							<Typography
								onClick={handleOpenDatePopover}
								sx={{
									cursor: "pointer",
									textDecoration: "underline",
									fontSize: "12px",
								}}
							>
								Дедлайн: {formattedDate}
							</Typography>
						</Box>
						<Popover
							open={Boolean(anchorElDate)}
							anchorEl={anchorElDate}
							onClose={handleCloseDatePopover}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left",
							}}
							transformOrigin={{
								vertical: "top",
								horizontal: "left",
							}}
						>
							<Box sx={{ p: 2 }}>
								<LocalizationProvider
									dateAdapter={AdapterDayjs}
								>
									<DatePicker
										label="Due Date"
										value={dayjs(task.targetEnd)}
										onChange={(newValue) => {
											if (newValue) {
												updateData(task.id, newValue);
											}
										}}
										renderInput={(params) => (
											<TextField {...params} />
										)}
									/>
								</LocalizationProvider>
							</Box>
						</Popover>
					</Box>
					<Box
						className="bg-[#f5f7f9] rounded-b teamPreview"
						sx={{
							px: 2,
							py: 3,
							display: "flex",
							alignItems: "center",
							gap: "5px",
						}}
					>
						{task.assignedStaff.length > 0 &&
							task.assignedStaff.map((assignment) => (
								<Avatar
									key={assignment.id}
									sx={{ width: "30px", height: "30px" }}
									alt="Team"
									src={assignment.image}
								/>
							))}
					</Box>
				</Box>
			</Box>
			{staff && (
				<OrderModal
					session={session}
					task={task}
					formatDate={formatDate}
					openOrder={openOrderModal}
					priority={priority}
					setPriority={setPriority}
					handleCloseOrder={handleCloseOrderModal}
					staff={staff}
					updateData={updateData}
					data={data}
				/>
			)}
		</Paper>
	);
};

export default TaskCard;
