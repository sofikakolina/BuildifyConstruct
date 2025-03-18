import React, {useState, useEffect} from "react"
import {TextField, Checkbox, FormControlLabel, FormGroup, Box, Typography, Accordion, AccordionSummary, AccordionDetails, CircularProgress} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
// import axios from "axios"

export default function ProductsSelector({ products, newProducts, setProducts }) {
	const [productsResponse, setProductsResponse] = useState([])
	const [search, setSearch] = useState("")

	const [isLoading, setLoading] = useState(true)
	useEffect(() => {
		(async () => {
			setLoading(true);
			const page = 0;
			const size = Number.MAX_SAFE_INTEGER;
			const { products: newProductsResponse } = await fetch("/api/getProducts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ page, size, ...(() => search.length ? {search} : {})() })
			}).then(response => response.json());
	
			// Фильтрация новых продуктов: исключаем те, которые уже есть в текущих продуктах
			const filteredNewProductsResponse = newProductsResponse.filter(newProduct => !products.some(currentProduct => (parseInt(currentProduct.productId) == parseInt(newProduct.id))));
	
			setProductsResponse(filteredNewProductsResponse);
			setLoading(false);
		})();
	}, [search]);
	


	return (
		<Box sx={{mt: 2}}>
					<Accordion>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls={`Products-content`}
							id={`panel-header`}
						>
							<Typography>Products</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Box sx={{ display: "flex", gap: '10px', alignItems: 'center' }}>
								<TextField
									sx={{ width: '100%' }}
									label="Search"
									onChange={event => setSearch(() => {
										return event.target.value
									})}
								/>
							</Box>
							<FormGroup>
                                {isLoading ? <CircularProgress sx={{margin:"auto", marginTop:"10px"}}></CircularProgress> : 
 								(productsResponse?.map(product => (
									<FormControlLabel
										key={product.id}
										control={
											<Checkbox
												checked={newProducts ? newProducts.some(m => m.id === product.id) : products.some(m => m.id === product.id) || false}
												onChange={() => setProducts(products => {
													const newProducts = [...products];
													const index = products.findIndex(m => m.id === product.id);
													if (index >= 0) newProducts.splice(index, 1)
													else newProducts.push({...product, quantity: 1})
													return newProducts;
												})}
												color="primary"
											/>
										
										}
										label={
											<div className="flex justify-between items-center gap-10 ps-5 w-full">
												<div className="flex flex-col gap-1 w-full">
													<div>{`Name: ${product.name},  Cost: $`}</div>
													<div>{`Width: ${product.width}″, Height: ${product.height}″`}</div>
												</div>
												<img src={product.image} alt={product.name} width={150} height={"auto"}/>
											</div>
										}
									/>
								)))}
							</FormGroup>
						</AccordionDetails>
					</Accordion>
		</Box>
	)
}