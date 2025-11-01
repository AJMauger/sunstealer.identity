import React from "react";
import { v4 as uuidv4 } from "uuid";
import * as DOMPurify from 'dompurify';
import "../App.css";
import "../css/table.css";
import { Menu } from "./menu";
import { User } from "../services/configuration";
import { _configuration, _logger } from "../index";

// ajm: -------------------------------------------------------------------------------------------
export enum eUSERCELL {
  eTYPE_EMAIL=0,
  eTYPE_PASSWORD=1,
  eTYPE_PHONE=2,
  eTYPE_SELECT=3,
  eTYPE_TEXT=4,
  eTYPE_UNIQUE=5
}

const headerProps: IUsersHeaderProps = {
  cells: [
    { text: `Username`, width: "10vw" },
    { text: `First Name`, width: "10vw" },
    { text: `Last Name`, width: "10vw" },
    { text: `E-mail`, width: "15vw" },
    { text: `Password`, width: "10vw" },
    { text: `Phone`, width: "10vw" },
    { text: `Scopes`, width: "10vw" }
  ] 
}

export const Users: React.FC = () => {
  const select: React.MutableRefObject<any> = React.useRef<any>(null);
  const text: React.MutableRefObject<any> = React.useRef<any>(null);

  const [menu, SetMenu] = React.useState<boolean>(false);
  const [rows, SetRows] = React.useState<IUserRowProps[]>([]);
  const [selected, SetSelected] = React.useState<HTMLTableRowElement>();  
  const [selectedCell, SetSelectedCell] = React.useState<number>(-1);  
  const [selectedRow, SetSelectedRow] = React.useState<number>(-1);  
  const [update, SetUpdate] = React.useState<boolean>(false);
  const [x, SetX] = React.useState<number>(0);
  const [y, SetY] = React.useState<number>(0);

  React.useEffect(() => {
    console.log("Users.useEffect() => DidMount");
  });

  const Populate = () => {
    if (_configuration.configuration.users) {
      const rows: IUserRowProps[]=new Array<IUserRowProps>();
      for (let u of _configuration.configuration.users) {
        rows.push(
          {
            background: "var(--color-background-modal)",
            cells: [
              { text: u.username, type: eUSERCELL.eTYPE_UNIQUE, valid: true, width: "10vw" },
              { text: u.firstname, type: eUSERCELL.eTYPE_TEXT, valid: true, width: "10vw" },
              { text: u.lastname, type: eUSERCELL.eTYPE_TEXT, valid: true, width: "10vw" },
              { text: u.email, type: eUSERCELL.eTYPE_EMAIL, valid: true, width: "15vw" },
              { text: u.password, type: eUSERCELL.eTYPE_TEXT, valid: true, width: "10vw" },
              { text: u.phone, type: eUSERCELL.eTYPE_PHONE, valid: true, width: "10vw" },
              { options: ["sunstealer.read", "sunstealer.write"], text: u.scopes, type: eUSERCELL.eTYPE_SELECT, valid: true, width: "10vw" }
            ],
            id: uuidv4(),
          });
          SetRows(rows);
      }
    }        
  }

  const Validate = (type: eUSERCELL | undefined, value: string | undefined): boolean => {
    try {
      switch (type) {
        case eUSERCELL.eTYPE_EMAIL:
          if (value) {
            const valid: any=value.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
            if (valid) {
              return true;
            }
          }
          break;
        case eUSERCELL.eTYPE_PHONE: 
          if (value) {
            const valid: any=value.match(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/);
            if (valid) {
              return true;
            }
          }
        break;
        case eUSERCELL.eTYPE_TEXT:
          if (value && value.length !== 0) {
            return true; 
          }
          break;
        case eUSERCELL.eTYPE_UNIQUE:
          if (value && value.length !== 0) {
            const userNames: IUserRowProps[]=rows.filter(r => r.cells[0].text===value);
            if (userNames.length===1) {
              return true;
            }
          }
          break;
        }
      _logger.LogError("Validation error.");
    } catch(e) {
      _logger.LogException(e as Error);
    }
    return false;
  }

  if (!rows.length && _configuration.configuration.users && rows.length!==_configuration.configuration.users.length) {
    Populate();
  }

  let valid: boolean = true;
  for (let r of rows) {
    for (let c of r.cells) {
      if (!c.valid) {
        valid=false;
        break;
      }
    }  
    if (!valid) {
      break;
    }
  }

  return (
    <div style={{ height: "calc(100vh - 36px)", margin: 10, userSelect: "none", width: "85vw" }} onClick={() => SetMenu(false)}>
      <table style={{ border: "1px var(--color-background-modal) solid", borderRadius: 8, display: "block", overflow: "hidden", tableLayout: "fixed"}}>
        <thead>
          <tr style={{cursor: "default", height: 32}}>
            {headerProps.cells.map((cell: IUsersCellProps, i: number) => <th key={`h${i}`} style={{ width: cell.width, borderTopRightRadius: i===6 ? 8 : 0}}>{cell.text}</th>)}
          </tr>
        </thead>
        <tbody style={{display: "block", height: "70vh", overflowY: "scroll", tableLayout: "fixed"}}>
          {rows.map((row: IUserRowProps, i: number) =>
            <TableRow background={row.background} cells={row.cells} id={row.id} key={`row${i}`} refSelect={select} refText={text}
              OnClick={(e: React.MouseEvent<HTMLTableCellElement>, index: number) => {
                SetSelectedCell(index);
                SetSelectedRow(i);
                const tr: any = (e.target as HTMLElement).parentElement; 
                if (selected) {
                  selected.style.background="var(--color-background-modal)";
                }                
                SetSelected(tr);
                tr.style.background="var(--blue)";
                SetMenu(false);
              }} 

              OnContextMenu={(e: React.MouseEvent<HTMLTableRowElement>) => {
                const tr: any = (e.target as HTMLElement).parentElement; 
                if (selected) {
                  selected.style.background="var(--color-background-modal)";
                }                
                SetSelected(tr);
                tr.style.background="var(--blue)";
                SetX(e.pageX);
                SetY(e.pageY);
                SetMenu(true);
              }} />
          )}
        </tbody>
      </table>
 
      <div style={{ alignItems: "center", display: "flex", flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
        <button style={{ background: valid ? "var(--blue)" : "var(--color-secondary)", color: valid ? "whitesmoke" : "gray", cursor: valid ? "pointer" : "not-allowed" }} 
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            const row: IUserRowProps = {
              background: "var(--color-background-modal)",
              cells: [
                { text: ``, type: eUSERCELL.eTYPE_UNIQUE, valid: false, width: "10vw" },
                { text: ``, type: eUSERCELL.eTYPE_TEXT, valid: false, width: "10vw" },
                { text: ``, type: eUSERCELL.eTYPE_TEXT, valid: false, width: "10vw" },
                { text: ``, type: eUSERCELL.eTYPE_EMAIL, valid: false, width: "15vw" },
                { text: ``, type: eUSERCELL.eTYPE_TEXT, valid: false, width: "10vw" },
                { text: ``, type: eUSERCELL.eTYPE_PHONE, valid: false, width: "10vw" },
                { text: ``, options: ["sunstealer.read", "sunstealer.write"], valid: true, type: eUSERCELL.eTYPE_SELECT, width: "10vw" }
              ],
              id: uuidv4(),
            };
            const data: IUserRowProps[] = [ ...rows ];
            data.splice(0, 0, row);
            SetRows(data);
            SetUpdate(!update);
           }} disabled={!valid}>New</button>

        <button style={{ background: valid ? "var(--blue)" : "var(--color-secondary)", color: valid ? "whitesmoke" : "gray", cursor: valid ? "pointer" : "not-allowed", marginLeft: 10 }} 
          onClick={() => { 
            const users: User[] = Array<User>();
            for (let r of rows) {
              users.push({
                email: r.cells[3].text,
                firstname: r.cells[1].text,
                lastname: r.cells[2].text,
                password: r.cells[4].text,
                phone: r.cells[5].text,
                scopes: r.cells[6].text,
                username: r.cells[0].text
              });
            }
            _configuration.configuration.users=users;
            _configuration.Save();
          }} disabled={!valid}>Update</button>
      </div>

      <Menu open={menu} height={50} width={200} x={x} y={y} 
        options={[
          {text: "Delete", callback: () => {
            SetMenu(false); 
            _configuration.configuration.users?.splice(selectedRow, 1);
            const data: IUserRowProps[] = [ ...rows ];
            data.splice(selectedRow, 1)
            SetRows(data);
          }},
        ]}>
      </Menu>

      <input style={{ border: "1px #fafafaff solid", borderRadius: 4, display: "none", position: "absolute" }} type="text" ref={text} 
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          rows[selectedRow].cells[selectedCell].text = DOMPurify.sanitize(text.current.value);
          text.current.style.display="none";
          SetUpdate(!update);            
          rows[selectedRow].cells[selectedCell].valid=Validate(rows[selectedRow].cells[selectedCell].type, rows[selectedRow].cells[selectedCell].text);
        }}

        onKeyUpCapture={(e: React.KeyboardEvent<HTMLInputElement>) => {
          switch (e.code) {
            case "Enter":
              rows[selectedRow].cells[selectedCell].text = DOMPurify.sanitize(text.current.value);
              text.current.style.display="none";              
              rows[selectedRow].cells[selectedCell].valid=Validate(rows[selectedRow].cells[selectedCell].type, rows[selectedRow].cells[selectedCell].text);
              SetUpdate(!update);
              break;
            case "Escape":
              text.current.style.display="none";
            break;
          } 
        }}
      />

      <select style={{ border: "1px #fafafaff solid", borderRadius: 4, display: "none", position: "absolute" }} ref={select} 
        onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
          select.current.style.display="none";
          SetUpdate(!update);
        }}

        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          rows[selectedRow].cells[selectedCell].text = select.current.value;
          select.current.style.display="none";
          SetUpdate(!update);
        }}

        onClick={(e: React.MouseEvent<HTMLSelectElement>) => {
          rows[selectedRow].cells[selectedCell].text = select.current.value;
          SetUpdate(!update);
        }}
      />
    </div>
  );
}

