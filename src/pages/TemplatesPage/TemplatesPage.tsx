import { Box, Alert, Typography, Select, MenuItem, useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import { fetchWithCppdAuth } from '../../shared/api/fetchWithCppdAuth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/store';
import { type FetchResponse } from '../../app/types';
import { EmailTemplate } from '../../widgets/Template/EmailTemplate.tsx';
import { CppdTemplate } from '../../widgets/Template/CppdTemplate.tsx';
import { FilledButton } from '../../shared/ui/buttons/FilledButton.tsx';
import { theme } from '../../app/providers/ThemeProvider/config/theme.ts';
import AddIcon from '@mui/icons-material/Add';
import { Slide } from '@mui/material';

interface TemplateRecord {
  id: string;
  name?: string;
  subject?: string;
  content: string;
}

export const TemplatesPage = () => {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'cppd'>('email');
  const { userId, role, email } = useAuthStore();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (activeTab === 'cppd') {
      setTemplates([]);
      setSelectedTemplateId('00000000-0000-7000-8000-000000000000');
      return;
    }

    const fetchTemplates = async () => {
      if (!userId || !role || !email) {
        setError('Пользователь не аутентифицирован. Пожалуйста, войдите заново.');
        navigate('/login');
        return;
      }

      try {
        console.log(`[TemplatesPage] Запрос списка шаблонов: /templates?page=0&size=100`);
        const response: FetchResponse<{ templates: TemplateRecord[] }> = await fetchWithCppdAuth(
          `/templates?page=0&size=100`,
          {
            method: 'GET',
          },
          navigate,
        );

        console.log(`[TemplatesPage] Ответ от /templates:`, response);

        if (!response.ok) {
          switch (response.status) {
            case 401:
              setError('Сессия истекла. Пожалуйста, войдите заново.');
              navigate('/login');
              break;
            case 403:
              setError('Доступ запрещен. Требуется роль администратора.');
              break;
            default:
              setError(response.detail || 'Ошибка при загрузке шаблонов');
          }
          return;
        }

        const fetchedTemplates = response.data?.templates || [];
        console.log(`[TemplatesPage] Обработанные шаблоны:`, fetchedTemplates);

        setTemplates(fetchedTemplates);
        if (fetchedTemplates.length > 0) {
          setSelectedTemplateId(fetchedTemplates[0].id);
        } else {
          setSelectedTemplateId(null);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Ошибка соединения с сервером';
        setError(errorMsg);
        console.error(`[TemplatesPage] Ошибка при загрузке шаблонов:`, errorMsg);
      }
    };

    fetchTemplates();
  }, [userId, role, email, navigate, activeTab]);

  const handleCreateNewTemplate = () => {
    setIsCreating(true);
    setSelectedTemplateId(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedTemplateId(templates.length > 0 ? templates[0].id : null);
  };

  if (error) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
        <Alert severity="error" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        mt: { xs: 1, sm: 3 },
        maxWidth: { xs: '100%', sm: '1000px' },
        margin: { xs: '0 8px', sm: '0 auto' },
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, sm: 2 },
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          mb: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <FilledButton
          variant={activeTab === 'email' ? 'contained' : 'outlined'}
          onClick={() => {
            setActiveTab('email');
            setIsCreating(false);
            setSelectedTemplateId(templates.length > 0 ? templates[0].id : null);
          }}
          sx={{
            color: activeTab === 'email' ? 'white' : theme.palette.brand.lightBlue,
            backgroundColor: activeTab === 'email' ? theme.palette.brand.lightBlue : 'white',
            borderColor: theme.palette.brand.lightBlue,
            "&:hover": {
              color: theme.palette.brand.white,
            },
            padding: { xs: '6px 12px', sm: '8px 16px' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Редакция шаблона письма
        </FilledButton>
        <FilledButton
          variant={activeTab === 'cppd' ? 'contained' : 'outlined'}
          onClick={() => {
            setActiveTab('cppd');
            setIsCreating(false);
            setSelectedTemplateId('00000000-0000-7000-8000-000000000000');
          }}
          sx={{
            color: activeTab === 'cppd' ? 'white' : theme.palette.brand.lightBlue,
            backgroundColor: activeTab === 'cppd' ? theme.palette.brand.lightBlue : 'white',
            borderColor: theme.palette.brand.lightBlue,
            "&:hover": {
              color: theme.palette.brand.white,
            },
            padding: { xs: '6px 12px', sm: '8px 16px' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Редакция шаблона СОПД
        </FilledButton>
        {role === 'ROLE_ADMIN' && activeTab === 'email' && (
          <FilledButton
            variant="contained"
            onClick={handleCreateNewTemplate}
            sx={{
              minWidth: { xs: 36, sm: 48 },
              marginLeft: { xs: 0, sm: 'auto' },
              padding: { xs: '6px', sm: '8px' },
            }}
          >
            <AddIcon fontSize={isMobile ? 'small' : 'medium'} />
          </FilledButton>
        )}
      </Box>

      {activeTab === 'email' && templates.length === 0 && !isCreating ? (
        <Box sx={{ p: { xs: 1, sm: 2 }, display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant={isMobile ? 'body1' : 'h6'}>Шаблонов нет</Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, sm: 2 },
          width: '100%',
        }}>
          {activeTab === 'email' && !isCreating && templates.length > 0 && (
            <Select
              value={selectedTemplateId || ''}
              onChange={(e) => setSelectedTemplateId(e.target.value || null)}
              displayEmpty
              disabled={isCreating}
              sx={{
                minWidth: { xs: 150, sm: 200 },
                marginBottom: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          )}
          {isCreating ? (
            <EmailTemplate
              templateId={null}
              onTemplateCreated={(newTemplate) => {
                setTemplates([...templates, newTemplate]);
                setSelectedTemplateId(newTemplate.id);
                setIsCreating(false);
                setSuccessMessage('Изменения сохранены');
              }}
              onCancelCreate={handleCancelCreate}
            />
          ) : (
            selectedTemplateId &&
            (activeTab === 'email' ? (
              <EmailTemplate templateId={selectedTemplateId} />
            ) : (
              <CppdTemplate />
            ))
          )}
        </Box>
      )}
      {successMessage && (
        <Slide direction="up" in={!!successMessage} mountOnEnter unmountOnExit>
          <Alert
            severity="success"
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 24 },
              left: { xs: 16, sm: 24 },
              zIndex: 1000,
              maxWidth: { xs: '80%', sm: '400px' },
              padding: { xs: '8px 16px', sm: '16px 24px' },
              fontSize: { xs: '0.75rem', sm: '1rem' },
              lineHeight: { xs: 1.4, sm: 1.5 },
              "& .MuiAlert-message": {
                fontWeight: 500,
              },
            }}
          >
            {successMessage}
          </Alert>
        </Slide>
      )}
    </Box>
  );
};