'use client';
import { Box, Typography} from '@mui/material';
export default function ShippingAddresses({ order }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography variant="h6" component="h2">
				Ship to
			</Typography>
			{
				order.invoice.address ? (
					<>
						<Typography variant="h6">
							Cost: {order.invoice.deliveryMethod}(${order.invoice.deliveryCost / 100})
						</Typography>
						<Typography>
							{order.invoice.address}
						</Typography>
						<Typography>
							Name: {order.invoice.shipToName}
						</Typography>
						<Typography>
							Company: {order.invoice.shipToCompany}
						</Typography>
					</>
				) : (
					<Typography>
						Pick up
					</Typography>
				)
			}
		</Box>
	);
}
