import React from "react";
import "../App.css";

export interface ITextProps {
  help: string;
  pattern?: string;
  placeholder: string;
  size: number;
  style?: any;
  value: string;
  OnChange: (value: string) => any;
}

export const Text: React.FC<ITextProps> = (props: ITextProps) => {
  const validate = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (props.pattern) {
      if (e.key.match(props.pattern) === null) {
        e.preventDefault();
      }
    }
  }
  return (
    <div>
      <div style={{ ...props.style, color: "lightgray", fontSize: 10, padding: 2 }}>{props.help}</div>
      <input placeholder={props.placeholder} size={props.size} type="text" value={props.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.OnChange(e.target.value)} onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => validate(e)} />
    </div>
  );
}
