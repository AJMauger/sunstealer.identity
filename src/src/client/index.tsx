import React from "react";
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import App from "./App";

import { Configuration, User } from "./services/configuration";
import { Identity } from "./services/identity";
import { Logger } from "./services/logger";

import { Authorization } from "./components/authorization";
import { Home } from "./components/home";
import { Users } from "./components/users";

export const _logger: Logger = new Logger();
export const _configuration: Configuration = new Configuration();
export const _identity: Identity = new Identity();

const router: any = createBrowserRouter(
  createRoutesFromElements(
    <Route path = "/" element={<App />}>
      <Route path="/" element={<Home />} />
      <Route path="/authorization" element={<Authorization />} />
      <Route path="/oidc" element={<Home />} />
      <Route path="/users" element={<Users />} />
    </Route>
  )
);

const Render = (): void => {
  const root: HTMLElement | null = document.getElementById("root")
  if (root) {
    createRoot(root).render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>);
  }
}

(async () => {
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

