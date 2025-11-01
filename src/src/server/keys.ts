import Fs from "fs";
import jose from "node-jose";
import Path from "path";

const keyStore = jose.JWK.createKeyStore();

Promise.all([
  keyStore.generate("RSA", 2048, { use: "sig" }),
  keyStore.generate("EC", "P-256", { use: "sig", alg: "ES256" }),
  // keyStore.generate("OKP", "Ed25519", { use: "sig", alg: "EdDSA" }),
]).then(() => {
  Fs.writeFileSync(Path.resolve("jwks.json"), JSON.stringify(keyStore.toJSON(true), null, 2));
});