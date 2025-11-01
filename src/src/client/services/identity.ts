import axios, { AxiosResponse } from "axios";
import base64 from "base64-js";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import { _configuration, _logger } from "../index";

import jwktopem from "jwk-to-pem";

export enum eOIDCFLOW {
  eSIGNEDOUT = "0",
  eSIGNINGIN = "1",
  eSIGNEDIN = "2",
}

export class Identity {
  private interval: NodeJS.Timeout | undefined = undefined;

  public accessToken: string | null = null;   // ajm: window.localStorage.getItem("accessToken");
  public code: string | null = null;          // ajm: window.localStorage.getItem("code");
  public codeVerifier: string | null = null;  // ajm: window.localStorage.getItem("codeVerifier");
  public discovery: any;
  public headers: any = {};
  public identityToken: string | null = null; // window.localStorage.getItem("identityToken");
  public redirect: string = encodeURIComponent(`${document.location.origin}/oidc`);
  public refreshToken: string | null = null;  //  ajm: window.localStorage.getItem("refreshToken");
  public state: eOIDCFLOW = eOIDCFLOW.eSIGNEDOUT;
  public userInfo: any = JSON.parse(window.localStorage.getItem("userInfo") || "{}");

  public constructor() {
    _logger.LogDebug(`identity:code: ${this.code}`);
    _logger.LogDebug(`identity:code_verifier: ${this.codeVerifier}`);
    _logger.LogDebug(`identity:redirect: ${this.redirect}`);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public AuthorizationCodeFlowPKCE = async (): Promise<void> => {

    throw new Error("nope!");

    if (!this.code) {
      if (!this.codeVerifier) {
        // ajm: offline_access => refresh tokens
        // ajm: openid => subject
        // ajm: profile => name
        // ajm: create code challenge/verifier
        const uri: string = `${this.discovery?.authorization_endpoint}?client_id=sunstealer_explorer&code_challenge=${this.CodeChallenge()}&code_challenge_method=S256&redirect_uri=${this.redirect}&response_type=code&scope=offline_access openid profile`;
        _logger.LogDebug(`identity:code_verifier: ${this.codeVerifier}`);
        _logger.LogDebug(`identity: AuthorizationCodeFlowPKCE() code request: ${uri}`);
        window.location.assign(uri);
      } else if (!this.accessToken) {        
        const url: URL = new URL(window.location.href);
        this.code = url.searchParams.get("code");
        _logger.LogDebug(`identity: AuthorizationCodeFlowPKCE() code response: ${window.location.href} code={this.code}`);
        if (this.code) {
          await this.GetToken();  // ajm: exchange code for tokens
          this.state=eOIDCFLOW.eSIGNEDIN;
        } else {
          _logger.LogError(`identity: AuthorizationCodeFlowPKCE() code: ${this.code}`);
          // ajm: window.localStorage.removeItem(`codeVerifier`);
          this.state=eOIDCFLOW.eSIGNEDOUT;
          this.codeVerifier=null;
        }
      }
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public CodeChallenge = (): string => {
    const buf = crypto.randomBytes(96);
    this.codeVerifier = buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const hash = crypto.createHash('sha256').update(this.codeVerifier).digest();
    return hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  
  // ajm: -----------------------------------------------------------------------------------------
  public GetToken = async (): Promise<void> => {
    try {
      let data: string = "";
      if (this.refreshToken) {
        _logger.LogDebug("identity: GetToken() grant_type: refresh_token");
        data = `client_id=sunstealer_explorer&code_verifier=${this.codeVerifier}&grant_type=refresh_token&redirect_uri=${this.redirect}&refresh_token=${this.refreshToken}`;
      } else {
        _logger.LogDebug("identity: GetToken() grant_type: authorization_code");
        _logger.LogDebug(`identity: GetToken() code: ${this.code}`);
        _logger.LogDebug(`identity: GetToken()  code_verifier: ${this.codeVerifier}`);
        data = `client_id=sunstealer_explorer&client_secret=client_secret&code=${this.code}&code_verifier=${this.codeVerifier}&grant_type=authorization_code&redirect_uri=${this.redirect}`;
      }
      _logger.LogDebug(`identity: GetToken() uri: ${this.discovery?.token_endpoint} data: ${data}`);
      await axios.post(this.discovery?.token_endpoint, data).then(async (r: AxiosResponse) => {
        try {
          const reload: boolean = !this.accessToken; 
          _logger.LogInformation(`identity: GetToken() status: ${r.status} ${r.statusText} tokens: ${JSON.stringify(r.data)}`);
          this.accessToken = r.data.access_token;
          // window.localStorage.setItem(`accessToken`, this.accessToken || "");
          this.identityToken = r.data.id_token;
          // window.localStorage.setItem(`identityToken`, this.identityToken || "");
          this.refreshToken = r.data.refresh_token;
          // window.localStorage.setItem(`refreshToken`, this.refreshToken || "");
          this.headers = {
            "Authorization": `Bearer ${this.accessToken}`
          };

          this.userInfo = jsonwebtoken.decode(r.data.id_token || "", { complete: true });

          try {
            await axios.get(this.discovery.jwks_uri).then((r: AxiosResponse) => {
              /* ajm: try {
                // _logger.LogInformation(`identity: get jwks: ${r.status} ${r.statusText} data: ${JSON.stringify(r.data, null, 2)}`);
                const publicKey: string = jwktopem(r.data.keys[1]);
                _logger.LogInformation(`identity: public key: ${publicKey}`);
                const token: jsonwebtoken.JwtPayload | string= jsonwebtoken.verify(this.accessToken || "", publicKey, { complete: true, algorithms: ["RS256"] });
                if (token) {
                  _logger.LogInformation(`jsonwebtoken.verify(access token): ${JSON.stringify(token, null, 2)}`);
                } else {
                  _logger.LogError(`Invalid access token`);
                }    
              } catch(e) {
                _logger.LogException(e as any);
              }*/
            }).catch((e: any) => {
              _logger.LogAxiosError(e);
            });
          } catch(e) {
            _logger.LogException(e as any);
          }      
    
          if (this.accessToken?.length === 43) {
            if (reload) {
              _logger.LogDebug(`identity: GetToken() uri: ${this.discovery.userinfo_endpoint} data: ${data}`);
              await axios.get(this.discovery.userinfo_endpoint, { headers: this.headers }).then((r: AxiosResponse) => {
                try {
                  _logger.LogInformation(`identity: GetToken() status: ${r.status} ${r.statusText} userinfo: ${JSON.stringify(r.data)}`);
                  this.userInfo = r.data;
                } catch(e) {
                  _logger.LogException(e as any);
                }      
              }).catch((e: any) => {
                _logger.LogAxiosError(e);
              });
            }
          } else {
            this.userInfo = jsonwebtoken.decode(r.data.id_token || "", { complete: true });
          }
          if (reload) {
            await _configuration.Read();
          }
        } catch(e) {
          _logger.LogException(e as any);
        }
      }).catch((e: any) => {
        _logger.LogAxiosError(e);
      });
    } catch(e) {
      _logger.LogException(e as any);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public GetState = (): eOIDCFLOW => {
    const oidcFlow: eOIDCFLOW=window.localStorage.getItem("state") as eOIDCFLOW || eOIDCFLOW.eSIGNEDOUT;
    return oidcFlow;
  }

  // ajm: -----------------------------------------------------------------------------------------
  public SetState = (oidcFlow: eOIDCFLOW): void => {
    console.info(`Identity: SetState(${oidcFlow})`);
    window.localStorage.setItem("state", oidcFlow);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public SignOut = async (): Promise<void> => {
    _logger.LogInformation("identity: SignOut()");
    try {
      const data: any = `client_id=sunstealer_explorer&id_token_hint=${this.identityToken}`;
      _logger.LogDebug(`identity: SignOut() uri: ${this.discovery?.end_session_endpoint} data: ${JSON.stringify(data)}`);
      await axios.post(this.discovery?.end_session_endpoint, data).then(async (r: AxiosResponse) => {
        try {
          let i: number = r.data.indexOf(`action="`);
          if (i!==-1) {
            i+=8;
            let j: number=r.data.indexOf(`"`, i);
            if (j!==-1) {
              const action: string=r.data.substring(i, j);
              i=r.data.indexOf(`value="`);
              if (i!==-1) {
                i+=7;
                j=r.data.indexOf(`"`, i);
                const xsrf: string=r.data.substring(i, j);
                const form: string = `xsrf=${xsrf}&logout=yes`;
                _logger.LogDebug(`identity: SignOut() uri: ${action} data: ${form}`);
                await axios.post(action, form).then(async (r: AxiosResponse) => {
                  _logger.LogInformation("Sign out cpmplete.", "Sign out cpmplete.");
                }).catch((e: any) => {
                  _logger.LogAxiosError(e);
                });
              }
            } 
          }
        } catch(e) {
          _logger.LogException(e as any);
        }
      }).catch((e: any) => {
        _logger.LogAxiosError(e);
      });

      this.Stop();
      _configuration.configuration.users=null;
      window.localStorage.clear();
      this.accessToken = null;
      this.code = null;
      this.codeVerifier = null;
      this.identityToken = null;
      this.refreshToken = null;
      this.userInfo = null;
  } catch(e) {
      _logger.LogException(e as any);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public Start = async (): Promise<void> => {
    try {
      const uri: string = `${_configuration.configuration.identity.uri}/.well-known/openid-configuration`;
      _logger.LogDebug(`identity: start() uri: ${uri}`);
      await axios.get(uri).then((r: any) => {
        if (r.status === 200) {
          this.discovery = r.data;
          _logger.LogDebug(`identity: start() discovery: ${JSON.stringify(this.discovery)}`);
          if (!this.interval) {
            _logger.LogInformation(`identity: starting interval ${_configuration.configuration.identity.interval_ms}ms`);
            this.interval = setInterval(() => {
              if (this.accessToken) {
              /* ajm: await*/ this.GetToken();
              }
            }, _configuration.configuration.identity.interval_ms);
          }  
        } else {
          _logger.LogError(`identity: http ${r.status} uri: ${`${uri}`}`);
        }
      }).catch((e: any) => {
        _logger.LogAxiosError(e);
      });
    } catch(e) {
      _logger.LogException(e as any);
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  public Stop = (): void => {
    try {
      _logger.LogInformation("identity: Stop(), stopping interval");
      clearInterval(this.interval);
    } catch(e) {
      _logger.LogException(e as any);
    }
  }
}