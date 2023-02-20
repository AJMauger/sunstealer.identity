import React from "react";
import ReactDOM from "react-dom";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import App from "./App";

import { Configuration } from "./services/configuration";
import { Identity } from "./services/identity";
import { Logger } from "./services/logger";

import { Authorization } from "./components/authorization";
import { Home } from "./components/home";

export const _logger: Logger = new Logger();
export const _configuration: Configuration = new Configuration();
export const _identity: Identity = new Identity();

const router: any = createBrowserRouter(
  createRoutesFromElements(
    <Route path = "/" element={<App />}>
      <Route path="/" element={<Home />} />
      <Route path="/authorization" element={<Authorization />} />
      <Route path="/oidc" element={<Home />} />
    </Route>
  ),
  {
    basename: _configuration.configuration.ingress  
  }
);

const Render = (): void => {
  ReactDOM.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
    document.getElementById("root"));
}

(async () => {
  _logger.LogDebug("index.tsx: async () =>");
  _logger.LogDebug(`document.location:  ${JSON.stringify(document.location)}`);
  await _identity.Start().then(() => {
    if (_identity.discovery) {
      Render();
    } else {
      _logger.LogError("!_identity.discovery");
      Render();
    }
  }).catch((e) => {
    _logger.LogException(e);
    Render();
  });
})().catch((e) => {
  _logger.LogError(e);
});

