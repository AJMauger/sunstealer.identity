import bodyParser from 'koa-bodyparser';
import cors from "@koa/cors";
import * as koaEjs from '@koa/ejs';
import mount from 'koa-mount';
import Router from "@koa/router";
import send from "koa-send";
import serve from "koa-static";
import http from "http";
// import https from "https";
import Koa from "koa";
import OIDCProvider, { errors as OIDCErrors, type AccountClaims, type CanBePromise, type ClaimsParameterMember, type Configuration as OIDCConfiguration, type KoaContextWithOIDC, type ErrorOut as OIDCErrorOut, type ResourceServer } from "oidc-provider";
import path from "path";
import { Configuration } from "./services/configuration";
import { Logger } from "./services/logger";
import { MongoAdapter } from "./adapter.mongodb";
// ajm: TOimport { User } from "../client/services/configuration";
import { MongoDB } from "./services/mongodb";

export const _logger = new Logger("logs");
export const _configuration = new Configuration("configuration.json");
export const _mongodb = new MongoDB();

import jwks from "./jwks.json";

class User {
  public username!: string;
  public firstname!: string;
  public lastname!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public scopes!: string;
}

// ajm: set DEBUG=oidc-provider:*

// ajm: -------------------------------------------------------------------------------------------
const configuration: OIDCConfiguration = {
  adapter: MongoAdapter,

  claims: {
    profile: ["profile"]
  },

  clients: _configuration.configuration.clients,

  cookies: { 
    keys: ["cookie_key"], 
    long: { signed: true, secure: false, sameSite: 'lax' },
    short: { signed: true, secure: false, sameSite: 'lax' }
  },

  clientBasedCORS: (_ctx: KoaContextWithOIDC, _origin: string, _client: any) => { return true; },

  features: {
    backchannelLogout: { enabled: true },

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
      defaultResource: (_ctx: KoaContextWithOIDC): CanBePromise<string | string[]> => {
        _logger.LogDebug(`defaultResource: ${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}/oidc`);
        return `${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}`;
      },
      enabled: true,
      getResourceServerInfo: (_ctx: KoaContextWithOIDC, resourceIndicator: string, client: any): CanBePromise<ResourceServer> => {
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
      useGrantedResource: (_ctx: KoaContextWithOIDC, model: any): any => {
        // ajm: model: AuthorizationCode | RefreshToken | DeviceCode | BackchannelAuthenticationRequest
        _logger.LogDebug(`useGrantedResource: model: ${JSON.stringify(model)}`);
        return true;
      }
    }

    // ajm: revocation: { enabled: true },
  },

  issueRefreshToken: (_ctx: KoaContextWithOIDC, client: any, code: any) => {
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
          // ajm: const auth_time: number = new Date().getTime();
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
    const data: any = await _mongodb.Select("configuration", { _id: "sunstealer-identity" });
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
    await _mongodb.Connect("mongodb://adam:password@localhost:27017/?authSource=admin", "platform");
    await GetUsers();

    await MongoAdapter.connect(_configuration.configuration.mongodb);

    const uri: string = `${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}${_configuration.configuration.ingress}`;
    _logger.LogDebug(`Provider.Provider(${uri}, ${JSON.stringify(configuration)})`);
    const oidcp: OIDCProvider = new OIDCProvider(uri, configuration);
    const app = new Koa();
    app.keys = ["cookie_key"];
    const router = new Router();

    app.use(cors());
    app.use(bodyParser({ enableTypes: ['json', 'form'] })); 
    app.use(serve(import.meta.dirname)); 
    app.use(mount('/', oidcp));

    app.use(async (ctx: Koa.Context, next: Koa.Next) => {
      try {
        // ajm: downstream middleware => oidc-provider actions
        await next(); 
      } catch (e: any) {
        if (e instanceof OIDCErrors.SessionNotFound) {
          _logger.LogWarning('OIDC Session not found or expired.');
        }

        _logger.LogException(e);
        
        ctx.status = e.status || 500;
        ctx.type = "html";
        ctx.body = `<pre>${e.stack}</pre>`;
      }
    });

    const render = (koaEjs.default || koaEjs) as unknown as Function;
    render(app, {
      root: path.join(import.meta.dirname, "views"),
      layout: "layout",
      viewExt: "ejs",
      cache: false,
      debug: false
    });

    // ajm: -----------------------------------------------------------------------------------------
    router.get("/", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      _logger.LogDebug(`app.get(/) ${ctx.req.url}`);
      await send(ctx, "./index.html", { 
        root: import.meta.dirname,
        immutable: true,
        maxAge: 3600000
      });
    });

    // ajm: -----------------------------------------------------------------------------------------
    router.get("/authorization", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      _logger.LogDebug(`app.get(/authorization) ${ctx.req.url}`);
      await send(ctx, "./index.html", { 
        root: import.meta.dirname,
        immutable: true,
        maxAge: 3600000
      });
    });

    // ajm: -----------------------------------------------------------------------------------------
    router.get("/configuration", (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      try {
        _logger.LogDebug(`app.get(/configuration) ${ctx.req.url}`);
        ctx.body = _configuration.configuration; 
      } catch (e) {
        _logger.LogException(e);
      }
    });

    // ajm: -----------------------------------------------------------------------------------------
    router.get("/healthz", (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      _logger.LogDebug(`app.get(/healthz) ${ctx.req.url}`);
      ctx.body = {"healthz": "OK"};
    });

    // ajm: -----------------------------------------------------------------------------------------
    router.get("/home", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      _logger.LogDebug(`app.get(/home) ${ctx.req.url}`);
      await send(ctx, "./index.html", { 
        root: import.meta.dirname,
        immutable: true,
        maxAge: 3600000
      });
    });
    
    // ajm: -----------------------------------------------------------------------------------------
    router.get("/sync", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      try {
        _logger.LogDebug(`app.get(/sync) ${ctx.req.url}`);
        await GetUsers();
        ctx.status = 200;
      } catch (e) {
        _logger.LogException(e);
        ctx.status = 500;
      }
    });

    // ajm: oidc

    // ajm: -----------------------------------------------------------------------------------------
    router.get("/interaction/:uid", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      try {
        _logger.LogDebug(`router.get("${ctx.path}", ...)`);

        const details: any = await oidcp.interactionDetails(ctx.req, ctx.res);
        _logger.LogDebug(`router.get("${ctx.path}", details: ${JSON.stringify(details)})`);

        const client = await oidcp.Client.find((details.params as any).client_id);
        _logger.LogDebug(`router.get("${ctx.path}", client: ${JSON.stringify(client)})`);

        switch (details.prompt.name) {
          case "login": {
            return ctx.render("login", {
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
            return ctx.render("interaction", {
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
      }
    });

    // ajm: -----------------------------------------------------------------------------------------
    router.post("/configuration", (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      try {
        const body: any = ctx.request.body;
        _logger.LogDebug(`post(/configuration ${ctx.req.url} ${JSON.stringify(body, null, 2)})`);
        _configuration.configuration = body;
        _configuration.Save();
        ctx.status = 200;
      } catch (e) {
        _logger.LogException(e);
        ctx.status = 500;
      }
    });
    
    // ajm: ---------------------------------------------------------------------------------------
    router.post("/interaction/:uid/login", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      try {
        _logger.LogDebug(`router.post("${ctx.path}", ...)`);

        const details: any = await oidcp.interactionDetails(ctx.req, ctx.res);
        _logger.LogDebug(`router.post("${ctx.path}", details: ${JSON.stringify(details)})`);

        const body: any = ctx.request.body;

        _logger.LogDebug(`router.post("${ctx.path}", login: ${body.login} password: ${body.password})`);

        const users: User[]=_users.filter(u => u.username === body.login); 
        if (_users.length===0) {
          _users.push({ email: "adam.mauger@mail.xom", firstname: "Adam", lastname: "Mauger", password: "password", phone: "123-123-1234", scopes: "sunstealer.write", username: "Adam"});
          users.push(_users[0]);
        }

        if (users.length!==0&&body.password===users[0].password) {
          return await oidcp.interactionFinished(ctx.req, ctx.res, { login: { accountId: body.login } }, { mergeWithLastSubmission: false });         
        }

        throw new Error("Invalid credentials.");
      } catch (e) {
        _logger.LogException(e);
      }
    });

    // ajm: ---------------------------------------------------------------------------------------
    router.post("/interaction/:uid/confirm", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      try {
        _logger.LogDebug(`router.post("${ctx.path}", ...)`);

        const details: any = await oidcp.interactionDetails(ctx.req, ctx.res);
        _logger.LogDebug(`router.post("${ctx.path}", details: ${JSON.stringify(details)})`);

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

        await oidcp.interactionFinished(ctx.req, ctx.res, { consent }, { mergeWithLastSubmission: true });
      } catch (e) {
        _logger.LogException(e);
      }
    });

    // ajm: ---------------------------------------------------------------------------------------
    router.get("/interaction/:uid/abort", async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      try {
        const result = {
          error: "access_denied",
          error_description: "End-User aborted interaction",
        };
        await oidcp.interactionFinished(ctx.req, ctx.res, result, { mergeWithLastSubmission: false });
      } catch (e) {
        _logger.LogException(e);
      }
    });    

    // ajm: -----------------------------------------------------------------------------------------
    router.get(/.*/, async (ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>, _next: Koa.Next) => {
      _logger.LogDebug(`app.get(*) ${ctx.req.url}`);
      await send(ctx, "./index.html", { 
        root: import.meta.dirname,
        immutable: true,
        maxAge: 3600000
      });
    });

    // ajm: -----------------------------------------------------------------------------------------
    app.use(router.routes()).use(router.allowedMethods());

    // ajm: -----------------------------------------------------------------------------------------
    http.createServer({
        // key: fs.readFileSync(path.join(import.meta.dirname, "./certificate/tls.key")),
        // cert: fs.readFileSync(path.join(import.meta.dirname, "./certificate/tls.crt"))
      },  app.callback())
      .listen(_configuration.configuration.port, () => {
        _logger.LogInformation(`${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}${_configuration.configuration.ingress}`);
        _logger.LogInformation(`${_configuration.configuration.protocol}://${_configuration.configuration.host}:${_configuration.configuration.port}${_configuration.configuration.ingress}/.well-known/openid-configuration`);
      }
    );
  } catch (e) {
    _logger.LogException(e);
  }
})().catch((e) => {
  _logger.LogException(e);
});
