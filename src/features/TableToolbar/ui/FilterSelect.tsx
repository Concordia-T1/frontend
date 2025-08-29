import { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Checkbox,
  FormControlLabel,
  Typography,
  useMediaQuery,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { theme } from '../../../app/providers/ThemeProvider/config/theme.ts';
import { FilledButton } from '../../../shared/ui/buttons/FilledButton.tsx';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.locale('ru');

interface FilterValues {
  viewed: boolean;
  notViewed: boolean;
  statuses: string[];
  dateFrom: string;
  dateTo: string;
}

interface FilterSelectProps {
  onFilterChange: (filters: FilterValues) => void;
}

export const FilterSelect = ({ onFilterChange }: FilterSelectProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    viewed: false,
    notViewed: false,
    statuses: [],
    dateFrom: '',
    dateTo: '',
  });
  const [dateFromValue, setDateFromValue] = useState<Dayjs | null>(null);
  const [dateToValue, setDateToValue] = useState<Dayjs | null>(null);
  const isMobile = useMediaQuery('(max-width:940px)');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    const newFilters = {
      ...filters,
      dateFrom: dateFromValue ? dateFromValue.format('DD.MM.YYYY') : '',
      dateTo: dateToValue ? dateToValue.format('DD.MM.YYYY') : '',
    };
    setFilters(newFilters);
    setAnchorEl(null);
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (
    name: keyof FilterValues,
    value: boolean | string,
  ) => {
    if (name === 'statuses') {
      setFilters((prev) => {
        const isWaitingSelected = prev.statuses.includes('STATUS_WAITING');
        const isQueuedSelected = prev.statuses.includes('STATUS_QUEUED');
        let newStatuses: string[];

        if (value === 'STATUS_WAITING') {
          // Если выбираем "Ожидание", добавляем или убираем оба статуса
          if (isWaitingSelected || isQueuedSelected) {
            // Если хотя бы один из статусов уже выбран, убираем оба
            newStatuses = prev.statuses.filter(
              (status) => status !== 'STATUS_WAITING' && status !== 'STATUS_QUEUED'
            );
          } else {
            // Если ни один не выбран, добавляем оба
            newStatuses = [...prev.statuses, 'STATUS_WAITING', 'STATUS_QUEUED'];
          }
        } else {
          // Для других статусов (REFUSED, CONSENT) стандартная логика
          newStatuses = prev.statuses.includes(value as string)
            ? prev.statuses.filter((status) => status !== value)
            : [...prev.statuses, value as string];
        }

        return { ...prev, statuses: newStatuses };
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<FilterAltIcon />}
        endIcon={!isMobile ? <KeyboardArrowDownIcon /> : null}
        onClick={handleClick}
        sx={{
          borderRadius: '30px',
          border: 'none',
          backgroundColor: '#ECF2F9',
          color: theme.palette.text.primary,
          textTransform: 'none',
          minWidth: 'auto',
          padding: isMobile ? '6px' : '6px 16px',
          transition: '0.5s',
          boxShadow: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .MuiButton-startIcon': {
            margin: isMobile ? 0 : '0 8px 0 -4px',
          },
          '&:hover': {
            backgroundColor: '#DCE6F1',
            border: 'none',
            boxShadow: 'none',
          },
        }}
      >
        {!isMobile && 'Фильтр'}
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
            minWidth: 250,
            borderRadius: '8px',
            boxShadow: theme.shadows[3],
            marginTop: '10px',
            backgroundColor: '#ECF2F9',
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Статус
              </Typography>
              {[
                { value: 'STATUS_REFUSED', label: 'Отказ' },
                { value: 'STATUS_CONSENT', label: 'Согласие' },
                { value: 'STATUS_WAITING', label: 'Ожидание' },
              ].map(({ value, label }) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={
                        value === 'STATUS_WAITING'
                          ? filters.statuses.includes('STATUS_WAITING') ||
                          filters.statuses.includes('STATUS_QUEUED')
                          : filters.statuses.includes(value)
                      }
                      onChange={() => handleCheckboxChange('statuses', value)}
                      color="primary"
                    />
                  }
                  label={label}
                />
              ))}
            </Box>

            {/* Поля для дат */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Дата отправки
              </Typography>
              <DatePicker
                label="От"
                value={dateFromValue}
                onChange={(newValue) => setDateFromValue(newValue)}
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: { mb: 1 },
                    error: dateFromValue === null && filters.dateFrom !== '',
                    helperText:
                      dateFromValue === null && filters.dateFrom !== ''
                        ? 'Неверный формат даты'
                        : '',
                  },
                }}
                shouldDisableDate={(date) => (dateToValue ? date > dateToValue : false)}
              />
              <DatePicker
                label="До"
                value={dateToValue}
                onChange={(newValue) => setDateToValue(newValue)}
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: dateToValue === null && filters.dateTo !== '',
                    helperText:
                      dateToValue === null && filters.dateTo !== ''
                        ? 'Неверный формат даты'
                        : '',
                  },
                }}
                shouldDisableDate={(date) => (dateFromValue ? date < dateFromValue : false)}
              />
            </Box>
            <Box>
              <FilledButton
                onClick={handleClose}
                sx={{
                  padding: '4px 15px',
                  textTransform: 'none',
                }}
              >
                Применить
              </FilledButton>
            </Box>
          </Box>
        </LocalizationProvider>
      </Popover>
    </Box>
  );
};