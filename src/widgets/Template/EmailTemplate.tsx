import React, { useEffect, useState, useRef } from "react";
import { Box, Alert, TextField, Slide } from "@mui/material";
import { fetchWithCppdAuth } from "../../shared/api/fetchWithCppdAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../entities/user/store";
import { type FetchResponse, type TemplateResponse } from "../../app/types";
import { FilledButton } from '../../shared/ui/buttons/FilledButton.tsx';
import { theme } from '../../app/providers/ThemeProvider/config/theme.ts';
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface TemplateProps {
  templateId: string | null;
  onTemplateCreated?: (template: { id: string; name: string; subject: string; content: string }) => void;
  onCancelCreate?: () => void;
}

export const EmailTemplate: React.FC<TemplateProps> = ({ templateId, onTemplateCreated, onCancelCreate }) => {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [originalTemplateName, setOriginalTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [originalTemplateSubject, setOriginalTemplateSubject] = useState("");
  const [error, setError] = useState<string | null>(null);
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
        console.log("[EmailTemplate] Quill text-change, new content:", newContent);
        setContent(newContent);
      });
    }

    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change");
      }
    };
  }, []);

  const fetchTemplate = async (id: string) => {
    if (!userId || !role || !email) {
      setError("Пользователь не аутентифицирован. Пожалуйста, войдите заново.");
      navigate("/login");
      return;
    }

    try {
      console.log(`[EmailTemplate] Запрос шаблона: /templates/${id}`);
      const response: FetchResponse<TemplateResponse> = await fetchWithCppdAuth(
        `/templates/${id}`,
        {
          method: "GET",
        },
        navigate
      );

      console.log(`[EmailTemplate] Ответ от /templates/${id}:`, response);

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

      const { name, subject, content } = response.data.template;
      console.log("[EmailTemplate] Загруженные данные шаблона:", { name, subject, content });
      setTemplateName(name);
      setOriginalTemplateName(name);
      setTemplateSubject(subject);
      setOriginalTemplateSubject(subject);
      setContent(content || "");
      setOriginalContent(content || "");
      if (quillInstance.current) {
        quillInstance.current.root.innerHTML = content || "";
        console.log("[EmailTemplate] Quill установлен с содержимым:", content);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
      console.error("[EmailTemplate] Ошибка при загрузке шаблона:", errorMsg);
    }
  };

  const createTemplate = async () => {
    if (!userId || !role || !email || role !== "ROLE_ADMIN") {
      setError(
        role !== "ROLE_ADMIN"
          ? "Доступ запрещен. Требуется роль администратора."
          : "Пользователь не аутентифицирован. Пожалуйста, войдите заново."
      );
      navigate("/login");
      return;
    }

    const currentContent = quillInstance.current?.root.innerHTML || content;
    console.log("[EmailTemplate] Попытка создания шаблона, текущий контент:", currentContent);

    if (!templateName || !templateSubject || !currentContent || currentContent === "<p><br></p>") {
      setError("Заполните все поля шаблона (название, тема, содержимое).");
      return;
    }

    if (templateName.length > 255 || templateSubject.length > 255) {
      setError("Название или тема шаблона слишком длинные (максимум 255 символов).");
      return;
    }

    try {
      const requestBody = {
        name: templateName,
        subject: templateSubject,
        content: currentContent,
      };
      console.log("[EmailTemplate] Создание шаблона: /templates/create, тело запроса:", requestBody);
      console.log("[EmailTemplate] Сериализованное тело запроса:", JSON.stringify(requestBody));
      const response: FetchResponse<TemplateResponse> = await fetchWithCppdAuth(
        "/templates/create",
        {
          method: "POST",
          data: requestBody,
        },
        navigate
      );

      console.log("[EmailTemplate] Ответ от /templates/create:", response);

      if (!response.ok) {
        switch (response.status) {
          case 401:
            setError("Сессия истекла. Пожалуйста, войдите заново.");
            navigate("/login");
            break;
          case 403:
            setError("Доступ запрещен. Требуется роль администратора.");
            break;
          case 400:
            setError(response.detail || "Некорректные данные шаблона.");
            console.log("[EmailTemplate] Ошибки валидации:", response.data?.validation_errors);
            break;
          default:
            setError(response.detail || "Ошибка при создании шаблона");
        }
        return;
      }

      setError(null);
      setSuccessMessage("Изменения сохранены");
      onTemplateCreated?.({
        id: String(response.data.template.id),
        name: response.data.template.name,
        subject: response.data.template.subject,
        content: response.data.template.content,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
      console.error("[EmailTemplate] Ошибка при создании шаблона:", errorMsg);
    }
  };

  const saveTemplate = async () => {
    const currentContent = quillInstance.current?.root.innerHTML || content;
    console.log("[EmailTemplate] Попытка сохранения шаблона, текущий контент:", currentContent);

    if (!templateId) {
      await createTemplate();
      return;
    }

    if (!userId || !role || !email || role !== "ROLE_ADMIN") {
      setError(
        role !== "ROLE_ADMIN"
          ? "Доступ запрещен. Требуется роль администратора."
          : "Пользователь не аутентифицирован. Пожалуйста, войдите заново."
      );
      navigate("/login");
      return;
    }

    if (!templateName || !templateSubject || !currentContent || currentContent === "<p><br></p>") {
      setError("Заполните все поля шаблона (название, тема, содержимое).");
      return;
    }

    if (templateName.length > 255 || templateSubject.length > 255) {
      setError("Название или тема шаблона слишком длинные (максимум 255 символов).");
      return;
    }

    if (
      templateName === originalTemplateName &&
      templateSubject === originalTemplateSubject &&
      currentContent === originalContent
    ) {
      setError("Изменений нет");
      return;
    }

    try {
      const requestBody = {
        name: templateName,
        subject: templateSubject,
        content: currentContent,
      };
      console.log(`[EmailTemplate] Сохранение шаблона: /templates/${templateId}/update, тело запроса:`, requestBody);
      console.log("[EmailTemplate] Сериализованное тело запроса:", JSON.stringify(requestBody));
      const response: FetchResponse<TemplateResponse> = await fetchWithCppdAuth(
        `/templates/${templateId}/update`,
        {
          method: "PUT",
          data: requestBody,
        },
        navigate
      );

      console.log(`[EmailTemplate] Ответ от /templates/${templateId}/update:`, response);

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
            console.log("[EmailTemplate] Ошибки валидации:", response.data?.validation_errors);
            break;
          default:
            setError(response.detail || "Ошибка при сохранении шаблона");
        }
        return;
      }

      setOriginalTemplateName(templateName);
      setOriginalTemplateSubject(templateSubject);
      setOriginalContent(currentContent);
      setError(null);
      setSuccessMessage("Изменения сохранены");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
      console.error("[EmailTemplate] Ошибка при сохранении шаблона:", errorMsg);
    }
  };

  const cancelChanges = () => {
    console.log("[EmailTemplate] Отмена изменений, возврат к:", {
      name: originalTemplateName,
      subject: originalTemplateSubject,
      content: originalContent,
    });
    setTemplateName(originalTemplateName);
    setTemplateSubject(originalTemplateSubject);
    setContent(originalContent);
    if (quillInstance.current) {
      quillInstance.current.root.innerHTML = originalContent || "";
    }
    setError(null);
    setSuccessMessage(null);
    if (!templateId && onCancelCreate) {
      onCancelCreate();
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    console.log("[EmailTemplate] Изменение templateId:", templateId);
    if (templateId) {
      setError(null);
      fetchTemplate(templateId);
    } else {
      setTemplateName("");
      setTemplateSubject("");
      setContent("");
      setOriginalTemplateName("");
      setOriginalTemplateSubject("");
      setOriginalContent("");
      if (quillInstance.current) {
        quillInstance.current.root.innerHTML = "";
        console.log("[EmailTemplate] Quill сброшен для создания нового шаблона");
      }
    }
  }, [templateId]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2 }, width: "100%", position: "relative" }}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {error}
        </Alert>
      )}
      <TextField
        label="Название шаблона"
        value={templateName}
        onChange={(e) => {
          setTemplateName(e.target.value);
        }}
        fullWidth
        disabled={role !== "ROLE_ADMIN"}
        sx={{
          "& .MuiInputBase-root": {
            borderColor: theme.palette.brand.lightBlue,
          },
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      />
      <TextField
        label="Тема письма"
        value={templateSubject}
        onChange={(e) => {
          setTemplateSubject(e.target.value);
        }}
        fullWidth
        disabled={role !== "ROLE_ADMIN"}
        sx={{
          "& .MuiInputBase-root": {
            borderColor: theme.palette.brand.lightBlue,
          },
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      />
      <Box
        sx={{
          "& .ql-container": {
            minHeight: { xs: "200px", sm: "300px" },
            borderRadius: "4px",
            border: "1px solid",
            borderColor: theme.palette.brand.grayLight,
          },
          "& .ql-toolbar": {
            borderRadius: "4px 4px 0 0",
            border: "1px solid",
            borderColor: theme.palette.brand.grayLight,
            backgroundColor: "background.paper",
          },
        }}
      >
        <div ref={quillRef} />
      </Box>
      {role === "ROLE_ADMIN" && (
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
          {templateId && (
            <FilledButton
              variant="outlined"
              onClick={cancelChanges}
              sx={{
                maxWidth: { xs: "120px", sm: "150px" },
                backgroundColor: theme.palette.brand.grayLight,
                borderColor: theme.palette.brand.grayLight,
                "&:hover": {
                  backgroundColor: theme.palette.brand.grayMedium,
                },
                padding: { xs: '6px 12px', sm: '8px 16px' },
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Отменить
            </FilledButton>
          )}
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
              position: "fixed",
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