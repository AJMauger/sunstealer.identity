import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import expressejslayouts from "express-ejs-layouts";
import * as fs from "fs";
import http from "http";
import https from "https";
import jwks from "./jwks.json";
import OIDCProvider, { AccountClaims, CanBePromise, ClaimsParameterMember, Configuration as OIDCConfiguration, errors as OIDCErrors, KoaContextWithOIDC, ErrorOut as OIDCErrorOut, ResourceServer
  } from "oidc-provider";
import path from "path";

import { Configuration } from "./services/configuration";
import { Logger } from "./services/logger";
import { MongoAdapter } from "./adapter.mongodb";
import { User } from "../client/services/configuration";
import { MongoDB } from "./services/mongodb";

export const _logger: Logger = new Logger("logs");
export const _configuration: Configuration = new Configuration("configuration.json");
export const _mongodb: MongoDB = new MongoDB();

// ajm: set DEBUG=oidc-provider:*

// ajm: -------------------------------------------------------------------------------------------
const configuration: OIDCConfiguration = {
  adapter: MongoAdapter,

  claims: {
    profile: ["profile"]
  },

  clients: _configuration.configuration.clients,

  cookies: { keys: ["cookie_key"] },

  clientBasedCORS: (ctx: KoaContextWithOIDC, origin: string, client: any) => { return true; },

  features: {
    // ajm: backchannelLogout: { enabled: true },

    devInteractions: { enabled: false },

    rpInitiatedLogout: {
      enabled: true,
      logoutSource: async (ctx: KoaContextWithOIDC, form: string): Promise<any> => {
        _logger.LogDebug(`Index: features.rpInitiatedLogout.logoutSource()`);
        ctx.type = "html";
        ctx.body = `<!DOCTYPE html>
          <head>
            <title>Logout Request</title>
            <style>/* css and html classes omitted for brevity, see lib/helpers/defaults.js */</style>
          </head>
          <body>
            <div>
              <h1>Do you want to sign-out from ${ctx.host}?</h1>
              ${form}
              <button autofocus type="submit" form="op.logoutForm" value="yes" name="logout">Yes, sign me out</button>
              <button type="submit" form="op.logoutForm">No, stay signed in</button>
            </div>
          </body>
        </html>`;
      }
    },

    resourceIndicators: {
      defaultResource: (ctx: KoaContextWithOIDC): CanBePromise<string | string[]> => {
        _logger.LogDebug(`defaultResource: ${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}`);
        return `${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}`;
      },
      enabled: true,
      getResourceServerInfo: (ctx: KoaContextWithOIDC, resourceIndicator: string, client: any): CanBePromise<ResourceServer> => {
        // ajm: client: Provider.Client
        _logger.LogDebug(`getResourceServerInfo: resourceIndicator: ${resourceIndicator} client: ${JSON.stringify(client)}`);
        // ajm: access token
        return ({
          accessTokenFormat: "jwt",
          jwt: {
            sign: { alg: "RS256" }
          },
          scope: "offline_access openid profile"
        });
      },
      useGrantedResource: (ctx: KoaContextWithOIDC, model: any): any => {
        // ajm: model: AuthorizationCode | RefreshToken | DeviceCode | BackchannelAuthenticationRequest
        _logger.LogDebug(`useGrantedResource: model: ${JSON.stringify(model)}`);
        return true;
      }
    }

    // ajm: revocation: { enabled: true },
  },

  issueRefreshToken: (ctx: KoaContextWithOIDC, client: any, code: any) => {
    // ajm: client: Provider.Client
    _logger.LogDebug(`issueRefreshToken: client: ${JSON.stringify(client)} code: ${JSON.stringify(code)}`);
    return client.grantTypeAllowed("refresh_token");
  },

  // interactions: {
  // url(ctx: Provider.KoaContextWithOIDC, interaction: any /* Interaction */) {
  //   _logger.LogDebug(`interactions.url(interaction: ${JSON.stringify(interaction)})`);
  //   return `sunstealer-identity/interaction/${interaction.uid}`;
  // },
  // },*/

  jwks,

  pkce: {
    required: () => true
  },

  renderError: (ctx: KoaContextWithOIDC, out: OIDCErrorOut, error: OIDCErrors.OIDCProviderError | Error): CanBePromise<undefined | void> | undefined => {
    ctx.type = "html";
    ctx.body = `<!DOCTYPE html>
    <head>
    <link rel="stylesheet" href="./css/index.css">
    <title>Open Id Connect Provider Error</title>
    </head>
    <body>
      <div>
        <h1>Open Id Connect Provider Error</h1>
        ${Object.entries(out).map(([key, value]) => `<pre><strong>${key}</strong>: ${value}</pre>`).join("")}
        <pre><strong>stack</strong>: ${error.stack}</pre>
      </div>
    </body>
    </html>`;
  },

  scopes: ["offline_access", "openid", "profile"],

  clientAuthMethods: ["none"],

  async findAccount(ctx: KoaContextWithOIDC, id: string, token?: any) {
    // ajm: token: AuthorizationCode | AccessToken | DeviceCode | BackchannelAuthenticationRequest
    _logger.LogDebug(`Configuration.findAccount(ctx: ${JSON.stringify(ctx)}, id: ${id}, token: ${JSON.stringify(token, null, 2)})`);
    const user: User[]=_users.filter(u => u.username === id); 
    if (user.length!==0) {
      return {
        accountId: id,
        async claims(use: string, scope: string, claims: { [key: string]: null | ClaimsParameterMember }): Promise<AccountClaims> {
          _logger.LogDebug(`Configuration.findAccount() claims(use: ${use}, scope: ${scope}, claims: ${JSON.stringify(claims)})`);
          const auth_time: number = new Date().getTime();
          // ajm: identity token
          const obj: any = {
            sub: id,
            profile: {
              email: user[0].email,
              name: `${user[0].firstname} ${user[0].lastname}`,
              phone: user[0].phone,
              role: "Administrator",
              scopes: user[0].scopes
            }
          };
          _logger.LogDebug(`Configuration.findAccount() => ${JSON.stringify(obj)}`);
          return obj;
        }
      }
    };
  },
};

