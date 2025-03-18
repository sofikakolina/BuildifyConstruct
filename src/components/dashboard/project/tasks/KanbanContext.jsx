'use client';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const initialData = {
	columns: {
		'orders': {
			id: 'orders',
			title: 'Orders',
			orders: [],
		},
		'design': {
			id: 'design',
			title: 'Design',
			orders: [],
		},
		// 'proofing': {
		// 	id: 'proofing',
		// 	title: 'Proofing',
		// 	orders: [],
		// },
		'prepress': {
			id: 'prepress',
			title: 'Prepress',
			orders: [],
		},
		'production': {
			id: 'production',
			title: 'Production',
			orders: [],
		},
		'hold': {
			id: 'hold',
			title: 'Hold',
			orders: [],
		},
		'completed': {
			id: 'completed',
			title: 'Complete Orders',
			orders: [],
		},
	},
	columnOrder: ['orders', 'design', 'prepress', 'production', 'hold', 'completed'],
};


const lookupTable = {
	orders: "Todo",
	design: "Pause",
	prepress: "InProgress",
	production: "Wait",
	hold: "Done",
};

const KanbanContext = createContext();

export const useKanban = () => useContext(KanbanContext);

export const KanbanProvider = ({ children }) => {
	const [data, setData] = useState(initialData);
	useEffect(() => {
		axios.post("/api/getJobs").then(({ jobs }) => {
			const newData = { ...initialData }
			Object.keys(newData.columns).forEach(column => {
				if (jobs[column]) {  // Check if jobs[column] is actually defined
					jobs[column] = jobs[column].map(job => ({ ...job, id: job.id.toString() }));
					newData.columns[column].orders = jobs[column];
				}
			});
			setData(newData)
		}).catch(() => toast.error("Failed to load jobs"))
	}, [])
	const moveTask = (data, sourceColumnId, destColumnId, sourceIndex, destIndex) => {
		const startColumn = data.columns[sourceColumnId];
		const finishColumn = data.columns[destColumnId];
		const sourceTasks = Array.from(startColumn.orders);
		const destTasks = destColumnId === sourceColumnId ? sourceTasks : Array.from(finishColumn.orders);
		const [removedTask] = sourceTasks.splice(sourceIndex, 1);

		// Update the status of the task based on the destination column
		const newStatus = lookupTable[destColumnId];
		removedTask.status = newStatus; // This assumes that your tasks have a 'status' property

		destTasks.splice(destIndex, 0, removedTask);

		const newData = {
			...data,
			columns: {
				...data.columns,
				[sourceColumnId]: {
					...startColumn,
					orders: sourceTasks,
				},
				[destColumnId]: {
					...finishColumn,
					orders: destTasks,
				},
			},
		};
		return newData;
	};

	const onDragEnd = useCallback(async result => {
		const { destination, source } = result;
		if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
			return;
		}

		const newData = moveTask(data, source.droppableId, destination.droppableId, source.index, destination.index);
		setData(newData);

		try {
			await axios.post("/api/editOrder", {
				id: newData.columns[destination.droppableId].orders[destination.index].id,
				status: newData.columns[destination.droppableId].orders[destination.index].status
			});
		} catch (error) {
			toast.error(error.message);
			// In case of an error, revert to the previous state
			setData(data);
		}
	}, [data, lookupTable, moveTask]);


	const updateData = (columnId, index, updatedOrder) => {
		setData(prevData => {
			const newData = { ...prevData };
			if (columnId && newData.columns.hasOwnProperty(columnId)) {
				const column = newData.columns[columnId];
				const newOrders = [...column.orders];
				if (index >= 0 && index < newOrders.length) {
					newOrders[index] = updatedOrder;
					newData.columns[columnId] = { ...column, orders: newOrders };
				} else {
					console.error("Index out of bounds while trying to update order in column:", columnId);
				}
			} else {
				console.error("Column not found or columnId is undefined:", columnId);
			}
			return newData;
		});
	};




	const updateTask = (orderId, taskId, updatedTask) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders = newData.columns[columnKey].orders.map(order => {
					if (order.id === orderId) {
						return {
							...order,
							tasks: order.tasks.map(task => task.id === taskId ? { ...task, ...updatedTask } : task)
						};
					}
					return order;
				});
			});
			return newData;
		});
	};

	const addTask = (orderId, newTask) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders = newData.columns[columnKey].orders.map(order => {
					if (order.id === orderId) {
						return { ...order, tasks: [...order.tasks, newTask] };
					}
					return order;
				});
			});
			return newData;
		});
	};

	const removeTask = (orderId, taskId) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders = newData.columns[columnKey].orders.map(order => {
					if (order.id === orderId) {
						return { ...order, tasks: order.tasks.filter(task => task.id !== taskId) };
					}
					return order;
				});
			});
			return newData;
		});
	};


	const addProof = (orderId, newProof) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders.forEach(order => {
					if (order.id === orderId) {
						order.proofs = [...order.proofs, newProof];
					}
				});
			});
			return newData;
		});
	};

	const updateProof = (orderId, proofId, updatedProof) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders.forEach(order => {
					if (order.id === orderId) {
						const proofIndex = order.proofs.findIndex(proof => proof.id === proofId);
						if (proofIndex !== -1) {
							order.proofs[proofIndex] = { ...order.proofs[proofIndex], ...updatedProof };
						}
					}
				});
			});
			return newData;
		});
	};

	const deleteProof = (orderId, proofId) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders.forEach(order => {
					if (order.id === orderId) {
						order.proofs = order.proofs.filter(proof => proof.id !== proofId);
					}
				});
			});
			return newData;
		});
	};

	const addAsset = (orderId, newAsset) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders.forEach(order => {
					if (order.id === orderId) {
						order.assets = [...order.assets, newAsset];
					}
				});
			});
			return newData;
		});
	};

	const deleteAsset = (orderId, assetId) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders.forEach(order => {
					if (order.id === orderId) {
						order.assets = order.assets.filter(asset => asset.id !== assetId);
					}
				});
			});
			return newData;
		});
	};


	const updateOrderStatus = async (orderId, newStatus) => {
		const columnKey = Object.keys(lookupTable).find(key => lookupTable[key] === newStatus);
		if (!columnKey) {
			toast.error("Invalid status update");
			return;
		}

		try {
			await axios.post("/api/editOrder", { id: orderId, status: newStatus });
			setData(prevData => {
				let newData = { ...prevData };
				let sourceColumnId, destColumnId, sourceIndex;

				// Find the current column and index of the order
				Object.keys(newData.columns).forEach(columnId => {
					const index = newData.columns[columnId].orders.findIndex(order => order.id === orderId);
					if (index > -1) {
						sourceColumnId = columnId;
						sourceIndex = index;
					}
				});

				// Destination column is based on the new status
				destColumnId = columnKey;
				// destIndex = newData.columns[destColumnId].orders.length; // Add to the end of the list in the new column

				// Remove from the current column
				const [removedOrder] = newData.columns[sourceColumnId].orders.splice(sourceIndex, 1);

				// Set the new status
				removedOrder.status = newStatus;

				// Add to the destination column
				newData.columns[destColumnId].orders.push(removedOrder);

				return newData;
			});
			toast.success("Status updated successfully");
		} catch (error) {
			toast.error("Failed to update status: " + error.message);
		}
	};


	const updateOrderDueDate = async (orderId, newDueDate) => {
		try {
			await axios.post("/api/editOrder", { id: orderId, dueDate: newDueDate.toISOString() });
			setData(prevData => {
				const newData = { ...prevData };
				Object.keys(newData.columns).forEach(columnKey => {
					newData.columns[columnKey].orders = newData.columns[columnKey].orders.map(order => {
						if (order.id === orderId) {
							return { ...order, dueDate: newDueDate.toISOString() };
						}
						return order;
					});
				});
				return newData;
			});
			toast.success("Due date updated successfully");
		} catch (error) {
			toast.error("Failed to update due date: " + error.message);
		}
	};

	const addTeamMember = (orderId, role, employee) => {
		setData(prevData => {
			const newData = { ...prevData };
			const columnKey = Object.keys(newData.columns).find(key =>
				newData.columns[key].orders.some(order => order.id === orderId)
			);
			if (columnKey) {
				const orderIndex = newData.columns[columnKey].orders.findIndex(order => order.id === orderId);
				if (orderIndex !== -1) {
					const order = newData.columns[columnKey].orders[orderIndex];
					order.staffAssignments = [...order.staffAssignments, { role, employee }];
					newData.columns[columnKey].orders[orderIndex] = order;
				}
			}
			return newData;
		});
	};

	const removeTeamMember = (orderId, employeeId) => {
		setData(prevData => {
			const newData = { ...prevData };
			Object.keys(newData.columns).forEach(columnKey => {
				newData.columns[columnKey].orders.forEach(order => {
					if (order.id === orderId) {
						order.staffAssignments = order.staffAssignments.filter(assignment => assignment.employee.id !== employeeId);
					}
				});
			});
			return newData;
		});
	};

	return (
		<KanbanContext.Provider value={{ addTeamMember, removeTeamMember, updateOrderStatus, updateOrderDueDate, data, onDragEnd, updateData, updateTask, addTask, removeTask, addProof, updateProof, deleteProof, addAsset, deleteAsset }}>
			{children}
		</KanbanContext.Provider>
	);
};