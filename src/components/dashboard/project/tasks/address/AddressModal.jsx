import React, { useEffect } from "react"
import { Modal, Box, Button, Typography, TextField, Grid, useMediaQuery } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"
import CloseIcon from "@mui/icons-material/Close"
import { AddressType } from "@prisma/client"
import axios from "axios"
import toast from "react-hot-toast"
const validationSchema = Yup.object().shape({
	type: Yup.string().required("Address type is required"),
	label: Yup.string(),
	street: Yup.string().required("Street is required"),
	suburb: Yup.string(),
	city: Yup.string().required("City is required"),
	state: Yup.string().required("State is required"),
	zip: Yup.string().required("ZIP/Postal code is required"),
	country: Yup.string().required("Country is required"),
	building: Yup.string().required("Building is required"),
})
const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
	display: "flex",
	flexDirection: "column",
	gap: 2,
	borderRadius: 2,
	minWidth: '350px',
    maxWidth: 'none'
}
const fieldProps = [
	{ name: "label", md: 6, label: "Label" },
	{ name: "street", md: 6, label: "Street" },
	{ name: "building", md: 3, label: "Building" },
	{ name: "suburb", md: 3, label: "Suburb" },
	{ name: "city", md: 4, label: "City" },
	{ name: "state", md: 4, label: "State" },
	{ name: "zip", md: 4, label: "ZIP/Postal code" },
	{ name: "country", md: 6, label: "Country" },
]
export default function AddressModal({ userId, onClose, selectedAddressIndex, addresses, selectedAddresses, setAddresses }) {

	const hideOnMd = useMediaQuery('(max-width:600px)'); 

	const { control, handleSubmit, formState, reset } = useForm({
		resolver: yupResolver(validationSchema), mode: "onChange"
	})
	useEffect(() => {
		const address = addresses[selectedAddresses]?.[selectedAddressIndex]
		reset(address && Object.keys(address).length ? {
			...address, label: address.label ? address.label : "",
			suburb: address.suburb ? address.suburb : "",
			state: address.state ? address.state : ""
		} : {
			type: AddressType.Shipping, label: "", street: "", suburb: "", city: "", state: "",
			zip: "", country: "", building: ""
		})
	}, [selectedAddressIndex, selectedAddresses])
	async function onSubmit(data) {
		try {
			const { address } = await axios.post("/api/createAddress", {
				userId,
				type: data.type,
				...(data.label && { label: data.label }), 
				address: "getFullAddress(data)"
			});
			console.log("ADDRESS = ", address)
			setAddresses(addresses => {
				const newAddresses = { ...addresses };
				newAddresses[selectedAddresses][selectedAddressIndex] = address;
				return newAddresses;
			});
			onClose();
			reset();
		} catch (error) {
			{toast.error(error.message)}
		}
	}
	
	function handleClose() {
		onClose()
		if (selectedAddresses != "created" || !Object.keys(addresses[selectedAddresses][selectedAddressIndex]).length)
			setAddresses(addresses => {
				const newAddresses = { ...addresses }
				newAddresses.created.splice(selectedAddressIndex, 1)
				return newAddresses
			})
	}

	return (
		<Modal
			open={typeof selectedAddressIndex == "number"}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<Typography id="modal-modal-title" variant="h4" component="h2" color="primary">
						{
							addresses[selectedAddresses]?.[selectedAddressIndex]
								&& Object.keys(addresses[selectedAddresses]?.[selectedAddressIndex]).length
								? "Edit Address"
								: "Add Address"
						}
					</Typography>
					<CloseIcon onClick={handleClose} style={{ cursor: "pointer" }} />
				</Box>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={ hideOnMd ? 0 : 2}>
						<Grid item xs={12}>
							{/* <SearchAddress setValue={setValue} /> */}
						</Grid>
						{fieldProps.map(({ name, md, label }) => (
							<Grid item xs={12} md={md} key={name}>
								<Controller
									name={name}
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											fullWidth
											margin="dense"
											label={label}
											error={!!formState.errors[name]}
											helperText={formState.errors[name]?.message}
										/>
									)}
								/>
							</Grid>
						))}
					</Grid>
					<Box sx={{ display: "flex", justifyContent: hideOnMd ? "center" : "flex-end", mt: 2 }}>
						<Button
							type="submit"
							variant="contained"
							size="medium"
							sx={{ color: "white", px: 4, py: 2, fontSize: "16px" }}
							onClick={handleSubmit}
						>
							Save Address
						</Button>
					</Box>
				</form>
			</Box>
		</Modal>
	)
}