let _users: User[] = new Array<User>();

// ajm: -------------------------------------------------------------------------------------------
const GetUsers = async (): Promise<void> => {
  try {
    _logger.LogDebug("GetUsers()");
    const data: any = await _mongodb.Select("application", { _id: "sunstealer-identity" });
    if (data) {
      _users=data[0]?.data?.users || [{"email":"adammauger@mail.com","firstname":"Adam","lastname":"Mauger","password":"password","phone":"123-123-1234","scopes":"sunstealer.write","username":"Adam"}];
    }
    _logger.LogDebug(`GetUsers(): ${JSON.stringify(_users)}`);
  } catch (e) {
    _logger.LogException(e);
  }
}

// ajm: -------------------------------------------------------------------------------------------
(async () => {
  try {
    await _mongodb.Connect("mongodb://User:Password@ajmfco42-04.ajm.net:32017/mongodb/?authSource=admin", "configuration");
    await GetUsers();

    await MongoAdapter.connect(_configuration.configuration.mongodb);

    const uri: string = `${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}${_configuration.configuration.ingress}`;
    _logger.LogDebug(`Provider.Provider(${uri}, ${JSON.stringify(configuration)})`);
    const oidcp: OIDCProvider = new OIDCProvider(uri, configuration);
    const app: express.Application = express();
    const port: any = parseInt(process.env["PORT"] || "8080");

    app.engine("ejs", require("ejs").__express);

    app.set("views", path.join(__dirname + "/views"));
    app.set("view engine", "ejs")

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use(express.static(__dirname));
    app.use(expressejslayouts);

    // ajm: -----------------------------------------------------------------------------------------
    app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
      _logger.LogDebug(`----------------------------------------------------------------------------------------------------`);
      _logger.LogDebug(`app.use(*, ${request.url})`);
      next();
    });

    // ajm: -----------------------------------------------------------------------------------------
    app.get("/", (request: express.Request, response: express.Response) => {
      _logger.LogDebug(`app.get(/)`);
      response.sendFile(path.join(__dirname, "./index.html"));
    });

    // ajm: -----------------------------------------------------------------------------------------
    app.get("/authorization", (request: express.Request, response: express.Response) => {
      _logger.LogDebug(`app.get(/authorization)`);
      response.sendFile(path.join(__dirname, "./index.html"));
    });

    // ajm: -----------------------------------------------------------------------------------------
    app.get("/configuration", (request: express.Request, response: express.Response) => {
      try {
        _logger.LogDebug(`app.get(/configuration)`);
        response.send(JSON.stringify(_configuration.configuration));
      } catch (e) {
        _logger.LogException(e);
      }
    });

    // ajm: -----------------------------------------------------------------------------------------
    app.get("/healthz", (request: express.Request, response: express.Response) => {
      _logger.LogDebug(`app.get(/healthz)`);
      response.send(`{"healthz": "OK"}`);
    });

    // ajm: -----------------------------------------------------------------------------------------
    app.get("/home", (request: express.Request, response: express.Response) => {
      _logger.LogDebug(`app.get(/home)`);
      response.sendFile(path.join(__dirname, "./index.html"));
    });
    
    // ajm: -----------------------------------------------------------------------------------------
    app.post("/configuration", (request: express.Request, response: express.Response) => {
      try {
        _logger.LogDebug(`app.post(/configuration ${JSON.stringify(request.body)})`);
        _configuration.configuration = request.body;
        _configuration.Save();
        response.sendStatus(200);
      } catch (e) {
        _logger.LogException(e);
        response.sendStatus(500);
      }
    });

    // ajm: -----------------------------------------------------------------------------------------
    app.use("/oidc", (request: express.Request, response: express.Response) => {
      console.info(`app.use(/oidc, ${request.path})`);
      response.send("");
    });
    
    // ajm: -----------------------------------------------------------------------------------------
    app.use("/sync", async (request: express.Request, response: express.Response) => {
      try {
        await GetUsers();
        response.sendStatus(200);
      } catch (e) {
        _logger.LogException(e);
        response.sendStatus(500);
      }
    });

    // ajm: oidc

    // ajm: -----------------------------------------------------------------------------------------
    app.get("/interaction/:uid", async (request: express.Request, response: express.Response, next: express.NextFunction) => {
      try {
        _logger.LogDebug(`app.get("${request.path}", ...)`);

        const details: any = await oidcp.interactionDetails(request, response);
        _logger.LogDebug(`app.get("${request.path}", details: ${JSON.stringify(details)})`);

        const client = await oidcp.Client.find((details.params as any).client_id);
        _logger.LogDebug(`app.get("${request.path}", client: ${JSON.stringify(client)})`);

        switch (details.prompt.name) {
          case "login": {
            return response.render("login", {
              client,
              uid: details.uid,
              details: details.prompt.details,
              params: details.params,
              title: "Sign-in",
              session: details.session ? JSON.stringify(details.session) : undefined,
              dbg: {
                params: JSON.stringify(details.params),
                prompt: JSON.stringify(details.prompt),
              },
            });
          }
          case "consent": {
            return response.render("interaction", {
              client,
              uid: details.uid,
              details: details.prompt.details,
              params: details.params,
              title: "Authorize",
              session: details.session ? JSON.stringify(details.session) : undefined,
              dbg: {
                params: JSON.stringify(details.params),
                prompt: JSON.stringify(details.prompt),
              },
            });
          }
          default:
            _logger.LogError(`Unhandled`);
            return undefined;
        }
      } catch (e) {
        _logger.LogException(e);
        return next(e); // => error 
      }
    });

    // ajm: ---------------------------------------------------------------------------------------
    app.post("/interaction/:uid/login", async (request: express.Request, response: express.Response, next: express.NextFunction) => {
      try {
        _logger.LogDebug(`app.post("${request.path}", ...)`);

        const details: any = await oidcp.interactionDetails(request, response);
        _logger.LogDebug(`app.post("${request.path}", details: ${JSON.stringify(details)})`);

        _logger.LogDebug(`app.post("${request.path}", login: ${request.body.login} password: ${request.body.password})`);

        const users: User[]=_users.filter(u => u.username === request.body.login); 
        if (_users.length===0) {
          _users.push({ email: "adam.mauger@mail.xom", firstname: "Adam", lastname: "Mauger", password: "password", phone: "123-123-1234", scopes: "sunstealer.write", username: "Adam"});
          users.push(_users[0]);
        }

        if (users.length!==0&&request.body.password===users[0].password) {
          return await oidcp.interactionFinished(request, response, { login: { accountId: request.body.login } }, { mergeWithLastSubmission: false });         
        }

        throw new Error("Invalid credentials.");
      } catch (e) {
        _logger.LogException(e);
        return next(e); // => error 
      }
    });

    // ajm: ---------------------------------------------------------------------------------------
    app.post("/interaction/:uid/confirm", async (request: express.Request, response: express.Response, next: express.NextFunction) => {
      try {
        _logger.LogDebug(`app.post("${request.path}", ...)`);

        const details: any = await oidcp.interactionDetails(request, response);
        _logger.LogDebug(`app.post("${request.path}", details: ${JSON.stringify(details)})`);

        let grant: any = undefined;
        if (details.grantId) {
          // update session grant
          grant = await oidcp.Grant.find(details.grantId);
        } else {
          // new session grant
          grant = new oidcp.Grant({ accountId: details.session?.accountId, clientId: (details.params as any).client_id });
        }

        if (details.prompt.details.missingOIDCScope) {
          grant?.addOIDCScope((details.prompt.details.missingOIDCScope as string[]).join(" "));
        }

        if (details.prompt.details.missingOIDCClaims) {
          grant?.addOIDCClaims(details.prompt.details.missingOIDCClaims as string[]);
        }

        if (details.prompt.details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(details.prompt.details.missingResourceScopes)) {
            grant?.addResourceScope(indicator, (scopes as string[]).join(" "));
          }
        }

        const grantId: any = await grant?.save();
        const consent: any = {};
        if (!details.grantId) {
          consent.grantId = grantId;
        }

        await oidcp.interactionFinished(request, response, { consent }, { mergeWithLastSubmission: true });
      } catch (e) {
        _logger.LogException(e);
        return next(e); // => error 
      }
    });

    // ajm: ---------------------------------------------------------------------------------------
    app.get("/interaction/:uid/abort", async (request: express.Request, response: express.Response, next: express.NextFunction) => {
      try {
        const result = {
          error: "access_denied",
          error_description: "End-User aborted interaction",
        };
        await oidcp.interactionFinished(request, response, result, { mergeWithLastSubmission: false });
      } catch (e) {
        _logger.LogException(e);
        next(e);
      }
    });    

    // ajm: ---------------------------------------------------------------------------------------
    app.use(oidcp.callback());

    // ajm: -----------------------------------------------------------------------------------------
    app.get(/.*/, (request: express.Request, response: express.Response) => {
      _logger.LogDebug(`app.use(*)`);
      response.sendFile(path.join(__dirname, "./index.html"));
    });

    // ajm: ---------------------------------------------------------------------------------------
    app.use((e: Error, request: express.Request, response: express.Response, next: express.NextFunction) => {
      try {
        if (e instanceof OIDCErrors.SessionNotFound) {
          // handle interaction expired / session not found error
        }

        _logger.LogException(e);
        const r: string = `<pre>${e.stack}</pre>`;
        response.send(r);
        next(e);
      } catch (e) {
        _logger.LogException(e);
        next(e);
      }
    });

    // ajm: ---------------------------------------------------------------------------------------
    // ajm: ---------------------------------------------------------------------------------------
    https.createServer({
      key: fs.readFileSync(path.join(__dirname, "./certificate/tls.key")),
      cert: fs.readFileSync(path.join(__dirname, "./certificate/tls.crt"))
    }, app).listen(_configuration.configuration.port, () => {
      _logger.LogInformation(`${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}${_configuration.configuration.ingress}`);
      _logger.LogInformation(`${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}${_configuration.configuration.ingress}/.well-known/openid-configuration`);
    });
  } catch (e) {
    _logger.LogException(e);
  }
})().catch((e) => {
  _logger.LogException(e);
});
