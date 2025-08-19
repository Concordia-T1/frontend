import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface TemplateProps {
  templateType: "sopd" | "email";
}

// TODO: Ограничить доступ к редакции шаблонов менеджерам

const fetchTemplate = async (type: string) => {
  if (type === "sopd") return "<p>Содержимое шаблона СОПД</p>";
  if (type === "email") return "<p>Содержимое шаблона письма</p>";
  return "";

  // TODO: Забрать шаблоны с бэка
};

const saveTemplate = async (type: string, html: string) => {
  console.log("Сохраняем шаблон", type, html);

  // TODO: Сохранение шаблона
};

export const Template: React.FC<TemplateProps> = ({ templateType }) => {
  const [content, setContent] = useState("");
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    fetchTemplate(templateType).then((html) => {
      setContent(html);
      setIsEdited(false);
    });
  }, [templateType]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <CKEditor
        editor={ClassicEditor}
        data={content}
        onChange={(_, editor) => {
          setContent(editor.getData());
          setIsEdited(true);
        }}
      />
      {isEdited && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            saveTemplate(templateType, content);
            setIsEdited(false);
          }}
        >
          Сохранить
        </Button>
      )}
    </Box>
  );
};
