import { useState } from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { theme } from '@app/providers/ThemeProvider/config/theme.ts';
import React from 'react';

interface SearchBarProps {
    onSearchChange: (search: string) => void;
}

export const SearchBar = ({ onSearchChange }: SearchBarProps) => {
    const [searchValue, setSearchValue] = useState<string>('');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchValue(value);
        onSearchChange(value);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '30px',
                backgroundColor: '#ECF2F9',
                border: 'none',
                minWidth: 40,
                height: 36,
                width: searchValue ? 200 : 50, // если есть текст — ширина 200
                transition: 'width 0.3s ease-in-out',
                '&:hover': {
                    width: 200,
                    backgroundColor: '#DCE6F1',
                },
                '& .MuiInputBase-root': {
                    backgroundColor: 'transparent',
                    border: 'none',
                    '& fieldset': {
                        border: 'none',
                    },
                },
                '& .MuiInputBase-input': {
                    padding: '6px 12px',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                },
            }}
        >
            <TextField
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Поиск..."
                variant="outlined"
                size="small"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: theme.palette.text.primary }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    width: '100%',
                    opacity: 1,
                    '& .MuiInputBase-root': {
                        height: 36,
                    },
                }}
            />
        </Box>
    );
};
