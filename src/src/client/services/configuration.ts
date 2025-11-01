import axios, { AxiosResponse } from "axios";
import { _configuration, _identity, _logger } from "../index";

export class User {
  public username!: string;
  public firstname!: string;
  public lastname!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public scopes!: string;
}

export class Configuration {
  // ajm: cloud
  public configuration: any = {
    configuration: {
      uri: "https://ajmfco42-01.ajm.net:31001/sunstealer-platform/configuration"
    },
    identity: {
      client_id: "Adam",
      interval_ms: 3 * 60 * 1000,
      uri: "https://ajmfco42-01.ajm.net:31010",
      _uri: "http://ajmwin11-01.ajm.net:8080"
    },
    ingress: "/sunstealer-platform",
    // ingress: "/",
    log: {
      log_level: 0,
      log_memory_size: 200,
      uri: "https://ajmfco42-01.ajm.net:31001/sunstealer-platform/log"
    }
  };

  public record: { data: any, etag: string, id: string } | undefined = undefined;

  // ajm: -----------------------------------------------------------------------------------------
  public constructor() {
    _logger.LogDebug(`configuration: ${JSON.stringify(this.configuration)}`);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async Read(): Promise<boolean> {
    try {
      if (_identity?.accessToken) {
        const headers: any = {
          "Authorization": `Bearer ${_identity.accessToken}`
        };
        axios.get(`${this.configuration.configuration.uri}/application/sunstealer-identity`, { headers }).then(async (r: AxiosResponse) => {
          try {
            _logger.LogDebug(`Configuration: Read() ${JSON.stringify(r.data)}`);
            this.record = r.data[0];
            this.configuration = r.data[0].data;
          } catch (e: any) {
            console.error(e);
          }
        }).catch((e: any) => {
          console.error(e);
        });
      }
      return true;
    } catch(e) {
      _logger.LogException(e as Error);
    }
    return false;
  }

  // ajm: -----------------------------------------------------------------------------------------
  public async Save(): Promise<boolean> {
    try {
      if (_identity?.accessToken) {
        const headers: any = {
          "Authorization": `Bearer ${_identity.accessToken}`
        };
        if (this.record) {
          axios.put(this.configuration.configuration.uri, { collection: "application", id: "sunstealer-identity", data: _configuration.configuration, etag: this.record.etag }, { headers }).then(async (r: AxiosResponse) => {
            try {
              _logger.LogDebug(`axios.post(_configuration?.configuration.configuration.uri ${r.status} ${r.statusText} etag: ${r.data.etag}`);
              if (this.record) {
                this.record.etag = r.data.etag;
              }
            } catch (e: any) {
              console.error(e);
            }
          }).catch((e: any) => {
            console.error(e);
          }); 
        } else {
          axios.post(this.configuration.configuration.uri, { collection: "application", id: "sunstealer-identity", data: _configuration.configuration }, { headers }).then(async (r: AxiosResponse) => {
            try {
              _logger.LogDebug(`axios.post(_configuration?.configuration.configuration.uri ${r.status} ${r.statusText} etag: ${r.data.etag}`);
              if (this.record) {
                this.record.etag = r.data.etag;
              }
            } catch (e: any) {
              console.error(e);
            }
          }).catch((e: any) => {
            console.error(e);
          });
        }
      } else {
        _logger.LogError("Unauthorized.  Sign in.");
      }

      axios.get(`${this.configuration.identity.uri}/sync`).then(async (r: AxiosResponse) => {
        try {
          _logger.LogDebug(`Configuration: Save() sync.`);
        } catch (e: any) {
          console.error(e);
        }
      }).catch((e: any) => {
        console.error(e);
      });
      _logger.LogInformation("Users synchronized.", "Users synchronized.");
      return true;
    } catch(e) {
      _logger.LogException(e as Error);
    }
    return false;
  }
}
