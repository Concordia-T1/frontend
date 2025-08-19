import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { OutlinedButton } from '@shared/ui/buttons/OutlinedButton.tsx';
import { theme } from '@app/providers/ThemeProvider/config/theme.ts';



export const ConsentErrorPage = () => {

  const onSubmit = () => {
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        boxSizing: 'border-box',
        margin: '0 auto 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1000px',
      }}
    >
      <Typography
        fontWeight={500}
        sx={{ mt: 4, fontSize: '70px' }}
      >
        404
      </Typography>

      <Typography
        fontWeight={500}
        sx={{ fontSize: '40px' }}
      >
        Страница не найдена
      </Typography>

      <Typography
        fontWeight={400}
        sx={{ mb: 5, fontSize: '20px' }}
      >
        Кандидат уже заполнил анкету/ссылка не валидна
      </Typography>


    </Box>
  );
};