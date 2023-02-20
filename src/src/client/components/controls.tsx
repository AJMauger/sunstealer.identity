import React from "react";
import { _logger } from "../index";
import "../App.css";
import "../css/table.css";

// ajm: -------------------------------------------------------------------------------------------
export interface IButtonProps { 
  disabled?: boolean;
  text: string;
  style?: any;
  OnClick: () => any;
}

export const Button: React.FC<IButtonProps> = (props: IButtonProps) => {
  return (
    <button style={{...props.style}} disabled={props.disabled} onClick={(e: React.MouseEvent<HTMLButtonElement>) => { props.OnClick() }}>{props.text}</button>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface IButtonIconProps {
  disabled?: boolean;
  icon: string;
  style?: any;
  text: string;
  OnClick: () => any;
}

export const ButtonIcon: React.FC<IButtonIconProps> = (props: IButtonIconProps) => {
  return (
    <button className={props.disabled ? "button-secondary" : "button"} style={{...props.style}} disabled={props.disabled} onClick={(e: React.MouseEvent<HTMLButtonElement>) => { props.OnClick() }}>
      <div className={props.icon} style={{ height: 20, marginRight: 10, width: 20 }} />{props.text}
    </button>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface ICalendarProps {
  date: Date;
  style?: any;
  OnChange: (value: any) => any;
}

export const Calendar: React.FC<ICalendarProps> = (props: ICalendarProps) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const months: any[] =[
    {code: "Jan", days: 31, text: "January", value: 0}, {code: "Feb", days: 28, text: "February", value: 1},
    {code: "Mar", days: 30, text: "March", value: 2}, {code: "Apr", days: 30, text: "April", value: 3},
    {code: "May", days: 31, text: "May", value: 4}, {code: "Jun", days: 30, text: "June", value: 5},
    {code: "Jul", days: 31, text: "July", value: 6}, {code: "Aug", days: 31, text: "August", value: 7},
    {code: "Sep", days: 30, text: "September", value: 8}, {code: "Oct", days: 31, text: "October", value: 9},
    {code: "Nov", days: 30, text: "November", value: 10}, {code: "Dec", dyas: 31, text: "December", value: 11}
  ];
  const selectYear: any[] = new Array<any>();
  for (let y = props.date.getFullYear() - 100; y < props.date.getFullYear() + 100; y++) {
    selectYear.push({text: `${y}`, value: y});
  }
  const GetMonth = (): any => {
    let i: number = months[props.date.getMonth()].days;
    if (props.date.getMonth() === 1 && (props.date.getFullYear() % 4) === 0) {
      i++;
    }
    let tds: any[] = new Array<any>();
    const trs: any[] = new Array<any>();
    for (let d = 0; d < i; d++) {
      if ((d % 7) === 0) {
        trs.push(<tr key={`dtr${d}`} >{tds}</tr>);
        tds = new Array<any>();
      }
      tds.push(
        <td key={`dtd${d}`} className="active-blue" onClick={(e: React.MouseEvent<HTMLTableCellElement>) => { props.date.setDate(d+1); setOpen(false); props.OnChange(props.date) }}>
          {String(d+1).padStart(2, "0")}
        </td>
      );
    }
    trs.push(<tr key={`dtr31`}>{tds}</tr>);
    return trs;
  }
  const [month, setMonth] = React.useState<any>(null);
  return (
    <div style={{...props.style, width: 230}}>
      <div style={{alignItems: "center", backgroundColor: "var(--color-background-div)", display: "flex", height: 28, justifyContent: "space-between", paddingLeft: 10}}>
        <div>{props.date.toDateString()}</div>
        <div className="icon-calendar" style={{cursor: "pointer", height: 24, marginLeft: 50, width: 22}}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {setMonth(GetMonth()); const b: boolean = !open; setOpen(b);}} />
      </div>
      <div style={{display: open ? "block" : "none", height: 0, position: "relative", zIndex: 10}}>
        <div style={{backgroundColor: "var(--color-background-modal)", padding: 10}}>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Select options={months} value={props.date.getMonth()} OnSelect={(value: any) => { props.date.setMonth(value); setMonth(GetMonth()); }} />
            <Select options={selectYear} value={props.date.getFullYear()} OnSelect={(value: any) => { props.date.setFullYear(value); setMonth(GetMonth()); }} />
          </div>
          <table style={{width: "100%"}}>
            <tbody>
              <tr><td>Su</td><td>Mo</td><td>Tu</td><td>We</td><td>Th</td><td>Fr</td><td>Sa</td></tr>
              {month}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
interface ICheckboxProps {
  style?: any;
  text?: string;
  value: boolean;
  OnClick: (value: boolean) => any;
}

export const Checkbox: React.FC<ICheckboxProps> = (props: ICheckboxProps) => {
  const [value, SetValue] = React.useState(props.value);
  const [icon, SetIcon] = React.useState(props.value ? "icon-checkbox1" : "icon-checkbox0");
  let text: any = null;
  if (props.text) {
    text = <div style={{ display: "inline-block", paddingRight: 15 }}>{props.text}</div>
  }
  return (
    <div style={{...props.style, alignItems: "center", display: "flex" }}>
      {text}
      <div className={icon} style={{ color: "var(--blue)", cursor: "pointer", height: 20, width: 20 }} onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        const b: boolean = !value;
        SetValue(b);
        if (b) {
          SetIcon("icon-checkbox1");
        } else {
          SetIcon("icon-checkbox0");
        }
        props.OnClick(b);
      }} />
    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface IRadioProps {
  options: any[];
  style?: any;
  value: any;
  text?: string;
  OnSelect: (value: any) => any;
}

export const Radio: React.FC<IRadioProps> = (props: IRadioProps) => {
  const items: any[] = new Array<any>();
  const itemRefs = React.useRef<any>([]);
  let selected: number = -1;
  
  props.options.map((o: any, i: number) => {
    items.push(<div className={o.value === props.value ? "icon-radio1" : "icon-radio0"} style={{ alignItems: "center", cursor: "pointer", display: "flex", height: 20, marginBottom: 5, marginTop: 5, paddingLeft: 30, width: 20 }} key={o.value} ref={(ref) => itemRefs.current.push(ref)} onClick={(e: React.SyntheticEvent<HTMLDivElement>) => Select(e, i, o)}>{o.text}</div>)
    if (o.value === props.value) {
      selected = i;
    }
    return items;
  });
  const Select = (e: React.SyntheticEvent<HTMLDivElement>, i: number, o: any) => {
    props.OnSelect(o.value);
    if (selected !== -1) {
      const element: any = itemRefs.current[selected];
      element.classList.remove("icon-radio1");
      element.classList.add("icon-radio0");
    }
    selected = i;
    const element: any = itemRefs.current[selected];
    element.classList.remove("icon-radio0");
    element.classList.add("icon-radio1");
  }
  let text: any = null;
  if (props.text) {
    text = <div style={{ display: "inline-block", paddingRight: 15 }}>{props.text}</div>
  }
  return (
    <div style={{...props.style, display: "flex", flexDirection: "column" }}>
      <div>{text}</div>
      {items}
    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface IRangeProps {
  max: number;
  min: number;
  style?: any;
  value: string;
  OnChange: (value: string) => any;
}

export const Range: React.FC<IRangeProps> = (props: IRangeProps) => {
  const [value, SetValue] = React.useState(props.value);
  const slider = React.useRef<any>(null);

  return (
    <input ref={slider} style={{...props.style, width: props.style?.width || 100 }} type="range" max={props.max} min={props.min} value={value} 
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {SetValue(e.target.value); props.OnChange(e.target.value)}} 
      onInput={(e: any) => {
        slider.current.style.background = `linear-gradient(to right, var(--blue) 0%, var(--blue) ${(slider.current.value - slider.current.min) / (slider.current.max - slider.current.min) * 100}%, transparent ${(slider.current.value - slider.current.min) / (slider.current.max - slider.current.min) * 100}%, transparent 100%)`;      
      }}/>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface ISelectProps { 
  options: any[];
  value: any;
  style?: any;
  text?: string;
  OnSelect: (value: any) => any;
}

export const Select: React.FC<ISelectProps> = (props: ISelectProps) => {
  let text: any = null;
  if (props.text) {
    text = <div style={{ display: "inline-block", paddingRight: 15 }}>{props.text}</div>
  }
  return (    
    <div style={{...props.style, alignItems: "center", display: "flex" }}>
      {text}
      <select style={{ height: 32, width: "100%" }} defaultValue={props.value} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => props.OnSelect(e.target.value)}>
        {props.options.map((o: any) => <option key={o.value} value={o.value}>{o.text}</option>)}
      </select>
    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
interface ISwitchProps {
  style?: any;
  text?: string;
  value: boolean;
  OnClick: (value: boolean) => any;
}

export const Switch: React.FC<ISwitchProps> = (props: ISwitchProps) => {
  const [value, SetValue] = React.useState(props.value);
  let text: any = null;
  if (props.text) {
    text = <div style={{ display: "inline-block", paddingRight: 15 }}>{props.text}</div>
  }
  return (
    <div style={{...props.style, alignItems: "center", display: "flex" }}>
      {text}

      <label className="switch">
        <input type="checkbox" />
        <span className="slider round" onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          const b: boolean = !value;
          SetValue(b);
          props.OnClick(b);
        }}></span>
      </label>

    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface ITextProps {
  help?: string;
  pattern?: string;
  placeholder: string;
  style?: any;
  value: string;
  OnChange: (value: string) => any;
}

export const Text: React.FC<ITextProps> = (props: ITextProps) => {
  const validate = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (props.pattern) {
    _logger.LogInformation(`Input.validate ${e.key} => ${props.pattern}: ${e.key.match(props.pattern)}`);
      if (e.key.match(props.pattern) === null) {
        e.preventDefault();
      }
    }
  }
  return (
    <div>
      {props.help && <div style={{ color: "lightgray", fontSize: 10, padding: 2 }}>{props.help}</div>}
      <input style={props.style} placeholder={props.placeholder} type="text" value={props.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.OnChange(e.target.value)} onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => validate(e)} />
    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface ITimeProps {
  date: Date;
  style?: any;
  OnChange: (value: any) => any;
}

export const Time: React.FC<ITimeProps> = (props: ITimeProps) => {
  const hours: any[] = new Array<any>();
  for (let i: number = 1; i < 13; i++) {
    hours.push({text: `${i}`.padStart(2, "0"), value: i});
  }

  const minutes: any[] = new Array<any>();
  for (let i: number = 1; i < 61; i++) {
    minutes.push({text: `${i}`.padStart(2, "0"), value: i});
  }

  return (
    <div style={{...props.style, alignItems: "center", display: "flex", flexDirection: "row"}}>
      <Select style={{width: 50}} options={hours} value={props.date.getHours()} OnSelect={() => {} } />
      <Select style={{width: 50}} options={minutes} value={props.date.getMinutes()} OnSelect={() => {} } />
      <Select style={{width: 60}} options={[{text: "AM", value: 0}, {text: "PM", value: 12}]} value={0} OnSelect={() => {} } />
      <div className="icon-time" style={{height: 20, marginLeft: 10, width: 20}} />
    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
/* export const Controls: React.FC = () => {
  return (
    <div style={{ padding: "5vw" }}>
      <div style={{ fontSize: 32 }}>Controls</div>
      <hr />
      <table style={{ overflow: "hidden", width: "90vw" }}>
        <thead>
          <tr style={{height: 32}}>
            <th style={{ width: "300px" }}>Key</th>
            <th style={{ width: "500px" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Button</td>
            <td><Button text="Text" OnClick={() => _logger.LogInformation(`button`)} /></td>
          </tr>
          <tr>
            <td>Icon Button</td>
            <td><ButtonIcon style={{backgroundColor: "var(--red)"}} icon="icon-delete" text="Text" OnClick={() => _logger.LogInformation(`button`)} /></td>
          </tr>
          <tr>
            <td>Checkbox</td>
            <td><Checkbox value={false} OnClick={(value: boolean) => _logger.LogInformation(`checkbox: ${value}`)} /></td>
          </tr>
          <tr>
            <td>Date Time</td>
            <td style={{display: "flex", flexDirection: "row"}}>
              <Calendar date={new Date()} OnChange={(value: string) => _logger.LogInformation(`date: ${value}`)} />
              <div style={{width: 50}} />
              <Time date={new Date()} OnChange={(value: string) => _logger.LogInformation(`time: ${value}`)} />
            </td>
          </tr>
          <tr>
            <td>Radio</td>
            <td><Radio value={"value2"} OnSelect={(value: any) => _logger.LogInformation(`radio: ${value}`)}
              options={[{ text: "Text1", value: "value1" }, { text: "Text2", value: "value2" }, { text: "Text3", value: "value3" }]} />
            </td>
          </tr>
          <tr>
            <td>Range</td>
            <td>
              <Range style={{...{ width: 300 }}} max={10} min={0} value={"5"} OnChange={(value: string) => _logger.LogInformation(`range: ${value}`)} />
              <Range style={{...{ width: 50,  WebkitTransform: "rotate(270deg)" }}} max={10} min={0} value={"5"} OnChange={(value: string) => _logger.LogInformation(`range: ${value}`)} />
            </td>
          </tr>
          <tr>
            <td>Select</td>
            <td><Select style={{width: 100}} value={"value2"} OnSelect={(value: any) => _logger.LogInformation(`select: ${value}`)}
              options={[{ text: "Text1", value: "value1" }, { text: "Text2", value: "value2" }, { text: "Text3", value: "value3" }, { text: "Text4", value: "value4" },
              { text: "Text5", value: "value5" }, { text: "Text6", value: "value6" }, { text: "Text7", value: "value7" }, { text: "Text8", value: "value8" }]} />
            </td>
          </tr>
          <tr>
            <td>Switch</td>
            <td><Switch value={false} OnClick={(value: boolean) => _logger.LogInformation(`checkbox: ${value}`)} /></td>
          </tr>
          <tr>
            <td>Text</td>
            <td><Text help="Help" pattern="[A-Za-z]" placeholder="Placeholder ..." value="" OnChange={(value: string) => _logger.LogInformation(`text: ${value}`)} /></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}*/
