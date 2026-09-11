/**
 * Genera el "client secret" de Sign in with Apple: un JWT ES256 firmado con la
 * clave privada .p8 que descargás de developer.apple.com.
 *
 * Uso:
 *   node apps/web/scripts/generate-apple-secret.mjs \
 *     --team ABCDE12345 \
 *     --key   KEY1234567 \
 *     --sid   com.crop.web \
 *     --p8    ./AuthKey_KEY1234567.p8
 *
 * O sin flags: te lo pregunta interactivamente.
 * Pegá el resultado en AUTH_APPLE_SECRET (apps/web/.env.local).
 * Apple limita la validez a 6 meses: hay que regenerarlo antes de que caduque.
 *
 * Necesita `jose` (ya en devDependencies de apps/web):  pnpm --filter web add -D jose
 */
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout, argv } from "node:process";
import { SignJWT, importPKCS8 } from "jose";

function flag(name) {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 ? argv[i + 1] : undefined;
}

async function ask(label, preset) {
  if (preset) return preset;
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = (await rl.question(`${label}: `)).trim();
  rl.close();
  return answer;
}

const teamId = await ask("Team ID (10 chars)", flag("team"));
const keyId = await ask("Key ID (10 chars)", flag("key"));
const servicesId = await ask("Services ID (p.ej. com.crop.web)", flag("sid"));
const p8Path = await ask("Ruta al archivo .p8", flag("p8"));

const privateKeyPem = readFileSync(p8Path, "utf8");
const key = await importPKCS8(privateKeyPem, "ES256");

const now = Math.floor(Date.now() / 1000);
const sixMonths = 60 * 60 * 24 * 180; // máximo permitido por Apple

const jwt = await new SignJWT({})
  .setProtectedHeader({ alg: "ES256", kid: keyId })
  .setIssuer(teamId)
  .setIssuedAt(now)
  .setExpirationTime(now + sixMonths)
  .setAudience("https://appleid.apple.com")
  .setSubject(servicesId)
  .sign(key);

console.log("\nAUTH_APPLE_SECRET=" + jwt + "\n");
console.log(`Caduca: ${new Date((now + sixMonths) * 1000).toISOString()}`);
