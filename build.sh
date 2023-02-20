if [ ! -d "../docker-registry" ]; then
  echo "mkdir ../docker-registry"
  mkdir ../docker-registry
fi

cp ../Documents/sunstealer.crt ./src/dist/certificate/sunstealer.crt
cp ../Documents/sunstealer.key ./src/dist/certificate/sunstealer.key

sudo docker login ajmfco37-01.ajm.net:5000
# Dockerfile
sudo docker build -t ajmfco37-01.ajm.net:5000/sunstealer-identity .
sudo docker push ajmfco37-01.ajm.net:5000/sunstealer-identity
# sudo docker logout ajmfco37-01.ajm.net:5000

# kubectl delete secret tls sunstealer-certificate
kubectl create secret tls sunstealer-certificate --key /var/home/ajm/Documents/sunstealer.key --cert /var/home/ajm/Documents/sunstealer.crt

rm ./src/dist/certificate/sunstealer.crt
rm ./src/dist/certificate/sunstealer.key

#debug
  # kubectl exec --stdin --tty <POD_NAME> -- /bin/bash
  # apt update
  # apt install net-tools
  # curl http://10.244..:9001/.well-known/openid-configuration
  # {"authorization_endpoint":"https://10.244.2.8:9001/auth","claims_parameter_supported":false,"claims_supported":["sub","profile","sid","auth_time","iss"],"code_challenge_methods_supported":["S256"],"end_session_endpoint":"https://10.244.2.8:9001/session/end","grant_types_supported":["implicit","authorization_code","refresh_token"],"id_token_signing_alg_values_supported":["ES256","PS256","RS256"],"issuer":"https://0.0.0.0:9001","jwks_uri":"https://10.244.2.8:9001/jwks","authorization_response_iss_parameter_supported":true,"response_modes_supported":["form_post","fragment","query"],"response_types_supported":["code id_token","code","id_token","none"],"scopes_supported":["offline_access","openid","profile"],"subject_types_supported":["public"],"token_endpoint_auth_methods_supported":["none"],"token_endpoint":"https://10.244.2.8:9001/token","request_object_signing_alg_values_supported":["HS256","RS256","PS256","ES256","EdDSA"],"request_parameter_supported":false,"request_uri_parameter_supported":true,"require_request_uri_registration":true,"userinfo_endpoint":"https://10.244.2.8:9001/me","claim_types_supported":["normal"]}
  # exit

# curl --insecure https://ajmfco37-01:32443/sunstealer-identity/.well-known/openid-configuration

# docker run -d --name sunstealer -p 8080:8080 --restart=always ajmfco37-01:5000/sunstealer-identity:latest
# docker exec -it <container_id> bash
