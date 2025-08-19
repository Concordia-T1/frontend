import { Box, Button, Paper, Typography, TextField, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { theme } from '../../app/providers/ThemeProvider/config/theme.ts';
import { ActionButton } from '../../shared/ui/buttons/ActionButton.tsx';
import { FilledButton } from '../../shared/ui/buttons/FilledButton.tsx';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';


interface MockRequest {
  id: string;
  email: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  fullName: string;
  birthDate: string;
  phone: string;
  sentDate: string;
  receivedDate: string;
}

export const RequestInfoPage = () => {
  const navigate = useNavigate();

  // Моковые данные
  const mockRequest: MockRequest = {
    id: '1',
    email: 'ivanov@example.com',
    status: 'APPROVED',
    fullName: 'Иванов Иван Иванович',
    birthDate: '1990-05-20',
    phone: '+7 (999) 123-45-67',
    sentDate: '2025-01-14',
    receivedDate: '2025-01-15',
  };

  const handleExport = () => {
    console.log('Экспорт данных для заявки:', mockRequest);
  };

  const handleDelete = () => {
    console.log('Удаление заявки:', mockRequest.id);
  };

  return (
    <Box
      sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', boxSizing: 'border-box', margin: { xs: '0 16px', sm: '0 24px' } }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 2 }}>
        <Button
          sx={{
            color: theme.palette.brand.secondary,
            transition: '0.5s',
            '&:hover': {
              color: theme.palette.brand.primary,
              bgcolor: theme.palette.brand.white,
            },
          }}
          onClick={() => {
            console.log('Переход на страницу запросов');
            navigate('/requests');
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Button
          sx={{
            color: theme.palette.brand.secondary,
            transition: '0.5s',
            '&:hover': {
              color: theme.palette.brand.primary,
              bgcolor: theme.palette.brand.white,
            },
          }}
          onClick={handleDelete}
        >
          <DeleteIcon />
        </Button>
      </Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          boxShadow: 'none',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5 }}>
          <Box>
            <Typography variant="h6" fontWeight={500} sx={{ marginBottom: '10px' }}>
              {mockRequest.email}
            </Typography>
            <Chip
              label={
                mockRequest.status === 'APPROVED'
                  ? 'Согласие'
                  : mockRequest.status === 'REJECTED'
                    ? 'Отказ'
                    : mockRequest.status === 'PENDING'
                      ? 'Ожидание'
                      : 'Таймаут'
              }
              sx={{
                backgroundColor:
                  mockRequest.status === 'APPROVED'
                    ? theme.palette.brand.pastelGreen
                    : mockRequest.status === 'REJECTED'
                      ? theme.palette.brand.pastelRed
                      : mockRequest.status === 'PENDING'
                        ? theme.palette.brand.pastelOrange
                        : theme.palette.brand.pastelBlue,
              }}
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Отправлено: {new Date(mockRequest.sentDate).toLocaleDateString('ru-RU')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Получено: {new Date(mockRequest.receivedDate).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" fontWeight={400} sx={{ mt: 3, mb: 2 }}>
          Данные кандидата:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ФИО"
            value={mockRequest.fullName}
            variant="standard"
            aria-readonly={true}
            sx={{ maxWidth: '500px' }}
          />
          <TextField
            label="Дата рождения"
            value={new Date(mockRequest.birthDate).toLocaleDateString('ru-RU')}
            fullWidth
            variant="standard"
            aria-readonly={true}
            sx={{ maxWidth: '500px' }}
          />
          <TextField
            label="Номер телефона"
            value={mockRequest.phone}
            fullWidth
            variant="standard"
            aria-readonly={true}
            sx={{ maxWidth: '500px' }}
          />
          <TextField
            label="E-mail"
            value={mockRequest.email}
            fullWidth
            variant="standard"
            aria-readonly={true}
            sx={{ maxWidth: '500px' }}
          />
        </Box>

        <Box sx={{ mt: 5, display: 'flex' }}>
          <FilledButton
            onClick={handleExport}
            sx={{ gap: 1 }}
          >
            <FileDownloadIcon />
            Экспорт данных
          </FilledButton>
        </Box>
      </Paper>
    </Box>
  );
};