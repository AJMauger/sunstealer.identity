cp ../tls.crt ./src/dist/certificate/tls.crt
cp ../tls.key ./src/dist/certificate/tls.key

sudo docker login ajmfco42-01.ajm.net:5000
sudo docker build -t ajmfco42-01.ajm.net:5000/sunstealer-identity .
sudo docker push ajmfco42-01.ajm.net:5000/sunstealer-identity
# sudo docker logout ajmfco42-01.ajm.net:5000

rm ./src/dist/certificate/tls.crt
rm ./src/dist/certificate/tls.key
