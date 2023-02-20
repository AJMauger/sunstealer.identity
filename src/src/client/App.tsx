import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";

import { _configuration, _identity, _logger } from "./index"
import { GlobalHeader } from "./components/globalheader"
import { Home } from "./components/home"
import { eOIDCFLOW } from "./services/identity";

const data: any = {
  error: "",
  warning: ""
}

export const GlobalContext = React.createContext(data);

const App = () => {
  // const [component, SetComponent] = React.useState<any>(<Home />);

  /* ajm: useEffect(() => {
    const componentDidMount = () => {
      console.info(`componentDidMount(${window.location.href})`);      
    }
    componentDidMount();
    return () => {
      console.info("componentUnmount()");
    };
  });*/

  useEffect(() => {
    const componentDidUpdate = async () => {
      console.info("componentDidUpdate()");
      if (_identity.GetState() === eOIDCFLOW.eSIGNINGIN) {
        await _identity.AuthorizationCodeFlowPKCE();
      }
    }
    componentDidUpdate();
  });

  document.oncontextmenu = (e: MouseEvent) => {
    e.preventDefault();
  }

  return (
    <div>
      <div>
        <GlobalHeader />
      </div>
      <div style={{ height: "100vh" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
