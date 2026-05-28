# Susurro

**Un compañero de IA con voz para el bienestar mental, donde tu memoria de conversaciones vive cifrada y es tuya — no de una plataforma.**

Proyecto para el track **Arkiv × Puna Tech 2026** (Aplicaciones de IA sobre Arkiv).

- **Equipo:** solo — [@artugrande](https://github.com/artugrande)
- **Track:** Arkiv Network — IA + datos verificables
- **Demo en vivo:** https://susurro-nine.vercel.app
- **Video:** _(por publicar)_

---

## El problema

Las apps de bienestar/journaling con IA (Wysa, Woebot, Replika, etc.) guardan tus conversaciones más íntimas en sus propios servidores, para siempre. No te las podés llevar, no sabés quién las lee, y si la empresa cambia de política o cierra, tu historia desaparece. Justo en el dominio donde la confianza lo es todo, vos no tenés control.

## La solución

Susurro es un coach de bienestar **con voz** (ElevenLabs) cuya memoria vive en **Arkiv**, cifrada del lado del cliente. Vos sos dueño de tus datos:

- **Cifrado con tu llave.** Cada entrada se cifra en tu navegador con una clave derivada de la firma de tu wallet. Ni nuestro servidor ni la blockchain pública ven el texto.
- **Acceso por tiempo limitado.** Le das acceso al coach por las horas que vos elijas. Usa `expiresIn` nativo de Arkiv — el acceso se corta solo, sin intervención.
- **Cortás cuando querés.** Un botón revoca el acceso al instante.
- **Auditoría verificable.** Cada lectura del coach queda registrada de forma pública e inmutable en Arkiv. Cualquiera puede verificar qué se leyó y cuándo.

Toca las tres verticales del track: memoria de IA propiedad del usuario, procedencia/auditoría de IA, y capa de datos personales.

---

## Por qué Arkiv (y no Postgres / IPFS / Filecoin)

- **`expiresIn` como primitiva.** Los permisos caducan a nivel de la base de datos, no por lógica de app. La auto-revocación por expiración es nativa — ningún otro stack lo da.
- **Atributos consultables.** El coach pide "mood de los últimos 7 días" sin descargar todo el diario. El payload sensible queda cifrado; solo los atributos (índice) son públicos.
- **`$creator` inmutable.** Todas las entidades las crea la wallet de la app (trusted creator), así las lecturas filtran por `.createdBy()` y rechazan datos inyectados.

---

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind 4 |
| Capa de datos | [Arkiv](https://arkiv.network) — `@arkiv-network/sdk` (testnet BRAGA) |
| Voz + agente | [ElevenLabs](https://elevenlabs.io) Conversational AI — `@elevenlabs/react` |
| Cifrado | AES-256-GCM (Web Crypto), clave derivada de firma de wallet |
| Wallet | viem + RainbowKit/wagmi |
| Deploy | Vercel |

### Modelo de datos (6 entidades Arkiv)

| Entidad | Payload | `expiresIn` |
| --- | --- | --- |
| `journal-entry` | cifrado (texto del diario) | 1 año |
| `mood-checkin` | cifrado (nota opcional) | 90 días |
| `access-grant` | público (scope, duración) | duración del grant |
| `access-log` | público (qué/cuándo leyó el coach) | 1 año |
| `coach-insight` | cifrado (observaciones) | 1 año |
| `subscription` | público (plan) | 30 días |

Todas las entidades llevan un `PROJECT_ATTRIBUTE` único para aislar los datos en la base compartida de Arkiv.

---

## Correr localmente

```bash
pnpm install

# Configurar entorno (ver .env.example)
cp .env.example .env.local
# Editar .env.local con tu ARKIV_PRIVATE_KEY (wallet con GLM de testnet BRAGA)

pnpm dev
```

Conseguí GLM de testnet en el [faucet de BRAGA](https://braga.hoodi.arkiv.network/faucet/).

### Scripts de validación (prueban la integración con Arkiv)

```bash
pnpm dlx tsx -r dotenv/config scripts/validate-arkiv.ts dotenv_config_path=.env.local
pnpm dlx tsx scripts/validate-crypto.ts
pnpm dlx tsx -r dotenv/config scripts/validate-entities.ts dotenv_config_path=.env.local
```

---

## Privacidad y límites

- **Datos sintéticos en el demo.** El demo usa datos generados, no reales.
- **No reemplaza atención profesional.** Susurro es un compañero de journaling, no un terapeuta. Ante una crisis, el coach deriva a líneas de ayuda (en Argentina, **135**).

---

## Roadmap V2 — Celo Onchain Agents

El coach adquiere **wallet propia con identidad ERC-8004** verificable y reputación derivada de los access logs públicos de Arkiv. Pagos vía **x402** (HTTP 402) en USDC sobre **Celo** con **fee abstraction** — el usuario paga en USDC sin necesitar gas nativo. Integración con **MiniPay** para mobile-first en LATAM. Cada conversación se vuelve un evento económico verificable que construye la reputación on-chain del agente.

---

## Herramientas de IA usadas

Desarrollado con asistencia de **Claude (Claude Code)** para arquitectura, código e integración. El equipo entiende y puede defender todo el código.

---

## Licencia

MIT
