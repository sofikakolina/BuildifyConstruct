"use client";
import {
	Paper,
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableFooter,
} from "@mui/material";
import { useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

export default function OrderDetails({ task, userRole }) {
	// const [show, setShow] = useState(
	// 	userRole === "Admin" || userRole === "Manager"
	// );
	const show = userRole === "Admin" || userRole === "Manager";
	const [isOpen, setIsOpen] = useState(false);
	const selectedImage = useState("");

	// const handleImageClick = (image) => {
	// 	setSelectedImage(image);
	// 	setIsOpen(true);
	// };

	return (
		<>
			<Paper elevation={3} sx={{ p: 1, zIndex: "1400" }}>
				<Typography sx={{ fontWeight: "bold", mb: 2 }} variant="body1">
					Order Summary
				</Typography>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Image</TableCell>
									<TableCell>Details</TableCell>
									<TableCell>Quantity</TableCell>
									<TableCell>
										{show ? "Pricing" : null}
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{/* {task.orderItems.map((item, index) => (
									<TableRow key={item.id} index={index}>
										<TableCell>
											<Box>
												<img
													className="rounded object-cover cursor-pointer"
													src={item.image}
													alt={item.name}
													style={{
														maxWidth: "150px",
													}}
													onClick={() =>
														handleImageClick(
															item.image
														)
													} // Open lightbox on click
												/>
											</Box>
										</TableCell>
										<TableCell>
											<Typography variant="h6">
												{item.name}
											</Typography>
											{item.materials.map((m, index) => (
												<Typography
													key={index}
													variant="body1"
													sx={{ fontSize: "14px" }}
												>
													{m.name} (
													{`$${m.cost / 100}`})
												</Typography>
											))}
											<Typography
												variant="body1"
												sx={{ fontSize: "14px" }}
											>
												Size: {item.width}in x{" "}
												{item.height}in
											</Typography>
											<Typography
												variant="h3"
												sx={{ fontSize: "16px" }}
											>
												Comment:
											</Typography>
											<Typography
												variant="body1"
												sx={{ fontSize: "14px" }}
											>
												{item.comment}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant="body1"
												sx={{ fontSize: "14px" }}
											>
												{item.quantity}
											</Typography>
										</TableCell>
										<TableCell>
											{show ? (
												<Typography
													variant="body1"
													sx={{ fontSize: "16px" }}
												>
												
													$
												</Typography>
											) : null}
										</TableCell>
									</TableRow>
								))} */}
							</TableBody>

							<TableFooter>
								{show && (
									<>
										<TableRow>
											<TableCell colSpan={3}>
												<Typography
													variant="body1"
													sx={{ fontSize: "16px" }}
												>
													Subtotal
												</Typography>
											</TableCell>
											<TableCell>
												<Typography
													variant="body1"
													sx={{ fontSize: "16px" }}
												>
													$
												</Typography>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell colSpan={3}>
												<Typography
													variant="body1"
													sx={{ fontSize: "16px" }}
												>
													Taxes (
													{task.userId
														? task.userId
														: 0}
													)
												</Typography>
											</TableCell>
											<TableCell>
												<Typography
													variant="body1"
													sx={{ fontSize: "16px" }}
												>
													$
												</Typography>
											</TableCell>
										</TableRow>
									</>
								)}
								<TableRow>
									<TableCell colSpan={3}>
										<Typography
											variant="body1"
											sx={{ fontSize: "16px" }}
										>
											Shipping
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="body1"
											sx={{ fontSize: "16px" }}
										>
											{task.comment
												? `$${
														task.comment
												  }`
												: "Pickup"}
										</Typography>
									</TableCell>
								</TableRow>
								{show && (
									<TableRow>
										<TableCell colSpan={3}>
											<Typography
												variant="body1"
												sx={{ fontSize: "16px" }}
											>
												Total
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant="body1"
												sx={{ fontSize: "16px" }}
											>
												${task.details}
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableFooter>
						</Table>
					</TableContainer>
				</Box>

				{/* Lightbox for enlarged image */}
			</Paper>
			{isOpen && (
				<Lightbox
					className="z-[9999] absolute"
					mainSrc={selectedImage}
					onCloseRequest={() => setIsOpen(false)}
				/>
			)}
		</>
	);
}
