import React, { useEffect, useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { fetchWithCppdAuth } from "@shared/api/fetchWithCppdAuth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@entities/user/store";
import { type FetchResponse, type TemplateResponse } from "@app/types";
import { theme } from "@app/providers/ThemeProvider/config/theme.ts";
import { FilledButton } from "../../shared/ui/buttons/FilledButton.tsx";

interface TemplateProps {
  templateType: "sopd" | "email";
}

export const Template: React.FC<TemplateProps> = ({ templateType }) => {
  const [content, setContent] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId, role } = useAuthStore();
  const navigate = useNavigate();

  const templateId = templateType === "sopd" ? 1 : 2; // sopd -> id=1, email -> id=2
  const templateName =
    templateType === "sopd" ? "SOPD Template" : "Email Template";
  const templateSubject =
    templateType === "sopd"
      ? "Согласие на обработку персональных данных"
      : "Запрос согласия на обработку данных";

  const fetchTemplate = async (id: number) => {
    try {
      console.log(`[Template] Запрос шаблона: /templates/${id}`);
      const response: FetchResponse<TemplateResponse> = await fetchWithCppdAuth(
        `/templates/${id}`,
        {
          method: "GET",
          headers: {
            "X-User-ID": userId?.toString() || "",
            "X-User-Role": role ? `ROLE_${role}` : "ROLE_ADMIN",
          },
        },
        navigate
      );
      console.log(`[Template] Ответ от /templates/${id}:`, response);

      if (!response.ok) {
        if (response.status === 404) {
          return createTemplate(id);
        }
        switch (response.status) {
          case 401:
            setError("Сессия истекла. Пожалуйста, войдите заново.");
            navigate("/login");
            break;
          case 403:
            setError("Доступ запрещен. Требуется роль администратора.");
            break;
          default:
            setError(response.detail || "Ошибка при загрузке шаблона");
        }
        return "";
      }

      return response.data.template.content || "";
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
      return "";
    }
  };

  const createTemplate = async (id: number) => {
    try {
      console.log(`[Template] Создание шаблона: /templates/create`, {
        id,
        name: templateName,
        subject: templateSubject,
      });
      const response: FetchResponse<TemplateResponse> = await fetchWithCppdAuth(
        "/templates/create",
        {
          method: "POST",
          headers: {
            "X-User-ID": userId?.toString() || "",
            "X-User-Role": role ? `ROLE_${role}` : "ROLE_ADMIN",
          },
          data: {
            name: templateName,
            subject: templateSubject,
            content: "<p>Шаблон по умолчанию для " + templateName + "</p>",
          },
        },
        navigate
      );

      if (!response.ok) {
        switch (response.status) {
          case 401:
            setError("Сессия истекла. Пожалуйста, войдите заново.");
            navigate("/login");
            break;
          case 403:
            setError("Доступ запрещен. Требуется роль администратора.");
            break;
          default:
            setError(response.detail || "Ошибка при создании шаблона");
        }
        return "";
      }

      return response.data.template.content || "";
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
      return "";
    }
  };

  const saveTemplate = async (id: number, html: string) => {
    try {
      console.log(`[Template] Сохранение шаблона: /templates/${id}/update`, {
        html,
      });
      const response: FetchResponse<TemplateResponse> = await fetchWithCppdAuth(
        `/templates/${id}/update`,
        {
          method: "PUT",
          headers: {
            "X-User-ID": userId?.toString() || "",
            "X-User-Role": role ? `ROLE_${role}` : "ROLE_ADMIN",
            "Content-Type": "application/json",
          },
          data: {
            name: templateName,
            subject: templateSubject,
            content: html,
          },
        },
        navigate
      );

      console.log(`[Template] Ответ от /templates/${id}/update:`, response);
      console.log(userId, role);

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
            setError(response.detail || "Ошибка при сохранении шаблона");
        }
        return;
      }

      setIsEdited(false);
      setError(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Ошибка соединения с сервером";
      setError(errorMsg);
    }
  };

  useEffect(() => {
    setError(null);
    fetchTemplate(templateId).then((html) => {
      setContent(html);
      setIsEdited(false);
    });
  }, [templateType]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <CKEditor
        editor={ClassicEditor}
        data={content}
        onChange={(_, editor) => {
          setContent(editor.getData());
          setIsEdited(true);
        }}
      />
      {isEdited && (
        <FilledButton
          variant="contained"
          onClick={() => {
            saveTemplate(templateId, content);
          }}
          sx={{ maxWidth: "150px" }}
        >
          Сохранить
        </FilledButton>
      )}
    </Box>
  );
};
