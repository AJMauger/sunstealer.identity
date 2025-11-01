import React from "react";
import { GlobalContext } from "../App";

interface Props {
  height: string;
  width: string;
};

export const StatusFunctional: React.FC<Props> = (props) => {

  // ajm: -----------------------------------------------------------------------------------------
  const usecontext = React.useContext(GlobalContext);

  return (
    <div style={{  backgroundColor: "var(--color-background-modal)", height: props.height, width: props.width }}>
      <div style={{color: "gray"}}>Status functional</div>
      <div style={{color: "var(--red)", padding: 5}}>{usecontext.error}</div>
      <div style={{color: "var(--yellow)", padding: 5}}>{usecontext.warning}</div>
    </div>
  );
}