// ajm: -------------------------------------------------------------------------------------------
export interface IUsersHeaderProps {
  cells: IUsersCellProps[];
}

// ajm: -------------------------------------------------------------------------------------------
export interface IUserRowProps {
  background: string;
  cells: IUsersCellProps[];
  id: string;
  OnClick?: (e: React.MouseEvent<HTMLTableCellElement>, index: number) => any;
  OnContextMenu?: (e: React.MouseEvent<HTMLTableRowElement>) => any;
  refSelect?: React.MutableRefObject<any>;  
  refText?: React.MutableRefObject<any>;  
}

export const TableRow: React.FC<IUserRowProps> = (props: IUserRowProps) => {
  return (
    <tr className="active" style={{backgroundColor: props.background}}
    onContextMenu={(e: React.MouseEvent<HTMLTableRowElement, globalThis.MouseEvent>) => { if (props.OnContextMenu) { props.OnContextMenu(e); }}}>
    
    {props.cells.map((cell: any, i: number) => 
      <td style={{ background: cell.valid ? "transparent" : "#d32f2fc0", fontWeight: "lighter", height: 20, width: cell.width, userSelect: "none"}} key={`cell${i}`}
    
      onClick={(e: React.MouseEvent<HTMLTableCellElement>) => {
        if (i!==0 || !cell.valid) {
          const site: HTMLTableCellElement = (e.target as HTMLTableCellElement);
          const rect: DOMRect = site.getBoundingClientRect();
          switch(cell.type) {
            case eUSERCELL.eTYPE_SELECT:
              if (props.refSelect) {
                props.refSelect.current.style.left=`${rect.x}px`;
                props.refSelect.current.style.top=`${rect.y+2}px`;
                props.refSelect.current.style.width=`${rect.width}px`;
                props.refSelect.current.style.height=`${rect.height-4}px`;
                props.refSelect.current.replaceChildren(undefined);
                for (const option of cell.options) {
                  const o: HTMLOptionElement = document.createElement("option");
                  o.value = option;
                  o.innerText = option;
                  props.refSelect.current.appendChild(o);
                }
                props.refSelect.current.style.display="block";
                props.refSelect.current.focus();
              }
            break;
            default:
              if (props.refText) {
                props.refText.current.style.left=`${rect.x}px`;
                props.refText.current.style.top=`${rect.y}px`;
                props.refText.current.style.width=`${rect.width-14}px`;
                props.refText.current.style.height=`${rect.height-4}px`;
                props.refText.current.value = site.innerText;          
                props.refText.current.style.display="block";
                props.refText.current.focus();
              }
            break;
          }
        }
        if (props.OnClick) { 
          props.OnClick(e, i);
        }}} 
    
    >{cell.text}</td> )}
  </tr>);
}

// ajm: -------------------------------------------------------------------------------------------
interface IUsersCellProps {
  options?: string[];
  text: string;
  type?: eUSERCELL;
  valid?: boolean;
  width: string;
}
