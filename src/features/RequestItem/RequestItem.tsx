import {
  TableCell,
  TableRow,
  Checkbox,
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { theme } from '@app/providers/ThemeProvider/config/theme.ts';
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface Request {
  id: string;
  date: string;
  email: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'TIMEOUT';
  isViewed: boolean;
}

interface RequestItemProps {
  request: Request;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RequestItem = ({
                              request,
                              isSelected,
                              onSelect,
                              onDelete,
                            }: RequestItemProps) => {
  const navigate = useNavigate();

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('.MuiChip-root') ||
      target.closest('.MuiIconButton-root')
    ) {
      return;
    }
    navigate(`/request/${request.id}`);
  };

  return (
    <TableRow
      sx={{
        transition: '0.5s',
        '&:hover': {
          backgroundColor: theme.palette.brand.backgroundLight,
          cursor: 'pointer',
        },
        '&:last-child td, &:last-child th': { border: 0 }, // убирает границу у последней строки
      }}
      onClick={handleRowClick}
    >
      <TableCell
        padding="checkbox"
        sx={{
          width: { xs: '10%', sm: '60px' },
          paddingLeft: { xs: '12px', sm: '20px' },
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(request.id)}
          color="primary"
        />
      </TableCell>
      <TableCell sx={{ width: { xs: '20%', sm: '100px' } }}>
        {request.date}
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '40%', sm: '150px' },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {request.email}
      </TableCell>
      <TableCell sx={{ width: { xs: '30%', sm: '200px' } }}>
        <Chip
          label={
            request.status === 'APPROVED'
              ? 'Согласие'
              : request.status === 'REJECTED'
                ? 'Отказ'
                : request.status === 'PENDING'
                  ? 'Ожидание'
                  : 'Таймаут'
          }
          sx={{
            backgroundColor:
              request.status === 'APPROVED'
                ? theme.palette.brand.pastelGreen
                : request.status === 'REJECTED'
                  ? theme.palette.brand.pastelRed
                  : request.status === 'PENDING'
                    ? theme.palette.brand.pastelOrange
                    : theme.palette.brand.pastelBlue,
          }}
        />
      </TableCell>
      <TableCell sx={{ width: { xs: '10%', sm: '20px' } }}>
        {!request.isViewed && (
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: theme.palette.brand.grayLight,
              mr: 1,
            }}
          />
        )}
      </TableCell>
      <TableCell sx={{ width: { xs: '10%', sm: '30px' } }}>
        <IconButton
          onClick={() => onDelete(request.id)}
          sx={{
            color: theme.palette.brand.grayLight,
            transition: '0.5s',
            '&:hover': {
              backgroundColor: theme.palette.brand.backgroundLight,
              color: theme.palette.brand.grayDark,
            },
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};


