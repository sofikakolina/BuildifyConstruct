import React, { useState } from "react"
import { IconButton, Box, Typography, Paper, Grid, Button, FormLabel } from "@mui/material"
// import { useForm, Controller } from "react-hook-form"
// import { yupResolver } from "@hookform/resolvers/yup"
// import * as Yup from "yup"
// import { grey, red } from "@mui/material/colors"
import ProductsSelector from "./ProductsSelector"
import axios from "axios"
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { getOrderItemPrice, getOrderTotal, getProductPrice } from "@/libs/calculations"
// import { trueGray } from "tailwindcss/colors"
import toast from "react-hot-toast"

export default function CreateOrder({ order }) {
    const [products, setProducts] = useState(order.orderItems ? order.orderItems.map(item => ({ ...item, oldQuantity: item.quantity })) : []);
	const [newProducts, setNewProducts] = useState([])
	const [isLoading, setIsLoading] = useState(false)
    console.log(products)
    console.log(newProducts)
	// const router = useRouter()

	const sendData = async () =>{
		setIsLoading(true)
		console.log("PRODUCTS",products)
		console.log("NEW PRODUCTS",newProducts)
		try{
			event.preventDefault();
			const oldStatus = order.status
			await axios.post("/api/editOrder", {id: order.id, status:"PendingPayment"})
			await Promise.all([
				newProducts.length > 0 ? (newProducts.map(
					product => axios.post("/api/createOrderItem", { orderId: order.id, productId: product.id, quantity: product.quantity, width: product.width, height: product.height }))
				) : null,
				products.map(product => {
					if (product.oldQuantity < product.quantity){
						axios.post("/api/editOrderItem", {id: product.id, quantity: product.quantity})
					}
				}),
			])
			await axios.post("/api/editOrder", {id: order.id, status:oldStatus})
			setIsLoading(false)
			toast.success(
				"The changes have been updated!", 
			)
		} catch (e) { toast.error(e.message) }

	}

	return (
		<>
			<Paper square={false} elevation={1} sx={{ padding: 4 }}>
				<Box sx={{ mb: 4 }}>
					<Typography color="primary" variant="h2" sx={{ fontSize: "32px" }}>{"Create order"}</Typography>
				</Box>
				<Box>
					<div>
						<Grid item xs={12} sx={{ mb: 4 }}>

						</Grid>

						{/* Добавление продуктов */}
						<Grid container spacing={2} sx={{ mb: 4 }}>
							<Grid item xs={12} md={12}>
								<Paper elevation={1} sx={{ padding: 3 }}>
									<ProductsSelector
										products={order.orderItems}
                                        newProducts={newProducts}
										setProducts={setNewProducts}
									/>
								</Paper>
							</Grid>
						</Grid>

						{/* Вывод старых продуктов */}
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
														alt={product.product.name}
														src={product.product.image}
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
													<div className="flex justify-end items-center">
														<Typography variant="body1" component="h6">
															$ <Typography variant="span" component="span" sx={{ fontWeight: '500' }}>{(getOrderItemPrice(product)/100).toFixed(2)}</Typography>
														</Typography>
													</div>
								
													<div className="flex justify-between items-center border rounded-xl">
														<IconButton onClick={() => setProducts(products => {
															const newProducts = [...products];
															const index = products.findIndex(m => m.id === product.id);
															if (parseInt(newProducts[index].quantity) > 1 && (parseInt(newProducts[index].oldQuantity) < parseInt(newProducts[index].quantity))) newProducts[index].quantity = parseInt(newProducts[index].quantity) - 1;
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
																if (event.target.value <= 1) newProducts[index].quantity = newProducts[index].oldQuantity;
																else if ((parseInt(newProducts[index].oldQuantity) <= event.target.value)) {newProducts[index].quantity = event.target.value}
																return newProducts;
															})}
															onKeyDown={(e) => e.key === 'Enter' && setProducts(products => {
																const newProducts = [...products];
																const index = products.findIndex(m => m.id === product.id);
																if (event.target.value <= 1) newProducts[index].quantity = newProducts[index].oldQuantity;
																else if ((parseInt(newProducts[index].oldQuantity) <= event.target.value)) {newProducts[index].quantity = event.target.value}
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

						{/* Вывод новых продуктов */}
                        <Grid container spacing={2} sx={{ mb: 4 }}>
							<Grid item xs={12} md={12}>
								<Paper elevation={1} sx={{ padding: 3 }}>
									<FormLabel component="legend" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>New Products</FormLabel>
									{newProducts.length!=0 ? (
										<>

											{newProducts.map((product) => (
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
															$ <Typography variant="span" component="span" sx={{ fontWeight: '500' }}>{((getProductPrice(product)/100).toFixed(2)*product.quantity).toFixed(2)}</Typography>
														</Typography>
								
														<IconButton onClick={() => setNewProducts(products => {
															const newProducts = [...products]
															const index = products.findIndex(m => m.id == product.id)
															newProducts.splice(index, 1)
															return newProducts
														})}>
															<DeleteOutlineOutlinedIcon />
														</IconButton>
													</div>
								
													<div className="flex justify-between items-center border rounded-xl">
														<IconButton onClick={() => setNewProducts(products => {
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
															onChange={(event) => setNewProducts(products => {
																const newProducts = [...products];
																const index = products.findIndex(m => m.id === product.id);
																newProducts[index].quantity = event.target.value;
																return newProducts;
															})}
															onBlur={(event) => setNewProducts(products => {
																const newProducts = [...products];
																const index = products.findIndex(m => m.id === product.id);
																if (event.target.value <= 1) newProducts[index].quantity = 1;
																else if (event.target.value >= 1) {newProducts[index].quantity = event.target.value}
																return newProducts;
															})}
															onKeyDown={(e) => e.key === 'Enter' && setNewProducts(products => {
																const newProducts = [...products];
																const index = products.findIndex(m => m.id === product.id);
                                                                if (event.target.value <= 1) newProducts[index].quantity = 1;
																else if (event.target.value >= 1) {newProducts[index].quantity = event.target.value}
																return newProducts;
															})}
															className="border-none outline-none focus:ring-0 w-16 text-center"
														/>
														<IconButton onClick={() => setNewProducts(products => {
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

						<Grid container spacing={2} sx={{ mb: 4 }}>
							<Grid item xs={12} md={12}>
								<Paper elevation={1} sx={{ padding: 3 }}>
									<Grid item xs={12} className="flex justify-start items-center">
										<h2 className="font-extrabold text-2xl">
											Total: ${
                                                (getOrderTotal(order)/100 + (newProducts ? (((100 + (order.user.tax ? order.user.tax.rate : 0))/100) * (newProducts.reduce((accumulator, product) => accumulator + getProductPrice(product) * product.quantity, 0))/100) : 0)).toFixed(2)
                                            }
										</h2>
									</Grid>								
								</Paper>
							</Grid>
						</Grid>

						<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
							<Button type="submit" size="large" variant="contained" color="primary" sx={{ color: "white" }} onClick={()=>sendData()}>
								{
									isLoading ? "Saving..." : "Save order"
								}
							</Button>
						</Box>
					</div>
				</Box>
			</Paper>
		</>
	)
}
