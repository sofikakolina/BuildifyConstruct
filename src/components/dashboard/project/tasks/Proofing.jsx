import { Box, Typography, IconButton, Button, TextField, MenuItem, Menu, Paper, Accordion, AccordionDetails, Stepper, Step, StepLabel, StepContent, AccordionSummary, Avatar, Popover, } from '@mui/material';
import { useState, useCallback } from 'react';
import EmailIcon from '@mui/icons-material/Email';
// import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDropzone } from 'react-dropzone';
import { grey } from '@mui/material/colors';
import { useTheme } from '@emotion/react';
import CommentIcon from '@mui/icons-material/Comment';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useKanban } from './KanbanContext';

export default function Proofing({ order, formatDate, session }) {
	const theme = useTheme();
	const [anchorElDropzone, setAnchorElDropzone] = useState(null);
	const [proofs, setProofs] = useState(order.proofs);
	const [newProofFile, setNewProofFile] = useState(null);
	const [fileSrc, setFileSrc] = useState("")
	const [accordionExpanded, setAccordionExpanded] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const [newMessage, setNewMessage] = useState("");
	const { addProof, updateProof } = useKanban();


	const handleApproval = (proofId, accepted) => {
		axios.post("/api/editProof", { id: proofId, accepted })
			.then(() => {
				updateProof(order.id, proofId, { accepted });
			})
			.catch(error => toast.error(error.message));
	};
	
	const handleAccordionToggle = (panel) => (event, isExpanded) => {
		event.stopPropagation();
		setAccordionExpanded(isExpanded ? panel : false);
	};

	const onDrop = useCallback(async acceptedFiles => {
		const file = acceptedFiles[0]
		const body = new FormData()
		body.append("file", file)
		setFileSrc(
			(await axios.post("/api/uploadFile", body).catch(error => toast.error(error.message))).path
		)
		setNewProofFile({
			name: file.name,
			size: file.size,
			preview: URL.createObjectURL(file)
		});
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
		maxFiles: 1
	});

	const saveProof = async () => {
		if (!fileSrc) {
			toast.error("Please upload an image before saving the proof.");
			return;
		}
	
		const proofData = await axios.post("/api/createProof", { orderId: order.id }).catch(error => toast.error(error.message));
		const newProof = {
			...proofData.proof,
			assets: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			messages: []
		};
	
		const proofAsset = await axios.post("/api/createProofAsset", { proofId: newProof.id, src: fileSrc }).catch(error => toast.error(error.message));
		newProof.assets.push(proofAsset.proofAsset);
	
		addProof(order.id, newProof);
	
		setNewProofFile(null);
		setAnchorElDropzone(null);
	};
	
	// const handleClickDropzone = (event) => {
	// 	setAnchorElDropzone(event.currentTarget);
	// };

	// const removeProof = (proofId) => {
	// 	deleteProof(order.id, proofId);
	// 	setProofs(proofs.filter(proof => proof.id !== proofId));
	// };

	const sendMessage = async (proofId, content) => {
		const updatedProofs = await Promise.all(proofs.map(async proof => {
			if (proof.id === proofId) {
				const { proofMessage } = await axios.post(
					"/api/createProofMessage", { proofId, userId: session.user.id, content }
				).catch(error => toast.error(error.message))
				return { ...proof, messages: [...proof.messages, proofMessage] };
			}
			return proof;
		}));
		setProofs(updatedProofs);
		setNewMessage("");
	};

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleSendMessage = (proofId) => {
		if (newMessage.trim()) {
			sendMessage(proofId, newMessage);
		}
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography sx={{ fontWeight: 'bold', mb: 2 }} variant='body1'>Proofs({order.proofs.length})</Typography>
				<Box sx={{ display: 'flex', gap: 2 }}>
					{order.proofs.length > 0 && (
						<>
							{order.proofs.slice(-1).map((i, index) => (
								<Button onClick={sendMessage} key={i.id} size="large" sx={{ color: 'white', display: 'flex' }} variant="contained">
									Send V{index + 1} to review
								</Button>
							))}
						</>
					)}

					{/*<Button size="large" aria-describedby={anchorElDropzone ? "popover-proof-dropzone" : undefined} onClick={handleClickDropzone} sx={{ color: 'white', display: 'flex' }} variant="contained">*/}
					{/*	Add new proofing*/}
					{/*</Button>*/}
					<Popover
						id="popover-proof-dropzone"
						open={Boolean(anchorElDropzone)}
						anchorEl={anchorElDropzone}
						onClose={() => setAnchorElDropzone(null)}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'bottom',
							horizontal: 'left',
						}}
					>
						<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
							<div {...getRootProps({ style: { padding: 20, borderRadius: '10px', border: `2px dashed ${theme.palette.primary.main}`, width: 250, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer' } })}>
								<input {...getInputProps()} />
								<Typography variant='body1' sx={{ textAlign: 'center', fontWeight: 'bold' }}>
									{`Drag 'n' drop a file here, or click to select a file`}
								</Typography>							
							</div>
							{newProofFile && (
								<Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
									<img src={newProofFile.preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100px', margin: '10px 0' }} />
									<Typography variant="body2">{newProofFile.name} - {(newProofFile.size / 1024).toFixed(2)} KB</Typography>
									<Button variant="contained" color="error" sx={{ mt: 1, color: 'white' }} onClick={() => setNewProofFile(null)}>Remove</Button>
								</Box>
							)}
							<Button sx={{ width: '100%', color: 'white', borderRadius: '8px', mt: 2 }} variant="contained" onClick={saveProof}>Save</Button>
						</Box>
					</Popover>
				</Box>
			</Box>
			{order.proofs.length > 0 && (
				<Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					{proofs.map((proof, index) => (
						<Accordion sx={{ p: 2 }} key={proof.id} expanded={accordionExpanded === index} onChange={handleAccordionToggle(index)}>

							<Box index={index} key={proof.id} sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', width: '100%' }}>
								<Box>
									<img className="rounded max-w-[100px] proofingImage" src={proof.assets[0]?.src} alt="proof" loading="lazy" />
								</Box>
								<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '100%' }}>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%' }}>
										<Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
											<Typography variant='body1'>Created at {formatDate(proof.createdAt)}</Typography>
											<Typography sx={{ fontWeight: 'bold' }} variant='body1'>Last seen: {proof.views ? formatDate(proof.updatedAt) : "never"}</Typography>
											<Typography sx={{ fontWeight: 'bold' }} variant='body1'>{proof.accepted === true ? "Approved" : proof.accepted === false ? "Unapproved" : ""}</Typography>
										</Box>
										<Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
											<AccordionSummary
												aria-controls="proof-content"
												id="proof-header"
												sx={{ p: 0, m: 0 }}
											>
												<a className='hover:text-primary hover:underline' onClick={() => handleAccordionToggle(index)}>
													Version {index + 1}
													{accordionExpanded === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
												</a>
											</AccordionSummary>
											<Box sx={{ display: 'flex', gap: 1 }}>
												<IconButton
													aria-label="sendmail"
													sx={{
														color: (theme) => theme.palette.background.paper,
														backgroundColor: (theme) => theme.palette.primary.main,
														borderRadius: '5px',
														'&:hover': {
															backgroundColor: (theme) => theme.palette.primary.main,
															boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
															color: 'white',
														},
													}}
												>
													<EmailIcon />
												</IconButton>
												<IconButton
													aria-label="approved"
													onClick={() => handleApproval(proof.id, !proof.accepted)}
													sx={{
														color: theme.palette.background.paper,
														backgroundColor: proof.accepted === true ? "green" : theme.palette.primary.main,
														'&:hover': {
															backgroundColor: "green",
														},
													}}
												>
													<ThumbUpIcon />
												</IconButton>
												<IconButton
													aria-label="more"
													onClick={handleClick}
													sx={{
														color: (theme) => theme.palette.background.paper,
														backgroundColor: (theme) => theme.palette.primary.main,
														borderRadius: '5px',
														'&:hover': {
															backgroundColor: (theme) => theme.palette.primary.main,
															boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
															color: 'white',
														},
													}}
												>
													<MoreHorizIcon />
												</IconButton>
												<Menu
													key={proof.id}
													id="more-menu"
													anchorEl={anchorEl}
													open={Boolean(anchorEl)}
													onClose={() => setAnchorEl(null)}
													anchorOrigin={{
														vertical: 'bottom',
														horizontal: 'left',
													}}
													transformOrigin={{
														vertical: 'top',
														horizontal: 'right',
													}}
												>
													<MenuItem onClick={() => setAnchorEl(null)}>Download Proof</MenuItem>
													{/* <Divider />
													<MenuItem
														sx={{ color: 'red' }}
														onClick={(event) => {
															event.stopPropagation();
															removeProof(proof.id);
															setAnchorEl(null);
														}}
													>
														Delete Proof
													</MenuItem> */}
												</Menu>
											</Box>
										</Box>
									</Box>
									{accordionExpanded === index && (
										<AccordionDetails sx={{ p: 0 }}>
											<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
												<Stepper orientation="vertical">
													{proof.messages.map(message => (
														<Step key={message.id} active={true}>
															<StepLabel
																StepIconComponent={() => message.user.image ? (
																	<Avatar alt={message.user.name} src={message.user.image} />
																) : (
																	<Avatar sx={{ bgcolor: grey[500] }}>{message.user.name[0]}</Avatar>
																)}
															>
																<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																	<Typography sx={{ fontWeight: 'bold' }} variant="body1">{message.user.name}</Typography> <Typography sx={{ color: 'grey' }} variant="caption">{message.date}</Typography>
																</Box>
															</StepLabel>
															<StepContent sx={{ pl: 4 }}>
																<Typography variant='body1' sx={{ fontWeight: 'medium' }}>{message.content}</Typography>
															</StepContent>
														</Step>
													))}
												</Stepper>
												<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
													{session?.user.image ? (
														<Avatar alt={session.user.name} src={session.user.image} />
													) : (
														<Avatar sx={{ bgcolor: grey[500] }}>{session.user.name[0]}</Avatar>
													)}
													<TextField
														fullWidth
														multiline
														rows={4}
														value={newMessage}
														onChange={(e) => setNewMessage(e.target.value)}
														placeholder="Add a comment"
														variant="outlined"
														margin="normal"
													/>
													<IconButton
														onClick={() => handleSendMessage(proof.id)}
														aria-label="send"
														sx={{
															px: 2, py: 1,
															color: (theme) => theme.palette.background.paper,
															backgroundColor: (theme) => theme.palette.primary.main,
															borderRadius: '5px',
															'&:hover': {
																backgroundColor: (theme) => theme.palette.primary.main,
																boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
																color: 'white',
															},
														}}
													>
														<CommentIcon />
													</IconButton>
												</Box>
											</Box>
										</AccordionDetails>
									)}
								</Box>
							</Box>
						</Accordion>
					))}
				</Paper>
			)}
		</Box >
	)
}