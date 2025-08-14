import { TableToolbar } from '@features/TableToolbar/ui/TableToolbar.tsx';
import { RequestsTable } from '@widgets/RequestsTable/ui/RequestsTable.tsx';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import ClearIcon from '@mui/icons-material/Clear';
import UploadIcon from '@mui/icons-material/Upload';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    IconButton,
    Box,
    Typography,
    Chip,
} from '@mui/material';
import React, { useState } from 'react';
import { theme } from '@app/providers/ThemeProvider/config/theme.ts';
import { ActionButton } from "../../shared/ui/buttons/ActionButton.tsx";

interface Request {
    id: string;
    date: string;
    email: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'TIMEOUT';
    isViewed: boolean;
}

const mockRequests: Request[] = [
    { id: '1', date: '01.08.2025', email: 'example1@pochta.com', status: 'APPROVED', isViewed: false },
    { id: '2', date: '02.08.2025', email: 'example2@pochta.com', status: 'PENDING', isViewed: false },
    { id: '3', date: '03.08.2025', email: 'example3@pochta.com', status: 'REJECTED', isViewed: true },
    { id: '4', date: '04.08.2025', email: 'example4@pochta.com', status: 'TIMEOUT', isViewed: true },
];

export const RequestsPage = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [managerEmail, setManagerEmail] = useState('manager@company.com');
    const [candidateEmails, setCandidateEmails] = useState<string[]>([]);
    const [candidateInput, setCandidateInput] = useState('');
    const [hasDraft, setHasDraft] = useState(false);
    const [managerEmailError, setManagerEmailError] = useState(false);

    const handleDelete = (id: string) => console.log(`Delete request with id: ${id}`);

    const handleAddRequest = () => {
        setDialogOpen(true);
        setIsMinimized(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        if (managerEmail || candidateEmails.length > 0) {
            setHasDraft(true);
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
        setIsMinimized(false);
        setCandidateEmails([]);
        setCandidateInput('');
        setManagerEmail('manager@company.com');
        setHasDraft(false);
        setManagerEmailError(false);
    };

    const handleSend = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmail.trim())) {
            setManagerEmailError(true);
            return;
        }
        console.log('Отправка запроса:', { managerEmail, candidateEmails });
        handleClose();
    };

    const handleManagerEmailChange = (value: string) => {
        setManagerEmail(value);
        setManagerEmailError(false);
        if (value || candidateEmails.length > 0) {
            setHasDraft(true);
        }
    };

    const handleCandidateInputChange = (value: string) => {
        setCandidateInput(value);
        if (value || managerEmail) {
            setHasDraft(true);
        }
    };

    const handleCandidateInputKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const emails = candidateInput
                .split(/[\s,]+/)
                .filter((email) => email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
            setCandidateEmails((prev) => [...new Set([...prev, ...emails])]);
            setCandidateInput('');
        }
    };

    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('Загрузка CSV:', file.name);
            const mockEmails = ['candidate1@company.com', 'candidate2@company.com'];
            setCandidateEmails((prev) => [...new Set([...prev, ...mockEmails])]);
            setHasDraft(true);
        }
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: '100%', boxSizing: 'border-box' }}>
            <TableToolbar
                onSearch={(value: string) => console.log('Поиск:', value)}
                onSortChange={(value: string) => console.log('Сортировка:', value)}
                onFilterClick={() => console.log('Открыть фильтры')}
                onAddRequest={handleAddRequest}
            />
            <RequestsTable requests={mockRequests} onDelete={handleDelete} />

            <Dialog
                open={dialogOpen && !isMinimized}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                disablePortal
                hideBackdrop
                disableEnforceFocus
                disableAutoFocus
                sx={{
                    '& .MuiDialog-paper': {
                        position: 'fixed',
                        bottom: 0,
                        right: '30px',
                        m: 0,
                        width: { xs: '100%', sm: '600px' },
                        minHeight: { xs: '60vh', sm: '600px' },
                        maxHeight: { xs: '80vh', sm: '800px' },
                        borderRadius: '8px 8px 0 0',
                        boxShadow: theme.shadows[4],
                        zIndex: 1300,
                    },
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 500 }}>
                    <Typography variant="h6">Запрос кандидату</Typography>
                    <Box>
                        <IconButton onClick={handleMinimize}>
                            <HorizontalRuleIcon />
                        </IconButton>
                        <IconButton onClick={handleClose}>
                            <ClearIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <TextField
                        label="E-mail менеджера"
                        value={managerEmail}
                        onChange={(e) => handleManagerEmailChange(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="standard"
                        error={managerEmailError}
                        helperText={managerEmailError ? 'Введите корректный email' : ''}
                        sx={{ bgcolor: theme.palette.brand.white, marginTop: '40px' }}
                    />

                    {/* Поле с чипами и вводом email кандидатов */}
                    <TextField
                        placeholder="Email кандидата(ов)"
                        variant="standard"
                        fullWidth
                        margin="normal"
                        InputProps={{
                            startAdornment: candidateEmails.map((email) => (
                                <Chip
                                    key={email}
                                    label={email}
                                    onDelete={() => setCandidateEmails((prev) => prev.filter((e) => e !== email))}
                                    deleteIcon={<ClearIcon />}
                                    sx={{
                                        bgcolor: theme.palette.brand.backgroundLight,
                                        color: theme.palette.brand.primary,
                                        marginRight: 0.5,
                                        height: 24,
                                        fontSize: '0.85rem',
                                        transform: 'translateY(-4px)',
                                        '& .MuiChip-deleteIcon': { color: theme.palette.grey[500], '&:hover': { color: theme.palette.grey[700] } },
                                    }}
                                />
                            )),
                        }}
                        onChange={(e) => handleCandidateInputChange(e.target.value)}
                        onKeyDown={handleCandidateInputKeyDown}
                        value={candidateInput}
                    />

                    {/* Кнопка загрузки CSV */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                            variant="outlined"
                            endIcon={<UploadIcon />}
                            component="label"
                            sx={{
                                whiteSpace: 'nowrap',
                                bgcolor: theme.palette.brand.backgroundLight,
                                color: theme.palette.brand.primary,
                                borderColor: theme.palette.brand.white,
                                textTransform: 'none',
                                borderRadius: '30px',
                                "&:hover": { backgroundColor: '#DAE1E8' }
                            }}
                        >
                            Загрузить CSV
                            <input type="file" accept=".csv" hidden onChange={handleCsvUpload} />
                        </Button>
                    </Box>

                    {/* Кнопка отправки */}
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
                        <ActionButton
                            onClick={handleSend}
                            variant="contained"
                            disabled={candidateEmails.length === 0 || managerEmailError}
                            sx={{
                                bgcolor: theme.palette.brand.lightBlue,
                                borderRadius: '30px',
                                '&:hover': { bgcolor: theme.palette.brand.darkblue },
                            }}
                        >
                            Отправить
                        </ActionButton>
                    </Box>
                </DialogContent>
            </Dialog>

            {isMinimized && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        right: '30px',
                        bgcolor: theme.palette.brand.backgroundLight,
                        p: 1,
                        borderRadius: '8px 8px 0 0',
                        boxShadow: theme.shadows[4],
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        zIndex: 1300,
                    }}
                >
                    <Typography variant="body2">{hasDraft ? 'Черновик запроса' : 'Новый запрос'}</Typography>
                    <IconButton onClick={() => setIsMinimized(false)}>
                        <HorizontalRuleIcon sx={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                    <IconButton onClick={handleClose}>
                        <ClearIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};
