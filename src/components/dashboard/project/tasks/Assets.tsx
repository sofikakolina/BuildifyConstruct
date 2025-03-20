'use client';
import { Box, Typography, Button, Paper, Popover } from '@mui/material';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
// import { Delete, Download } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useKanban } from './KanbanContext';
import axios from 'axios';
import { Session } from 'next-auth';

interface Asset {
  id: string;
  src: string;
  name: string;
}

interface Order {
  id: string;
  assets: Asset[];
}

interface OrderAsset {
  id: string;
  src: string;
  name: string;
  // Add other fields as needed
}

interface OrderBoardComponentProps {
  session: Session | null; // Используйте тип Session
  task: Order; // Тип для task
}

export default function Assets({ task }: OrderBoardComponentProps) {
  const [files, setFiles] = useState<{ id: string; preview: string; name: string; size: number }[]>([]);
  const [openDropzone, setOpenDropzone] = useState(false);
  const [anchorElDropzone, setAnchorElDropzone] = useState<null | HTMLElement>(null);
  // const [assets, setAssets] = useState(task.assets);
  const [srcs, setSrcs] = useState<string[]>([]);
  const { addAsset } = useKanban();
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    onDrop: async (acceptedFiles) => {
      const uploadedFiles = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));
      setFiles([...files, ...uploadedFiles]);
      setSrcs(
        await Promise.all(
          acceptedFiles.map(async (file) => {
            const body = new FormData();
            body.append('file', file);
            try {
              const response = await axios.post<{ path: string }>('/api/uploadFile', body);
              return response.data.path; // Доступ к полю path
            } catch (error) {
              toast.error((error as Error).message); // Обработка ошибки
              return ''; // Возвращаем пустую строку в случае ошибки
            }
          })
        )
      );
    },
  });

  const handleClickDropzone = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElDropzone(event.currentTarget);
    setOpenDropzone(true);
  };

  const handleCloseDropzone = () => {
    setOpenDropzone(false);
    setAnchorElDropzone(null);
  };

  const handleSaveFiles = async () => {
    const newAssets = await Promise.all(
      srcs.map(async (src, i) => {
        try {
          const response = await axios.post<{ orderAsset: OrderAsset }>('/api/createOrderAsset', {
            orderId: task.id,
            src,
            name: files[i].name,
          });
          return response.data.orderAsset; // Доступ к полю orderAsset
        } catch (error) {
          toast.error((error as Error).message); // Обработка ошибки
          return null; // Возвращаем null в случае ошибки
        }
      })
    );

    // Фильтруем null значения
    const validAssets = newAssets.filter((asset) => asset !== null) as OrderAsset[];
    // setAssets((prevAssets) => [...prevAssets, ...validAssets]);
    validAssets.forEach((asset) => addAsset(task.id, asset));
    setFiles([]);
    handleCloseDropzone();
  };

  // const handleRemoveAsset = (assetId: string) => {
  //   axios.post('/api/deleteOrderAsset', { id: assetId })
  //     .then(() => {
  //       setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  //       deleteAsset(task.id, assetId);
  //     })
  //     .catch((error) => toast.error(error.message));
  // };

  const handleRemoveFromDropZone = (i: number) => {
    setSrcs((prev) => {
      const newSrcs = [...prev];
      newSrcs.splice(i, 1);
      return newSrcs;
    });
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(i, 1);
      return newFiles;
    });
  };

  const idDropzone = openDropzone ? 'simple-popover' : undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 'bold', mb: 2 }} variant="body1">
          Assets {/*({task.assets.length})*/}
        </Typography>
        <Button size="large" aria-describedby={idDropzone} onClick={handleClickDropzone} sx={{ color: 'white', display: 'flex' }} variant="contained">
          Add new asset
        </Button>
      </Box>
      <Popover
        id={idDropzone}
        open={openDropzone}
        anchorEl={anchorElDropzone}
        onClose={handleCloseDropzone}
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
          <div
            {...getRootProps({
              style: {
                padding: 20,
                borderRadius: '10px',
                border: '2px dashed #F69220',
                width: 250,
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: 'pointer',
              },
            })}
          >
            <input {...getInputProps()} />
            <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              {`Drag 'n' drop a file here, or click to select a file`}
            </Typography>
          </div>
          {files.map((file, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              <img src={file.preview} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100px', margin: '10px 0' }} />
              <Typography variant="body2">
                {file.name} - {(file.size / 1024).toFixed(2)} KB
              </Typography>
              <Button variant="contained" color="error" sx={{ mt: 1, color: 'white' }} onClick={() => handleRemoveFromDropZone(index)}>
                Remove
              </Button>
            </Box>
          ))}
          <Button sx={{ width: '100%', color: 'white', borderRadius: '8px', mt: 2 }} variant="contained" onClick={handleSaveFiles}>
            Save
          </Button>
        </Box>
      </Popover>
      <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* {assets.map((asset, index) => (
          <Box key={asset.id}>
            <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
              <img className="rounded max-h-[100px]" src={asset.src} alt={asset.name} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>{asset.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {}}
                    sx={{
                      borderRadius: '4px',
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: 'white',
                      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.dark,
                        boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
                        color: 'white',
                      },
                    }}
                  >
                    <Download />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleRemoveAsset(asset.id)}
                    sx={{
                      borderRadius: '4px',
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: 'white',
                      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.dark,
                        boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
                        color: 'white',
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            {index !== task.assets.length - 1 && <Divider />}
          </Box>
        ))} */}
      </Paper>
    </Box>
  );
}