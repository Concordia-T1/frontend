import React, { useEffect, useState, useRef } from "react";
import { Box, Alert } from "@mui/material";
import { fetchWithCppdAuth } from "../../shared/api/fetchWithCppdAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../entities/user/store";
import { type FetchResponse } from "../../app/types";
import { FilledButton } from '../../shared/ui/buttons/FilledButton.tsx';
import { OutlinedButton } from '../../shared/ui/buttons/OutlinedButton.tsx';
import { theme } from '../../app/providers/ThemeProvider/config/theme.ts';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Slide } from "@mui/material";

export const CppdTemplate: React.FC = () => {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { userId, role, email } = useAuthStore();
  const navigate = useNavigate();
  const quillRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
          ],
        },
      });

      quillInstance.current.on("text-change", () => {
        const newContent = quillInstance.current!.root.innerHTML;
        console.log("[CppdTemplate] Quill text-change, new content:", newContent);
        setContent(newContent);
      });
    }

    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change");
      }
    };
  }, []);

  const fetchTemplate = async () => {
    if (!userId || !role || !email) {
      setError("Пользователь не аутентифицирован. Пожалуйста, войдите заново.");
      navigate("/login");
      return;
    }

    try {
      console.log(`[CppdTemplate] Запрос шаблона: /cppd`);
      const response: FetchResponse<{ id: string; content: string }> = await fetchWithCppdAuth(
        `/cppd`,
        {
          method: "GET",
        },
        navigate
      );

      console.log(`[CppdTemplate] Ответ от /cppd:`, response);

      if (!response.ok) {
        switch (response.status) {
          case 401:
            setError("Сессия истекла. Пожалуйста, войдите заново.");
            navigate("/login");
            break;
          case 403:
            setError("Доступ запрещен. Требуется роль администратора.");
            break;
          case 404:
            setError("Шаблон не найден.");
            break;
          default:
            setError(response.detail || "Ошибка при загрузке шаблона");
        }
        return;
      }

      const { content } = response.data;
      console.log("[CppdTemplate] Загруженные данные шаблона:", { content });
      setContent(content || "");
      setOriginalContent(content || "");
      if (quillInstance.current) {
        quillInstance.current.root.innerHTML = content || "";
        console.log("[CppdTemplate] Quill установлен с содержимым:", content);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
      console.error("[CppdTemplate] Ошибка при загрузке шаблона:", errorMsg);
    }
  };

  const saveTemplate = async () => {
    const currentContent = quillInstance.current?.root.innerHTML || content;
    console.log("[CppdTemplate] Попытка сохранения шаблона, текущий контент:", currentContent);

    if (!userId || !role || !email || role !== "ROLE_ADMIN") {
      setError(
        role !== "ROLE_ADMIN"
          ? "Доступ запрещен. Требуется роль администратора."
          : "Пользователь не аутентифицирован. Пожалуйста, войдите заново."
      );
      navigate("/login");
      return;
    }

    if (!currentContent || currentContent === "<p><br></p>") {
      setError("Содержимое шаблона не может быть пустым.");
      return;
    }

    if (currentContent === originalContent) {
      setInfoMessage("Изменений в шаблоне нет.");
      setError(null);
      return;
    }

    try {
      const requestBody = {
        content: currentContent,
      };
      console.log(`[CppdTemplate] Сохранение шаблона: /cppd/update, тело запроса:`, requestBody);

      const response: FetchResponse<{ id: string; content: string }> = await fetchWithCppdAuth(
        `/cppd/update`,
        {
          method: "PUT",
          data: requestBody,
        },
        navigate
      );

      console.log(`[CppdTemplate] Ответ от /cppd/update:`, response);

      if (!response.ok) {
        switch (response.status) {
          case 401:
            setError("Сессия истекла. Пожалуйста, войдите заново.");
            navigate("/login");
            break;
          case 403:
            setError("Доступ запрещен. Требуется роль администратора.");
            break;
          case 404:
            setError("Шаблон не найден.");
            break;
          case 400:
            setError(response.detail || "Некорректные данные шаблона.");
            break;
          default:
            setError(response.detail || "Ошибка при сохранении шаблона");
        }
        return;
      }

      setOriginalContent(currentContent);
      setError(null);
      setInfoMessage(null);
      setSuccessMessage("Изменения сохранены");
      console.log("[CppdTemplate] Шаблон успешно сохранен");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
      console.error("[CppdTemplate] Ошибка при сохранении шаблона:", errorMsg);
    }
  };

  const cancelChanges = () => {
    console.log("[CppdTemplate] Отмена изменений, возврат к:", { content: originalContent });
    setContent(originalContent);
    if (quillInstance.current) {
      quillInstance.current.root.innerHTML = originalContent || "";
    }
    setError(null);
    setInfoMessage(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    console.log("[CppdTemplate] Запуск загрузки шаблона");
    setError(null);
    fetchTemplate();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2 }, width: "100%" }}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {error}
        </Alert>
      )}
      {infoMessage && (
        <Alert
          severity="info"
          sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {infoMessage}
        </Alert>
      )}
      <Box
        sx={{
          "& .ql-container": {
            minHeight: { xs: "200px", sm: "300px" },
            borderRadius: "4px",
            border: "1px solid",
            borderColor: theme.palette.brand.lightBlue,
          },
          "& .ql-toolbar": {
            borderRadius: "4px 4px 0 0",
            border: "1px solid",
            borderColor: theme.palette.brand.lightBlue,
            backgroundColor: "background.paper",
          },
        }}
      >
        <div ref={quillRef} />
      </Box>
      {role === "ROLE_ADMIN" && (
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
          <OutlinedButton
            variant="outlined"
            onClick={cancelChanges}
            sx={{
              maxWidth: { xs: "120px", sm: "150px" },
              borderColor: theme.palette.brand.lightBlue,
              backgroundColor: theme.palette.brand.white,
              padding: { xs: '6px 12px', sm: '8px 16px' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Отменить
          </OutlinedButton>
          <FilledButton
            variant="contained"
            onClick={saveTemplate}
            sx={{
              maxWidth: { xs: "120px", sm: "150px" },
              backgroundColor: theme.palette.brand.lightBlue,
              color: "white",
              padding: { xs: '6px 12px', sm: '8px 16px' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Сохранить
          </FilledButton>
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