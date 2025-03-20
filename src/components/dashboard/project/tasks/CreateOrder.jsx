"use client"
import React, { useState, useEffect } from "react"
import { FormControl, IconButton, Box, Typography, Paper, Grid, Button, Stack, TextField, Autocomplete, RadioGroup, FormControlLabel, Radio, FormLabel } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
// import { yupResolver } from "@hookform/resolvers/yup"
// import * as Yup from "yup"
// import { grey, red } from "@mui/material/colors"
import ProductsSelector from "./ProductsSelector"
import axios from "axios"
import { useRouter } from "next/navigation"
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddressModal from "./address/AddressModal"
// import { trueGray } from "tailwindcss/colors"
import toast from 'react-hot-toast'
export default function CreateOrder() {
	const orderStatuses = ["PendingPayment", "Paid", "Design", "Proofing", "Prepress", "Production", "Hold", "Complete", "Delivered", "Cancelled"]
	const [orderStatus, setOrderStatus] = useState("")
	const [users, setUsers] = useState([])
	const [user, setUser] = useState([])
	const [usersForTeam, setUsersForTeam] = useState([])
	const [team, setTeam] = useState([])
	const [details, setDetails] = useState('')
	const [products, setProducts] = useState([])
	const [deliveryMethods, setDeliveryMethods] = useState([])
    const [deliveryMethodsIdChoice, setDeliveryMethodsIdChoice] = useState(0)
	const [shippingMethod, setShippingMethod] = useState("Pickup");
    const [addressIdChoice, setAddressIdChoice] = useState(0)
    const [addresses, setAddresses] = useState({ created: []})
    const [selectedAddresses, setSelectedAddresses] = useState("")
	const [selectedAddressIndex, setSelectedAddressIndex] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()
	console.log(addressIdChoice, deliveryMethodsIdChoice)
	const { control } = useForm({})

	const handleShippingChange = (event) => {
        setShippingMethod(event.target.value);
    };
	const handleAutocompleteChange = (event, value) => {
        setTeam(value.map(option => option.id)); // Сохраняем только идентификаторы выбранных пользователей
    };

	const sendData = async () =>{
		setIsLoading(true)
		try{
			event.preventDefault();
			// const deliveryMethod = deliveryMethods[deliveryMethods.findIndex(m => m.id == deliveryMethodsIdChoice)]

			const { order: activeOrder } = await axios.post("/api/getCart", { userId: user?.id });

			if (activeOrder.orderItems) {
				await Promise.all(activeOrder.orderItems.map(async (orderItem) => {
					await axios.post("/api/deleteOrderItem", { id: orderItem.id });
				}));
			}

			if (products.length > 0) {
				await Promise.all(products.map(async (product) => {
					await axios.post("/api/createOrderItem", {
						orderId: activeOrder.id,
						productId: product.id,
						quantity: product.quantity,
						width: product.width,
						height: product.height,
					});
				}));
			}

			if (addressIdChoice>0 && deliveryMethodsIdChoice>0) await axios.post("/api/editOrder", {id: activeOrder.id, addressId: addressIdChoice, deliveryMethodId: deliveryMethodsIdChoice})
			
			await toast.promise(axios.post("/api/createPayment", {
				orderId: activeOrder.id,
				sourceId: "cnon:card-nonce-ok"
			}), {
				loading: "Payment in progress...",
				success: "Thanks for your purchase!",
				error: "Something went wrong...\nPlease check your card details\nIf the problem persists, contact your manager...."
			})

			await axios.post("/api/editOrder", {id: activeOrder.id, status: orderStatus})
			
			const { order: activeOrderRestore } = await axios.post("/api/getCart", { userId: user?.id });

			if (activeOrder.orderItems) {
				await Promise.all(activeOrder.orderItems.map(async (orderItem) => {
					await axios.post("/api/createOrderItem", {
						orderId: activeOrderRestore.id,
						productId: orderItem.productId,
						quantity: orderItem.quantity,
					});
				}));
			}

			router.push("/dashboard/jobs")
		} catch(e) { toast(e.message) }
		setIsLoading(false)
	}
	

	useEffect(() => {
		setIsLoading(true)
		const page = 0
		const size = Number.MAX_SAFE_INTEGER
		axios.post("/api/getCustomers", {page, size}).then(({ users }) => {
			setUsers(users);
			const filteredUsersForTeam = users.filter(user => user.role !== "Customer");
			setUsersForTeam(filteredUsersForTeam);
			setIsLoading(false);
		}).catch(e => alert(e.message))
		axios.post("/api/getDeliveryMethods", {}).then(({ deliveryMethods }) => { setDeliveryMethods(deliveryMethods); setIsLoading(false) })
			.catch(e => alert(e.message))
	}, [])

	return (
		<>
			<Paper square={false} elevation={1} sx={{ padding: 4 }}>
				<Box sx={{ mb: 4 }}>
					<Typography color="#f69220" variant="h2" sx={{ fontSize: "32px" }}>{"Создать задачу"}</Typography>
				</Box>
				<Box>
					<div>
						<Grid item xs={12} sx={{ mb: 4 }}>
							<Box sx={{ display: "flex", justyfiContent: "center", alignItems: "center", gap: 2, width: "100%" }}>
								<Controller
									name="user"
									fullWidth
									control={control}
									render={({}) => (
										<Autocomplete
											disablePortal
											fullWidth
											id="user-select"
											isOptionEqualToValue={(option, value) => option.id === value.id}
											getOptionLabel={option => option.name}
											options={users.map(user => ({ id: user.id, name: user.name, tax: user.tax ? user.tax : 0, addresses: user.addresses }))}
											onChange={(event, user) => setUser(user)}										
											renderOption={(props, option) => (
												<Box component="li" {...props} key={option.id}>
													{option.name}
												</Box>
											)}
											renderInput={(params) => <TextField {...params} label="Assign to user" />}
										/>
									)}
								/>
							</Box>
						</Grid>

						<Grid container spacing={2} sx={{ mb: 4 }}>
							<Grid item xs={12} md={12}>
								<Paper elevation={1} sx={{ padding: 3 }}>
									<ProductsSelector
										products={products}
										setProducts={setProducts}
									/>
								</Paper>
							</Grid>
						</Grid>

						<Grid container spacing={2} sx={{ mb: 4 }}>
							<Grid item xs={12} md={12}>
								<Paper elevation={1} sx={{ padding: 3 }}>
									<FormLabel component="legend" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>Products</FormLabel>
									{products.length!=0 ? (
										<>

											{products.map((product) => (
												<div key={product.id} className="flex lg:flex-row flex-col justify-between gap-4">

												<div className="flex lg:flex-row flex-col gap-2">
													<img
														alt={product.name}
														src={product.image}
														className="rounded-2xl lg:max-w-[100px] object-cover"
													/>
													<div className="flex flex-col justify-between gap-4 p-4">
														<div className="flex flex-col gap-4">
															<Typography variant="h3" component="h2" sx={{ fontSize: '24px' }}>
																{product.name}
															</Typography>
															<Typography variant="body1" component="p" sx={{ fontSize: '14px' }}>
																{product.description}
															</Typography>
														</div>
														<div className="flex gap-2">
															<Typography variant="body1" component="h6">
																w: <Typography variant="span" component="span" sx={{ fontWeight: '600' }}>{product.width}</Typography>
																″
															</Typography>
															<Typography variant="body1" component="h6">
																h: <Typography variant="span" component="span" sx={{ fontWeight: '600' }}>{product.height}</Typography>
																″
															</Typography>
								
														</div>
													</div>
												</div>
												<div className="flex flex-col justify-between gap-2 p-4">
													<div className="flex justify-between items-center">
														<Typography variant="body1" component="h6">
															$ <Typography variant="span" component="span" sx={{ fontWeight: '500' }}>dollars</Typography>
														</Typography>
								
														<IconButton onClick={() => setProducts(products => {
															const newProducts = [...products]
															const index = products.findIndex(m => m.id == product.id)
															newProducts.splice(index, 1)
															return newProducts
														})}>
															<DeleteOutlineOutlinedIcon />
														</IconButton>
													</div>
								
													<div className="flex justify-between items-center border rounded-xl">
														<IconButton onClick={() => setProducts(products => {
															const newProducts = [...products];
															const index = products.findIndex(m => m.id === product.id);
															if (parseInt(newProducts[index].quantity) > 1) newProducts[index].quantity = parseInt(newProducts[index].quantity) - 1;
															return newProducts;
														})}>
															<RemoveIcon />
														</IconButton>
														<input
															type="number"
															value={product.quantity}
															onChange={(event) => setProducts(products => {
																const newProducts = [...products];
																const index = products.findIndex(m => m.id === product.id);
																newProducts[index].quantity = event.target.value;
																return newProducts;
															})}
															onBlur={(event) => setProducts(products => {
																const newProducts = [...products];
																const index = products.findIndex(m => m.id === product.id);
																if (event.target.value <= 1) newProducts[index].quantity = 1;
																else if (event.target.value >= 1) {newProducts[index].quantity = event.target.value}
																return newProducts;
															})}
															onKeyDown={(e) => e.key === 'Enter' && setProducts(products => {
																const newProducts = [...products];
																const index = products.findIndex(m => m.id === product.id);
                                                                if (event.target.value <= 1) newProducts[index].quantity = 1;
																else if (event.target.value >= 1) {newProducts[index].quantity = event.target.value}
																return newProducts;
															})}
															className="border-none outline-none focus:ring-0 w-16 text-center"
														/>
														<IconButton onClick={() => setProducts(products => {
															const newProducts = [...products];
															const index = products.findIndex(m => m.id === product.id);
															newProducts[index].quantity = parseInt(newProducts[index].quantity) + 1;
															return newProducts;
														})}>
															<AddIcon />
														</IconButton>
													</div>
												</div>
												</div>
											))}
										</>
									) : <FormLabel component="legend" sx={{ fontWeight: 'light' }}>You have not selected any products</FormLabel>
								}
								</Paper>
							</Grid>
						</Grid>

						<Grid item xs={12} sx={{ mb: 4 }}>
							<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, width: "100%" }}>
								<Controller
									name="user"
									fullWidth
									control={control}
									render={({}) => (
										<Autocomplete
											disablePortal
											fullWidth
											id="user-select"
											isOptionEqualToValue={(option, value) => option === value}
											getOptionLabel={option => option}
											options={orderStatuses} // Передаем массив напрямую
											onChange={(event, orderStatus) => 	setOrderStatus(orderStatus)}
											renderOption={(props, option) => (
												<Box component="li" {...props} key={option}>
													{option}
												</Box>
											)}
											renderInput={(params) => <TextField {...params} label="Order status" />}
										/>
									)}
								/>
							</Box>
						</Grid>

						
						<Grid item xs={12} sx={{ mb: 4 }}>
							<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, width: "100%" }}>
								<Controller
									name="user"
									fullWidth
									control={control}
									render={({ }) => (
										<Autocomplete
											disablePortal
											fullWidth
											id="user-select"
											multiple // Добавляем возможность выбора нескольких параметров
											isOptionEqualToValue={(option, value) => option.id === value.id}
											getOptionLabel={option => option.name}
											options={usersForTeam.map(user => ({ id: user.id, name: user.name, role: user.role }))}
											onChange={handleAutocompleteChange} // Используем обработчик изменений
											value={users.filter(user => team.includes(user.id))} // Устанавливаем значение из состояния team
											renderOption={(props, option) => (
												<Box component="li" {...props} key={option.id}>
													{`${option.name}, ${option.role}`}
												</Box>

											)}
											renderInput={(params) => <TextField {...params} label="Assign a team" />}
										/>
									)}
								/>
							</Box>
						</Grid>

						<Grid item xs={12} sx={{ mb: 4 }}>
							<TextField
								id="textarea-produt"
								value={details}
								onChange={(event) => setDetails(event.target.value)}
								label="Details"
								multiline
								sx={{width:"100%"}}
								rows={4}
							/>
						</Grid>

						

						<Grid container spacing={2}  sx={{ mb: 4 }}>
							<Grid item xs={12} md={12}>
								<Paper elevation={1} sx={{ padding: 3 }}>
									<Stack direction={"column"} sx={{ display: "flex", justifyContent: "center", flexDirection: "column", gap: 2 }}>
										<Grid container spacing={1}>
											<Grid item xs={12} sx={{display:"flex", flexDirection:"column", alignItems:"start"}} className="flex flex-col justify-center items-center">
												<FormControl component="fieldset" sx={{ width: '100%' }}>
													<FormLabel component="legend" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>Shipping Method</FormLabel>
													<RadioGroup
														aria-label="shipping-method"
														name="shipping-method-group"
														value={shippingMethod}
														onChange={handleShippingChange}
													>{["Pickup", "Delivery"].map(option =>
														<FormControlLabel key={option} value={option} control={<Radio />} label={option} sx={{ '.MuiTypography-root': { fontWeight: 'medium' } }} />
													)}
													</RadioGroup>

													{shippingMethod === "Delivery" && (
														<>
															<RadioGroup
																sx={{padding: "5px 50px 10px 50px"}}
																aria-label="address"
																name="address"
																value={addressIdChoice}
																onChange={(event) => setAddressIdChoice(event.target.value)}
															>
																{user?.addresses ? (user.addresses.map((address) => (
																	<FormControlLabel
																		key={address.id}
																		value={address.id}
																		control={<Radio />}
																		label={`${address.street}, ${address.building}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`}
																	/>
																))) : null}
																{addresses.created ? (
																	addresses.created.map((address) => (
																		<FormControlLabel
																			key={address.id}
																			value={address.id}
																			control={<Radio />}
																			label={`${address.street}, ${address.building}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`}
																		/>
																	))
																) : null}
															</RadioGroup>

															<Button
																variant="contained"
																color="primary"
																onClick={() => {
																	setAddresses((prevAddresses) => {
																		const newAddresses = { ...prevAddresses };
																		newAddresses.created.push({});
																		return newAddresses;
																	});
																	setSelectedAddresses("created");
																	setSelectedAddressIndex(addresses.created.length-1);
																}}
																sx={{ mt: 2, px: 2, py: 1, color: "white", width: "250px"  }}
															>
																Add Address
															</Button>
															<RadioGroup
																aria-label="shipping-method"
																name="shipping-method-group"
																defaultValue="Method Delivery" // или value="Method Delivery"
															>
																{["Method Delivery"].map(() =>
																	<FormControlLabel
																		key={"Method Delivery"}
																		value={"Method Delivery"}
																		control={<Radio />}
																		label={"Method Delivery"}
																		sx={{ '.MuiTypography-root': { fontWeight: 'medium' } }}
																	/>
																)}
															</RadioGroup>

															<RadioGroup
																sx={{padding: "5px 50px 10px 50px"}}
																aria-label="delivery method"
																name="delivery method"
																value={deliveryMethodsIdChoice}
																onChange={(event) => setDeliveryMethodsIdChoice(event.target.value)}
															>
																{deliveryMethods.map((option) => (
																	<FormControlLabel
																		key={option.id}
																		value={option.id}
																		control={<Radio />}
																		label={`${option.name}: $${option.cost/100}`}
																	/>
																))}
															</RadioGroup>                                                   
															<AddressModal
																userId = {user?.id}
																addresses={addresses}
																selectedAddresses={selectedAddresses}
																selectedAddressIndex={selectedAddressIndex}
																onClose={() => setSelectedAddressIndex(null)}
																setAddresses={setAddresses}
															/>
														</>
													)}
												</FormControl>
											</Grid>
										</Grid>
									</Stack>
								</Paper>
							</Grid>
						</Grid>
			

						<Grid container spacing={2} sx={{ mb: 4 }}>
							<Grid item xs={12} md={12}>
								<Paper elevation={1} sx={{ padding: 3 }}>
									<Grid item xs={12} className="flex justify-start items-center">
										<h2 className="font-extrabold text-2xl">
											Total: ${
												(((deliveryMethodsIdChoice ? deliveryMethods[deliveryMethods.findIndex(m => m.id == deliveryMethodsIdChoice)].cost : 0 ) + (100 + (user?.tax ? user.tax.rate : 0))
												/ 100 *
														(products.length > 0 ? products.reduce(
														(a, i) => a + i.quantity * Math.ceil(
															(100 - i.discount) / 100 * i.width * i.height / 144
															* i.productMaterials.reduce((a, m) => a + m.material.cost * m.material.markup, 0)
														), 0
													) : 0 ) 
												) / 100).toFixed(2) 
											}
										</h2>
									</Grid>								
								</Paper>
							</Grid>
						</Grid>

						<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
							<Button type="submit" size="large" variant="contained" color="primary" sx={{ color: "white" }} onClick={()=>sendData()}>
								{ isLoading ?  "Создание..." : "Создать задачу" }
							</Button>
						</Box>
					</div>
				</Box>
			</Paper>
		</>
	)
}
