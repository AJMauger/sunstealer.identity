import React, { PropsWithChildren } from "react";
import "../App.css";

// ajm: -------------------------------------------------------------------------------------------
interface IMenuProps {
  height: number
  open: boolean;
  options: { text?: string, callback?: () => any }[];
  width: number;
  x: number;
  y: number;
}

export const Menu: React.FC<PropsWithChildren<IMenuProps>> = (props: IMenuProps) => {
  return (
    <div className="menu" style={{ display: (props.open ? "flex" : "none"), height: props.height, left: props.x, position: "absolute", top: props.y, width: props.width }}>
      <div>Menu</div>
      <hr />
      {props.options.map((o: any, i: number) => {
        if (o.text === undefined) {
          return <hr key={`mo${i}`} />
        } else {
          return <div className="menu-option" key={`mo${i}`} onClick={(e: React.MouseEvent<HTMLDivElement>) => { o.callback(); }}>{o.text}</div>
        }
      })}
    </div>
  );
}
