import { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import { theme } from '../../../app/providers/ThemeProvider/config/theme.ts';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface SortSelectProps {
  onSortChange: (sort: string) => void;
}

export const SortSelect = ({ onSortChange }: SortSelectProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [sortValue, setSortValue] = useState<string>('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onSortChange(sortValue);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortValue(event.target.value);
    onSortChange(event.target.value);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'sort-popover' : undefined;

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<SortIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        sx={{
          borderRadius: '30px',
          border: 'none',
          backgroundColor: '#ECF2F9',
          color: theme.palette.text.primary,
          textTransform: 'none',
          minWidth: 150,
          padding: '6px 16px',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#DCE6F1',
            border: 'none',
            boxShadow: 'none',
          },
        }}
      >
        Сортировка
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 200,
            borderRadius: '8px',
            marginTop: '10px',
            boxShadow: theme.shadows[3],
            backgroundColor: '#ECF2F9',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Сортировка
          </Typography>
          <RadioGroup value={sortValue} onChange={handleSortChange}>
            <FormControlLabel
              value="newest"
              control={<Radio color="primary" />}
              label="Сначала новые"
            />
            <FormControlLabel
              value="oldest"
              control={<Radio color="primary" />}
              label="Сначала старые"
            />
            <FormControlLabel
              value="status"
              control={<Radio color="primary" />}
              label="По статусу"
            />
          </RadioGroup>
        </Box>
      </Popover>
    </Box>
  );
};