import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

interface AutoResizingTextareaProps {
  maxRows?: number;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
  value: string;
}

const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, AutoResizingTextareaProps>(
  ({ maxRows = 1, placeholder, onChange, onKeyDown, autoFocus, value }, ref) => {
    const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [maxHeight, setMaxHeight] = useState<number>(0);
    // const [value, setValue] = useState<string>(""); // Local state for value

    useImperativeHandle(ref, () => internalTextareaRef.current as HTMLTextAreaElement);

    useEffect(() => {
      const calculateMaxHeight = () => {
        const textarea = internalTextareaRef.current;
        if (textarea) {
          textarea.style.height = "auto";
          const singleRowHeight = textarea.scrollHeight;
          setMaxHeight(singleRowHeight * maxRows);
          if (autoFocus) {
            textarea.focus();
          }
        }
      };

      calculateMaxHeight();
    }, [maxRows]);

    useEffect(() => {
      const textarea = internalTextareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      }
    }, [value, maxHeight]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      // setValue(event.target.value); // Update local state on change
      onChange(event); // Call the passed onChange function
    };

    return (
      <textarea
        ref={internalTextareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          overflow: "hidden",
          resize: "none",
          maxHeight: `${maxHeight}px`,
        }}
        rows={1}
      />
    );
  },
);

export default AutoResizingTextarea;