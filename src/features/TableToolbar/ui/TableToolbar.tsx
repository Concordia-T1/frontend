import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import { FilledButton } from '../../../shared/ui/buttons/FilledButton';
import { FilterSelect } from './FilterSelect.tsx';
import { SortSelect } from './SortSelect.tsx';
import { SearchBar } from './SearchBar.tsx';
import { theme } from '../../../app/providers/ThemeProvider/config/theme.ts';

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
  isAdmin?: boolean;
  activeTab?: 'all' | 'my';
  onTabChange?: (tab: 'all' | 'my') => void;
}

export const TableToolbar = ({
                               onSearch,
                               onSortChange,
                               onFilterChange,
                               onAddRequest,
                               isAdmin = false,
                               activeTab = 'all',
                               onTabChange,
                             }: TableToolbarProps) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm')); // Мобильная версия для экранов < 600px

  return (
    <Toolbar
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: { xs: 'wrap', sm: 'nowrap' }, // Обертывание на мобильных
        position: 'relative', // Для позиционирования кнопки отправки
        alignItems: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, mb: { xs: 1, sm: 0 } }}>
        <FilledButton
          onClick={onAddRequest}
          sx={{
            gap: 1,
            ...(isMobile && {
              position: 'fixed',
              bottom: 16,
              right: 16,
              minWidth: 'auto',
              width: '60px',
              height: '60px',
              padding: 0,
              borderRadius: '50%',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
              fontSize: 'large',
            }),
          }}
        >
          {isMobile ? <AddIcon /> : (
            <>
              <SendIcon />
              Отправить заявку
            </>
          )}
        </FilledButton>
        {isAdmin && (
          <>
            <FilledButton
              onClick={() => onTabChange?.('all')}
              sx={{
                backgroundColor:
                  activeTab === 'all' ? undefined : theme.palette.brand.white,
                color: activeTab === 'all' ? undefined : theme.palette.brand.lightBlue,
                border: activeTab === 'all' ? 'none' : '1px solid',
                borderColor: theme.palette.brand.lightBlue,
                marginRight: '5px',
                '&:hover': {
                  color: theme.palette.brand.white,
                },
              }}
            >
              Все
            </FilledButton>
            <FilledButton
              onClick={() => onTabChange?.('my')}
              sx={{
                backgroundColor:
                  activeTab === 'my' ? undefined : theme.palette.brand.white,
                color: activeTab === 'my' ? undefined : theme.palette.brand.lightBlue,
                border: activeTab === 'my' ? 'none' : '1px solid',
                borderColor: theme.palette.brand.lightBlue,
                '&:hover': {
                  color: theme.palette.brand.white,
                },
              }}
            >
              Мои
            </FilledButton>
          </>
        )}
      </Box>
      <SearchBar onSearchChange={onSearch} />
      <Box sx={{ flexGrow: 1 }} />
      <FilterSelect onFilterChange={onFilterChange} />
      <SortSelect onSortChange={onSortChange} />
    </Toolbar>
  );
};