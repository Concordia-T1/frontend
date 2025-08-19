import { Toolbar } from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import { FilledButton } from "../../../shared/ui/buttons/FilledButton";
import { FilterSelect } from "./FilterSelect.tsx";
import { SortSelect } from "./SortSelect.tsx";
import { SearchBar } from "./SearchBar.tsx";

interface TableToolbarProps {
  onSearch: (value: string) => void;
  onSortChange: (value: string) => void;
  onFilterChange: (filters: {
    viewed: boolean;
    notViewed: boolean;
    statuses: string[];
    dateFrom: string;
    dateTo: string;
  }) => void;
  onAddRequest: () => void;
}

export const TableToolbar = ({
  onSearch,
  onSortChange,
  onFilterChange,
  onAddRequest,
}: TableToolbarProps) => {
  return (
    <Toolbar sx={{ display: "flex", gap: 2 }}>
      <FilledButton onClick={onAddRequest} sx={{ gap: 1 }}>
        <SendIcon />
        Отправить запрос
      </FilledButton>
      <SearchBar onSearchChange={onSearch} />
      <div style={{ flexGrow: 1 }} />
      <FilterSelect
        onSortChange={onSortChange}
        onFilterChange={onFilterChange}
      />
      <SortSelect onSortChange={onSortChange} />
    </Toolbar>
  );
};
