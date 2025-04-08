// components/DroppableZone/NewPostitForm.tsx
import React, { useRef, useEffect } from "react";
import { Card, CardContent, TextField } from "@mui/material";

interface NewPostitFormProps {
  initialText: string;
  backgroundColor: string;
  fontSize: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export const NewPostitForm: React.FC<NewPostitFormProps> = ({
  initialText,
  backgroundColor,
  fontSize,
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = React.useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleBlur = () => {
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit(text);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (text === initialText) {
      e.target.select();
    }
  };

  return (
    <Card style={{ marginBottom: "8px", backgroundColor }}>
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <TextField
          fullWidth
          multiline
          variant="standard"
          inputRef={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoFocus
          InputProps={{
            style: { fontSize: `${fontSize}px` },
          }}
          sx={{
            "& .MuiInput-underline:before": {
              borderBottomColor: "transparent",
            },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottomColor: "rgba(0, 0, 0, 0.42)",
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
