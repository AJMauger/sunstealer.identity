import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { _configuration, _identity, _logger } from "../index";
import { eOIDCFLOW } from "../services/identity";
import { Notification } from "./notification";

interface IProps {
}

export const GlobalHeader: React.FC<IProps> = (props: IProps) => {
  const dialogAbout = React.useRef<HTMLDialogElement>(null);
  const OpenAbout = () => {
    SetMenu(false);
    dialogAbout.current?.showModal();
  }

  const dialogConfiguration = React.useRef<HTMLDialogElement>(null);
  const textareaConfiguration = React.useRef<HTMLTextAreaElement>(null);
  const OpenConfiguration = () => {
    if (textareaConfiguration.current) {
      textareaConfiguration.current.value = JSON.stringify(_configuration.configuration, null, 2);
    }
    SetMenu(false);
    dialogConfiguration.current?.showModal();
  }
  const UpdateConfiguration = async () => {
    try {
      dialogConfiguration.current?.close();
      if (textareaConfiguration.current?.value) {
        _configuration.configuration = JSON.parse(textareaConfiguration.current?.value);
        await _configuration.Save();
      }
    } catch(e) {
      _logger.LogException(e as Error);
    }
  }

  const dialogIdentity = React.useRef<HTMLDialogElement>(null);

  const dialogLog = React.useRef<HTMLDialogElement>(null);;
  const tbodyLog = React.useRef<any>(null);;
  const OpenLog = () => {
    SetMenu(false);
    dialogLog.current?.showModal();
  }

  const dialogMenu = React.useRef<HTMLDialogElement>(null);
  const [identity, SetIdentity] = React.useState<boolean>(false);
  const [menu, SetMenu] = React.useState<boolean>(false);

  const dialogNotifications = React.useRef<HTMLDialogElement>(null);;
  const AcknowledgeAll = () => {
    _logger.notifications = [];
    dialogNotifications.current?.close();
  }

  const [user, SetUser] = React.useState<string>(_identity.userInfo?.name);

  const navigate = useNavigate();

  const Debug = () => {
    _logger.LogDebug("Logger.ctor() - debug test");
    _logger.LogInformation("LogService.ctor() - information test", "Information");
    _logger.LogWarning("LogService.ctor() - warning test");
    _logger.LogError("LogService.ctor() - error test");
    // ajm: _logger.LogException(new Error("LogService.ctor() - exception test"));
  }

  const Log = () => {
    const items: any[] = Array<any>();
    let i: number = 0;
    for (const e of _logger.events) {
      let c = "lightgray"
      let s = "un";
      switch (e.severity) {
        case 0: {
          s = "Db";
          break;
        }
        case 1:
          c = "var(--green)";
          s = "In";
          break;
        case 2:
          c = "var(--yellow)";
          s = "Wn";
          break;
        case 3:
          c = "red";
          s = "Er";
          break;
        case 4:
          s = "Ex";
          c = "red";
          break;
      }
      items.push(<tr key={`e${i}`}><td style={{ verticalAlign: "top", minWidth: 170 }}>{e.date} - {e.time}</td><td style={{ color: `${c}`, verticalAlign: "top", minWidth: 70 }}>[{s}]</td><td style={{ verticalAlign: "top" }}>{e.message}</td></tr>);
      i++;
    }
    return items;
  }

  const Notifications = () => {
    const items: any[] = Array<any>();
    let i: number = 0;
    for (const e of _logger.notifications) {
      items.push(<Notification key={`n${i}`} event={e} />);
      i++;
    }
    return items;
  }

  return (
    <div className="main-toolbar">
      <div style={{ alignItems: "center", display: "flex", flexDirection: "row", height: "100%", justifyContent: "center", paddingLeft: 20 }}>
        <div className="icon-menu main-toolbar-icon" onClick={() => SetMenu(true)} />
        <div style={{ color: "var(--yellow)", padding: 10 }}>SUNSTEALER (OpenID Connect Relying Party)</div>
      </div>

      <div style={{ alignItems: "center", display: "flex", flexDirection: "row", height: "100%", justifyContent: "center", paddingRight: 5 }}>
        <div className="icon-notifications-none main-toolbar-icon" style={{ paddingRight: 20 }} onClick={() => dialogNotifications.current?.showModal()} />
        <div style={{ paddingRight: 5 }}>{_identity.userInfo?.name}</div>
        <div className="icon-identity main-toolbar-icon" style={{ paddingRight: 20 }} onClick={() => SetIdentity(true)} />
      </div>

      <dialog ref={dialogMenu} style={{ borderRadius: 0, height: 300, left: "calc(-100% + 255px)", padding: 10, top: 15, width: 215 }} open={menu} onClick={() => SetMenu(false)}>
        <div style={{ alignItems: "center", display: "flex", flexDirection: "row", height: 24, justifyContent: "space-between" }}>
          <div>Menu</div>
          <div className="icon-close dialog-toolbar-icon" style={{ height: 18, right: 10, width: 18 }} onClick={() => dialogMenu.current?.close()}></div>
        </div>
        <hr />
        <Link className="menu-option" to={`/`}>Home</Link>
        <Link className="menu-option" to={`/authorization`}>Authorization</Link>
        <Link className="menu-option" to={`/users`}>Users</Link>
        <hr />
        <div className="menu-option" onClick={() => OpenAbout()}>About</div>
        <div className="menu-option" onClick={() => OpenConfiguration()}>Configuration</div>
        <div className="menu-option" onClick={() => OpenLog()}>Logger</div>
        <hr />
        <div className="menu-option" onClick={() => Debug()}>Debug</div>
      </dialog>

      <dialog ref={dialogAbout} style={{ height: 200, width: 320 }}>
        <div className="dialog-toolbar">
          <div>About</div>
          <div className="icon-close dialog-toolbar-icon" style={{ right: -5 }} onClick={() => dialogAbout.current?.close()}></div>
        </div>
        <div style={{ alignItems: "center", display: "flex", height: "calc(100% - 50px)", justifyContent: "center", width: "100%" }}>
          <table style={{ width: "90%" }}>
            <tbody>
              <tr><td style={{ width: 140 }}>Sunstealer Explorer</td><td>1.19.0</td></tr>
              <tr><td>React</td><td>{React.version}</td></tr>
              <tr><td></td><td>Adam Mauger</td></tr>
            </tbody>
          </table>
        </div>
      </dialog>

      <dialog ref={dialogConfiguration} style={{ height: "75%", width: "85%" }}>
        <div className="dialog-toolbar" >
          <div>Configuration</div>
          <div className="icon-close dialog-toolbar-icon" style={{ right: -5 }} onClick={() => dialogConfiguration.current?.close()}></div>
        </div>
        <textarea ref={textareaConfiguration} style={{ backgroundColor: "var(--color-background-modal)", border: "none", color: "whitesmoke", height: "calc(100% - 120px)", outline: "none", width: "100%" }} defaultValue={JSON.stringify(_configuration.configuration, null, 2)}></textarea>
        <div style={{ alignItems: "top", display: "flex", height: 70, justifyContent: "flex-end", paddingRight: 10 }}>
          <button onClick={() => UpdateConfiguration()}>Update</button>
        </div>
      </dialog>

      <dialog ref={dialogIdentity} style={{ height: 200, left: "calc(100% - 400px)", top: 70, width: 300 }} open={identity} onClick={() => SetIdentity(false)}>
        <div className="dialog-toolbar">
          <div>Sunstealer Identity</div>
          <div className="icon-close dialog-toolbar-icon" style={{ right: -5 }} onClick={() => dialogIdentity.current?.close()}></div>
        </div>

        <div style={{ alignItems: "center", display: "flex", flexDirection: "column", height: "calc(100% - 70px)", justifyContent: "center", overflowY: "auto", width: "100%" }}>
          <div style={{ alignItems: "center", display: "flex", flexDirection: "row", height: 32, paddingLeft: 10, width: "calc(100% - 15px)" }}>
            <div style={{ color: "gray", width: "50%" }}>User</div><div style={{ width: "50%" }}>{_identity.accessToken?.length === 43 ? _identity.userInfo?.profile?.name : _identity.userInfo?.payload?.profile?.name}</div>
          </div>
          <div style={{ alignItems: "center", display: "flex", flexDirection: "row", height: 32, paddingLeft: 10, width: "calc(100% - 15px)" }}>
            <div style={{ color: "gray", width: "50%" }}>Role</div><div style={{ width: "50%" }}>{_identity.accessToken?.length === 43 ? _identity.userInfo?.profile?.role : _identity.userInfo?.payload?.profile?.role}</div>
          </div>
          <hr style={{ border: "none", backgroundColor: "gray", height: 1, marginBottom: 10, marginTop: 10, width: "100%" }} />
          <div className="menu-option" style={{ display: _identity.state === eOIDCFLOW.eSIGNEDIN ? "none" : "" }} onClick={() => {
            dialogIdentity.current?.close();
            _identity.state=eOIDCFLOW.eSIGNINGIN;
            // ajm: _identity.AuthorizationCodeFlowPKCE();
            navigate("/");
          }}>Sign in</div>
          <div className="menu-option" style={{ display: _identity.state === eOIDCFLOW.eSIGNEDOUT ? "none" : "" }} onClick={async () => {
            dialogIdentity.current?.close();
            await _identity.SignOut();
            navigate("/");
            navigate(0);
          }}>Sign out</div>
        </div>
      </dialog>

      <dialog ref={dialogLog} style={{ height: "75%", width: "85%" }}>
        <div className="dialog-toolbar">
          <div>Log</div>
          <div className="icon-close dialog-toolbar-icon" style={{ right: -5 }} onClick={() => dialogLog.current?.close()}></div>
        </div>
        <table style={{ display: "block", height: "calc(100% - 80px)", userSelect: "text", width: "100%" }}>
          <thead style={{ alignItems: "center", display: "flex", fontSize: 14, height: 32 }}>
            <tr><td style={{ minWidth: 170 }}>Time</td><td style={{ minWidth: 70 }}>Severity</td><td style={{ width: 870 }}>Message</td></tr>
          </thead>
          <tbody ref={tbodyLog} style={{ display: "block", height: "calc(100% - 32px)", overflowY: "auto" }}>{Log()}</tbody>
        </table>
      </dialog>

      <dialog ref={dialogNotifications} style={{ height: "calc(100% - 100px)", left: "calc(100% - 700px)", top: 10, width: 600 }}>
        <div className="dialog-toolbar">
          <button style={{ position: "absolute", left: 10, width: 150 }} onClick={() => AcknowledgeAll()}>Acknowledge</button>
          <div>Notifications</div>
          <div className="icon-close dialog-toolbar-icon" style={{ right: -5 }} onClick={() => dialogNotifications.current?.close()}></div>
        </div>
        <div style={{ height: "calc(100% - 80px)", overflowY: "auto", width: "100%" }}>{Notifications()}</div>
      </dialog>

      <dialog style={{ height: 240, width: 400 }}>
        <div className="dialog-toolbar">
          <div>String</div>
          <div className="icon-close dialog-toolbar-icon" style={{ right: -5 }} onClick={() => { }}></div>
        </div>
        <div style={{ alignItems: "flex-start", display: "flex", flexDirection: "column", height: 110, justifyContent: "center", marginLeft: "5%", width: "90%" }}>
          <p>Please enter a string</p>
          <input style={{ width: "90%" }}></input>
        </div>
        <div style={{ alignItems: "center", display: "flex", height: 70, justifyContent: "center" }}>
          <button className="button-secondary" style={{ marginRight: 20 }} onClick={() => { }}>Cancel</button>
          <button onClick={() => { }}>Ok</button>
        </div>
      </dialog>
    </div>
  );
}
