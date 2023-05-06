import React from "react";
import { Event } from "../services/event";

interface Props {
  event: Event;
}

export const Notification: React.FC<Props> = (props) => {
  const Acknowledge = (e: any) => {
    e.target.parentElement.parentElement.style.display = "none";
  }

  let icon: string = "icon-info";
  switch (props.event.severity) {
    case 2:
      icon = "icon-warn";
      break;
    case 3:
    case 4:
      icon = "icon-error";
      break;
  }

  return (
    <div style={{alignItems: "center", background: "var(--color-background-div)", borderRadius: 10, display: "flex", flexDirection: "row", margin: 10, padding: 20, width: "calc(100% - 60px)"}}>
      <div className={icon} style={{height: 45, width: 45}} />
      <div style={{marginLeft: 20, marginRight: 20, width: "calc(100% - 10px)"}}>{props.event.message}</div>
      <div style={{display: "flex", flexDirection: "column"}}>
        <div style={{height: "50%", textAlign: "right"}}>{props.event.time}</div>
        <div className="active icon-check-circle" style={{backgroundPositionX: 26, height: 28, marginTop: 10}} onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => Acknowledge(e)} />
      </div>
    </div>
  );
}
