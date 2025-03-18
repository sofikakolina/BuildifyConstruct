"use client"
// import Form from "@/components/dashboard/products/Form"
import {CircularProgress} from "@mui/material"
import axios from "axios"
import {useState, useEffect} from "react"
import toast from "react-hot-toast"
export default function User({params}) {
	const [product, setProduct] = useState(null)
	useEffect(() => {
		axios.post("/api/getProduct", {id: params.id})
			.then(({product}) => setProduct(product))
			.catch(error => toast.error(error.message))
	}, [])
	return product ? /*<Form product={product} />*/ <h3>Product</h3> : (
		<div className="flex justify-center items-center w-full h-full">
			<CircularProgress />
		</div>
	)
}