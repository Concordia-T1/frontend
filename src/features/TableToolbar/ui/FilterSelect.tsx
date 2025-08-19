import { useState } from 'react';
import {
    Box,
    Button,
    Popover,
    Checkbox,
    FormControlLabel,
    Typography,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { theme } from '@app/providers/ThemeProvider/config/theme.ts';
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
    onSortChange: (sort: string) => void;
    onFilterChange: (filters: FilterValues) => void;
}

export const FilterSelect = ({
                                 onSortChange,
                                 onFilterChange,
                             }: FilterSelectProps) => {
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
                const newStatuses = prev.statuses.includes(value as string)
                  ? prev.statuses.filter((status) => status !== value)
                  : [...prev.statuses, value as string];
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
                transition: '0.5s',
                boxShadow: 'none',
                '&:hover': {
                    backgroundColor: '#DCE6F1',
                    border: 'none',
                    boxShadow: 'none',
                },
            }}
          >
              Фильтр
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
                      {/* Чекбоксы для просмотренных/непросмотренных */}
                      <Box>
                          <Typography variant="subtitle2" gutterBottom>
                              Просмотр
                          </Typography>
                          <FormControlLabel
                            control={
                                <Checkbox
                                  checked={filters.viewed}
                                  onChange={(e) =>
                                    handleCheckboxChange('viewed', e.target.checked)
                                  }
                                  color="primary"
                                />
                            }
                            label="Просмотренные"
                          />
                          <FormControlLabel
                            control={
                                <Checkbox
                                  checked={filters.notViewed}
                                  onChange={(e) =>
                                    handleCheckboxChange('notViewed', e.target.checked)
                                  }
                                  color="primary"
                                />
                            }
                            label="Непросмотренные"
                          />
                      </Box>

                      {/* Чекбоксы для статусов */}
                      <Box>
                          <Typography variant="subtitle2" gutterBottom>
                              Статус
                          </Typography>
                          {['REJECTED', 'APPROVED', 'PENDING', 'TIMEOUT'].map((status) => (
                            <FormControlLabel
                              key={status}
                              control={
                                  <Checkbox
                                    checked={filters.statuses.includes(status)}
                                    onChange={() => handleCheckboxChange('statuses', status)}
                                    color="primary"
                                  />
                              }
                              label={
                                  status === 'REJECTED'
                                    ? 'Отказ'
                                    : status === 'APPROVED'
                                      ? 'Согласие'
                                      : status === 'PENDING'
                                        ? 'Ожидание'
                                        : 'Таймаут'
                              }
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
                            shouldDisableDate={(date) =>
                              dateToValue ? date > dateToValue : false
                            }
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
                            shouldDisableDate={(date) =>
                              dateFromValue ? date < dateFromValue : false
                            }
                          />
                      </Box>
                      <Box>
                          <FilledButton
                            onClick={handleClose}
                            sx={{ padding: '4px 15px', textTransform: 'none' }}
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