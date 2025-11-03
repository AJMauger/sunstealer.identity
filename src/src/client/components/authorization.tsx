import React, { useEffect } from "react";
import jsonwebtoken from "jsonwebtoken";
import { _configuration, _identity, _logger } from "../index";
import "../App.css";
import "../css/table.css";

interface Props {
}

export const Authorization = (props: Props) => {
  useEffect(() => {
    const componentDidUpdate = () => {
    }
    componentDidUpdate();
  });

  useEffect(() => {
    const componentDidMount = () => {
    }
    componentDidMount();
    return () => {
    };
  });

  return (
    <div style={{ fontSize: 12, height: "calc(100vh - 36px)", overflowY: "auto", width: "100vw" }}>
      <table cellPadding={2} style={{ width: "99vw" }}>
        <thead>
          <tr style={{ height: 32 }}>
            <th style={{ width: "60px" }}>Key</th>
            <th style={{ width: "1000px" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{verticalAlign: "top"}}>access_token</td><td>{_identity.accessToken?.length === 43 ? _identity.accessToken : JSON.stringify(jsonwebtoken.decode(_identity.accessToken || "", { complete: true }) || {}, null, 2)}</td>
          </tr>
          <tr>
            <td style={{verticalAlign: "top"}}>identity_token</td><td>{JSON.stringify(jsonwebtoken.decode(_identity.identityToken || "", { complete: true }) || {}, null, 2)}</td>
          </tr>
          <tr>
            <td style={{verticalAlign: "top"}}>refresh_token</td><td>{_identity.refreshToken}</td>
          </tr>
          <tr>
            <td style={{verticalAlign: "top"}}>user</td><td>{JSON.stringify(_identity.userInfo, null, 2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Authorization;
