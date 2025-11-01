import React, { useEffect, useRef, useState } from "react";
import { _configuration, _identity, _logger } from "../index";
import "../App.css";
import "../css/table.css";
import { eOIDCFLOW } from "../services/identity";

interface Props {
}

export const Home = (props: Props) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [uri, SetUri] = useState<any>(null);

  useEffect(() => {
    if (!_identity.codeVerifier) {
      _logger.LogDebug("componentDidMount()");
      if (!_identity.accessToken) {
        const u: string = `${_identity.discovery?.authorization_endpoint}?client_id=sunstealer_explorer&code_challenge=${_identity.CodeChallenge()}&code_challenge_method=S256&redirect_uri=${_identity.redirect}&response_type=code&scope=offline_access openid profile`; 
        _logger.LogDebug(`home.tsx: identity authorization code request: ${u}`);        
        SetUri(u);
      }
      else {
        SetUri(null);
      }
    }
  }, []);

  useEffect(() => {
    const componentDidUpdate = () => {
    }
    componentDidUpdate();
  });

  return (
    <div style={{ height: "calc(100vh - 36px)", overflowY: "auto", padding: 10}}>
      { _identity.state!=eOIDCFLOW.eSIGNEDIN && uri &&
      <iframe ref={iframe} style={{ border: 1, overflow: "hidden" }} height="100%" width="100%" src={uri} 
        onLoad={async () => {
          {_logger.LogDebug(`home.tsx uri: state: ${uri}`)}
          try {
            if (!_identity.code) {
              const url: URL = new URL(iframe.current?.contentWindow?.location.href || "");
              _identity.code = url.searchParams.get("code");
              if (_identity.code) {
                _logger.LogDebug(`identity: code response: ${iframe.current?.contentWindow?.location.href}`);
                await _identity.GetToken();  // ajm: exchange code for tokens
                _identity.state=eOIDCFLOW.eSIGNEDIN;
                SetUri(null);
              }
            }
          } catch(e: any) {
            _logger.LogException(e, "Identity server network error.");
            if (iframe.current) {
              iframe.current.srcdoc=`
              <html><head><link rel="stylesheet" href="./css/index.css"></head><body><h2>Error: Identity server network error.</h2></body></html>`;
            }
          }
        }
      } />
    }

<pre style={{backgroundColor: "var(--color-secondary)", borderRadius: 8, color: "var(--green)", fontSize: 18, height: 80, left: "calc(50% - 40px)", padding: 5, position: "absolute", top: 50, width: "50%"}}>
  <div style={{overflow: "auto"}}>identity.code: {_identity.code}</div>
  <div style={{overflow: "auto"}}>identity.codeVerifier: {_identity.codeVerifier}</div>
  <div style={{overflow: "auto"}}>identity.accessToken: {_identity.accessToken}</div>
</pre>
    <pre>
      { _identity.discovery ? JSON.stringify(_identity.discovery, null, 2) : ""}
    </pre>
  </div>);
}

export default Home;
