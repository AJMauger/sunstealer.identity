import React from "react";
import "../App.css";

export interface IButtonProps {
  disabled?: boolean;
  text: string;
  style?: any;
  OnClick: () => any;
}

export const Button: React.FC<IButtonProps> = (props: IButtonProps) => {
  return (
    <button style={{ ...props.style }} disabled={props.disabled} onClick={(e: React.MouseEvent<HTMLButtonElement>) => { props.OnClick() }}>{props.text}</button>
  );
}
