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
    const componentDidMount = async () => {
      _logger.LogDebug("componentDidMount()");
      _identity.codeVerifier=_identity.CodeChallenge();
      if (!_identity.accessToken) {
        SetUri(`${_identity.discovery?.authorization_endpoint}?client_id=sunstealer_explorer&code_challenge=${_identity.CodeChallenge()}&code_challenge_method=S256&redirect_uri=${_identity.redirect}&response_type=code&scope=offline_access openid profile`);
        _logger.LogDebug(`identity: AuthorizationCodeFlowPKCE() code request: ${uri}`);
      }
    }
    componentDidMount();
    return () => {
      console.info("componentUnmount()");
    };
  }, []);

  _logger.LogDebug(`uri: ${uri}`);

  return (
    <div style={{height: "100%", padding: 10}}>

      { !_identity.accessToken && 
      
      <iframe ref={iframe} style={{ border: 0, overflow: "hidden" }} height="100%" width="100%" src={uri} 
        onLoad={async () => {
          try {
            _logger.LogDebug(`identity: code response: ${iframe.current?.contentWindow?.location.href}`);
            const url: URL = new URL(iframe.current?.contentWindow?.location.href || "");
            _identity.code = url.searchParams.get("code");
            if (_identity.code) {
              await _identity.GetToken();  // ajm: exchange code for tokens
              _identity.state=eOIDCFLOW.eSIGNEDIN;
              SetUri("");
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

    </div>
    );
}

export default Home;
