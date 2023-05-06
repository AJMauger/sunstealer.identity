import { _logger } from "../index"

export enum eSEVERITY {
  eDEBUG = 0,
  eINFORMATION = 1,
  eWARNING = 2,
  eERROR = 3,
  eEXCEPTION = 4,
}

export class Event {
  public datetime: Date = new Date();
  public date: string = "";
  public time: string = "";

  public constructor(public severity: number, public message: string, public notification: string = "") {
    const D: string = String(this.datetime.getDate()).padStart(2, "0");
    const M: string = String(this.datetime.getMonth() + 1).padStart(2, "0");
    this.date = `${D}-${M}-${this.datetime.getFullYear()}`;

    const h: string = String(this.datetime.getHours()).padStart(2, "0");
    const m: string = String(this.datetime.getMinutes()).padStart(2, "0");
    const s: string = String(this.datetime.getSeconds()).padStart(2, "0");
    this.time = `${h}:${m}:${s}`;

  }

  // ajm: -----------------------------------------------------------------------------------------
  public ToString(): string {
    return `${this.date}T${this.time} ${_logger.severity[this.severity]} ${this.message}`;
  }
}