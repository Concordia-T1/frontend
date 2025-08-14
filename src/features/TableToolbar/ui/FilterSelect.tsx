import { useState } from 'react';
import {
    Box,
    Button,
    Popover,
    Checkbox,
    FormControlLabel,
    Typography,
    TextField,
    IconButton,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { theme } from '@app/providers/ThemeProvider/config/theme.ts';
import React from 'react';
import {FilledButton} from "../../../shared/ui/buttons/FilledButton.tsx";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface FilterValues {
    viewed: boolean;
    notViewed: boolean;
    statuses: string[];
    date: string;
}

interface FilterSelectProps {
    onSortChange: (sort: string) => void;
    onFilterChange: (filters: FilterValues) => void;
}

export const FilterSelect = ({ onSortChange, onFilterChange }: FilterSelectProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [filters, setFilters] = useState<FilterValues>({
        viewed: false,
        notViewed: false,
        statuses: [],
        date: '',
    });
    const [dateError, setDateError] = useState<string | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        onFilterChange(filters);
    };

    const handleCheckboxChange = (name: keyof FilterValues, value: boolean | string) => {
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

    const handleDateChange = (value: string) => {
        // Валидация формата DD.MM.YYYY
        const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        if (value === '' || dateRegex.test(value)) {
            setDateError(null);
            setFilters((prev) => ({
                ...prev,
                date: value,
            }));
        } else {
            setDateError('Введите дату в формате ДД.ММ.ГГГГ');
        }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'filter-popover' : undefined;

    return (
        <Box>
            <Button
                variant="contained"
                startIcon={<FilterAltIcon />}
                endIcon={<KeyboardArrowDownIcon/>}
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
                        boxShadow: 'none'
                    }
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
                                    onChange={(e) => handleCheckboxChange('viewed', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Просмотренные"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.notViewed}
                                    onChange={(e) => handleCheckboxChange('notViewed', e.target.checked)}
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

                    {/* Поле для даты */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Дата отправки
                        </Typography>
                        <TextField
                            size="small"
                            placeholder="01.01.2001"
                            value={filters.date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            error={!!dateError}
                            helperText={dateError}
                            InputProps={{
                                endAdornment: (
                                    <IconButton size="small">
                                        <CalendarTodayIcon fontSize="small" />
                                    </IconButton>
                                ),
                            }}
                            sx={{ width: '100%' }}
                        />
                    </Box>
                    <Box>
                        <FilledButton sx={{ padding: '4px 15px', textTransform: 'none' }}>
                            Применить
                        </FilledButton>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
};