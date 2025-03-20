'use client';
import { Box, Typography } from '@mui/material';

export default function Customer({ task }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography sx={{fontWeight: 'bold'}} variant="h6" component="h2">
				Customer
			</Typography>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					<Typography sx={{fontWeight: 'normal'}}  variant="h6" component="h4">
						Customer
					</Typography>
					<Typography variant="body1" component="p">
						{task.userId}
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					<Typography variant="h6" component="h4">
						Company
					</Typography>
					<Typography variant="body1" component="p">
						{task.stats}
					</Typography>
				</Box>
			</Box>
		</Box>
	)
}