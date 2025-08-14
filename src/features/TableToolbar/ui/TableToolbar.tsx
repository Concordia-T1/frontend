import {Toolbar, TextField, IconButton, Tooltip, Select, MenuItem} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import SendIcon from '@mui/icons-material/Send';
import {FilledButton} from "../../../shared/ui/buttons/FilledButton"
import {FilterSelect} from "./FilterSelect.tsx";
import {SortSelect} from "./SortSelect.tsx";
import {SearchBar} from "./SearchField.tsx";

interface TableToolbarProps {
    onSearch: (value: string) => void;
    onSortChange: (value: string) => void;
    onFilterClick: () => void;
    onAddRequest: () => void;
}

export const TableToolbar = ({
                                 onSearch,
                                 onSortChange,
                                 onFilterClick,
                                 onAddRequest,
                             }: TableToolbarProps) => {
    const handleSortChange = (sort: string) => {
        console.log('Sort:', sort);
        // Логика сортировки
    };

    const handleFilterChange = (filters: { viewed: boolean; notViewed: boolean; statuses: string[]; date: string }) => {
        console.log('Filters:', filters);
        // Логика фильтрации (например, обновление запросов)
    };

    const handleSearchChange = (search: string) => {
        console.log('Search:', search);
        // Логика поиска (например, фильтрация requests по email или другим полям)
    };

    return (
        <Toolbar sx={{display: "flex", gap: 2}}>
            <FilledButton onClick={onAddRequest} sx={{gap: 1}}>
                <SendIcon/>
                Отправить запрос
            </FilledButton>
            <SearchBar onSearchChange={handleSearchChange}/>
            <div style={{flexGrow: 1}}/>
            <FilterSelect onSortChange={handleSortChange} onFilterChange={handleFilterChange}/>
            <SortSelect onSortChange={handleSortChange}/>
        </Toolbar>
    )
}