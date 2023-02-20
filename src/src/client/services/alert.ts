const _alerts: HTMLElement[] = new Array<HTMLElement>();

export class Alert {
  constructor(message: string, severity: number) {
    let i: string = "";
    switch (severity) {
      case 0:
      case 1:
        i = "info";
        break;
      case 2:
        i = "warn";
        break;
      case 3:
      case 4:
        i = "error";
        break;
    }
    while (_alerts.length > 3) {
      document.body.removeChild(_alerts.shift() as HTMLElement);
    }
    const a: HTMLElement = document.createElement("div");
    _alerts.push(a);
    a.className = "alert";
    a.style.backgroundImage = `url("./images/${i}.png")`;
    a.style.top = `${55 * _alerts.length}px`;
    a.innerText = message;
    document.body.appendChild(a);
    if (_alerts.length === 1) {
      this.Left();
    }
  }

  // ajm: -----------------------------------------------------------------------------------------
  private Left() {
    setTimeout(() => {
      const n: HTMLElement = _alerts.shift() as HTMLElement;
      let right = 5;
      const interval: any = setInterval(() => {
        if (right < -405) {
          document.body.removeChild(n);
          clearInterval(interval);
        } else {
          right -= 20;
          n.style.right = `${right}px`;
        }
      }, 2);
      if (_alerts.length !== 0) {
        setTimeout(() => {
          let i: number = 1;
          for (let n of _alerts) {
            this.Up(n, i);
            i++;
          }
        }, 200);
      }
    }, 2000);
  }

  // ajm: -----------------------------------------------------------------------------------------
  private Up(n: HTMLElement, i: number) {
    let top_end: number = 55 * i;
    let top: number = 55 * i + 55;
    const interval: any = setInterval(() => {
      if (top === top_end) {
        clearInterval(interval);
      } else {
        top -= 5;
        n.style.top = `${top}px`;
      }
    }, 2);
    if (i === _alerts.length) {
      setTimeout(() => {
        this.Left();
      }, 200);
    }
  }
}
