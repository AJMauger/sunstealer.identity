import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { _configuration, _identity } from "../index";
import { Alert } from "./alert";
import { eSEVERITY, Event } from "./event";
import { Identity } from "./identity";

export class Logger {
  public severity = ["Db", "In", "Wn", "Er", "Ex"];
  public count: number = 0;
  public events: Event[] = new Array<Event>();
  public notifications: Event[] = new Array<Event>();

  // ajm: -----------------------------------------------------------------------------------------
  public constructor() {
  }

  // ajm: -----------------------------------------------------------------------------------------
  public GetDateStringFile(date: Date): string {
    const D: string = String(date.getDate()).padStart(2, "0");
    const M: string = String(date.getMonth() + 1).padStart(2, "0");
    const h: string = String(date.getHours()).padStart(2, "0");
    const m: string = String(date.getMinutes()).padStart(2, "0");
    const s: string = String(date.getSeconds()).padStart(2, "0");

    return `${date.getFullYear()}-${M}-${D}T${h}-${m}-${s}`;
  }

  // ajm: -----------------------------------------------------------------------------------------
  public LogDebug(event: string, notification?: string): void {
    this.Log(eSEVERITY.eDEBUG, event, notification);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public LogInformation(event: string, notification?: string): void {
    this.Log(eSEVERITY.eINFORMATION, event, notification);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public LogWarning(event: string, notification?: string): void {
    if (notification === undefined) {
      notification = "Warning";
    }
    this.Log(eSEVERITY.eWARNING, event, notification);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public LogError(event: string, notification?: string): void {
    if (notification === undefined) {
      notification = "Error";
    }
    this.Log(eSEVERITY.eERROR, event, notification);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public LogException(e: Error, notification?: string): void {
    if (notification === undefined) {
      notification = "Exception";
    }
    const event: string = `${e.message}; ${e.name}; ${e.stack}`;
    this.Log(eSEVERITY.eEXCEPTION, event, notification);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public LogAxiosError(e: AxiosError): void {
    const event: string = `Axios: ${e.config?.method} ${e.config?.url}; ${e.code} ${e.message} ${JSON.stringify(e.response?.data)}`;
    this.Log(eSEVERITY.eEXCEPTION, event, e.message);
  }

  // ajm: -----------------------------------------------------------------------------------------
  public Log(severity: eSEVERITY, message: string, notification?: string): void {
    try {
      const event: Event = new Event(severity, message, notification);

      if (notification) {
        if (this.notifications.length > 100) {
          this.notifications.shift();
        }
        this.notifications.push(event);
        new Alert(notification, severity);
      }

      if (severity >= _configuration?.configuration.log.log_level) {
        if (this.events.length > _configuration?.configuration.log.log_memory_size) {
          this.events.shift();
        }
        this.events.push(event);
      }

      if (_identity?.accessToken) {
        const headers: any = {
          "Authorization": `Bearer ${_identity.accessToken}`
        };
        axios.post(_configuration?.configuration.log.uri, event, { headers }).then(async (r: AxiosResponse) => {
          try {
            console.info(`axios.post(_configuration?.configuration.log.uri ${r.status} ${r.statusText}`);
          } catch (e: any) {
            console.error(e);
          }
        }).catch((e: any) => {
          console.error(e);
        });
      }

      console.log(event.ToString());
    } catch (e) {
      console.error(e);
    }
  }
}
