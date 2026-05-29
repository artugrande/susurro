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

## Arquitectura

El contenido sensible se **cifra en el navegador** con una llave derivada de tu wallet; ni el servidor ni Arkiv ven el texto. Las escrituras las firma y **paga la app wallet** (UX sin gas: no necesitás GLM), y la propiedad real es por **cifrado** (solo vos descifrás) + el `$creator` inmutable de Arkiv.

```
┌───────────────────── Navegador (Next.js 16 · App Router) ─────────────────────┐
│                                                                               │
│   UI: orbe de voz · dashboard · mood timeline · hilos · acceso (grants)       │
│                                                                               │
│   Privy ─ login con email ─► embedded wallet ─ firma ─► lib/crypto.ts          │
│   (self-custodial, sin extensión)                      deriva tu llave AES     │
│                                                        (nunca sale del browser)│
│                                                                               │
│   ElevenLabs Conversational AI (voz) ─ clientTools ─► cifra cada registro      │
└───────┬───────────────────────────┬───────────────────────────┬──────────────┘
        │ voz (WebRTC)               │ writes/reads (cifrados)    │ recomendaciones
        ▼                            ▼                            ▼
  Agente ElevenLabs        Next API routes (app/api/*)      Vercel AI Gateway
  (agente público)          /arkiv/* → la app wallet         (gemini-2.5-flash)
                            firma y paga el gas
                            (sin gas para el usuario)
                                   │
                                   ▼
                            Arkiv (Braga testnet)
                            entidades = atributos públicos
                            + payload cifrado + expiresIn nativo
```

**Decisión de diseño:** la lógica con estado corre en el navegador, firmada por el usuario; la app wallet del lado del server solo firma/paga los writes a Arkiv (las escrituras se serializan con un lock para evitar colisiones de nonce). Las recomendaciones se generan con un contexto **no sensible** (resumen de ánimo + temas, nunca el texto crudo del diario).

---

## Probar el demo

En [la demo en vivo](https://susurro-nine.vercel.app) solo necesitás un **email** y micrófono — sin extensión de wallet ni frase semilla:

1. **Ingresá con tu email** → Privy te crea una embedded wallet automáticamente → **Empezá a hablar con Luna** (firmás un mensaje; de esa firma se deriva tu llave de cifrado, que nunca sale del navegador).
2. *(Opcional)* **Cargar 14 días de datos de ejemplo** para que el coach tenga historial que leer.
3. **🎙️ Hablar con Luna** y permitir el micrófono.
4. Contale cómo estás (*"hoy me siento un 4"*) → guarda tu ánimo cifrado en Arkiv.
5. Pedile que mire tu historial → te pide permiso → al aceptar, aparece el **chip de acceso con cuenta regresiva**.
6. **Cortá el acceso** con el botón rojo → el coach pierde el contexto al instante.
7. **Ver quién leyó qué** → registro público y verificable de cada lectura.

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind 4 |
| Capa de datos | [Arkiv](https://arkiv.network) — `@arkiv-network/sdk` (testnet BRAGA) |
| Voz + agente | [ElevenLabs](https://elevenlabs.io) Conversational AI — `@elevenlabs/react` |
| Cifrado | AES-256-GCM (Web Crypto), clave derivada de firma de wallet |
| Auth + wallet | [Privy](https://privy.io) — login con email + embedded wallets (self-custodial, sin extensión) |
| Recomendaciones | [Vercel AI Gateway](https://vercel.com/ai-gateway) (`ai` SDK) — `gemini-2.5-flash` |
| On-chain (server) | viem — la app wallet firma y paga el gas de cada write |
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

Todas las entidades llevan un `PROJECT_ATTRIBUTE` único (`susurro-punatech26-aq7x9k`) para aislar los datos en la base compartida de Arkiv.

**Enfoque técnico (cómo usamos Arkiv como capa de datos, no como un blob):**

- **Atributos tipados como índice.** Filtramos y ordenamos por atributos, nunca por payload. Los numéricos (`mood`, `value`, `created`, `dayOfWeek`, `expiresAt`) van como números para permitir queries de rango.
- **Query combinada.** El coach lee con `project` + `entityType` + `owner` + `created > X` (ej. mood de los últimos 7 días) — no por entity key.
- **Expiración diferenciada con lógica de producto.** Cada tipo tiene su `expiresIn` (mood 90d, journal 1a, grant = duración elegida, etc.); el grant que se vence solo es el corazón del control de acceso.
- **Relaciones por atributos compartidos.** `sessionId` liga journal ↔ access-log de una misma sesión; `grantee` liga el grant con el coach; `relatedTo` liga insights con su entrada.
- **Trust on-chain.** Todas las entidades las crea la app wallet (`$creator` inmutable); las lecturas filtran por `.createdBy()` para rechazar data inyectada.
- **Privacidad.** El contenido sensible va cifrado en el payload (AES-256-GCM con llave derivada de la firma del usuario); solo los atributos no sensibles quedan públicos como índice.

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

En V2 empezamos a cobrar por uso: pagos en **USDT sobre Celo** vía **x402** (HTTP 402) con **fee abstraction** — el usuario paga sin necesitar gas ni tokens nativos. El coach adquiere **wallet propia con identidad ERC-8004** verificable y reputación derivada de los access logs públicos de Arkiv. Distribución como Mini App en **MiniPay** (+16M usuarios) para un caso de uso masivo en LATAM.

---

## Herramientas de IA usadas

Desarrollado con asistencia de **Claude (Claude Code)** para arquitectura, código e integración. El equipo entiende y puede defender todo el código.

---

## Créditos y fuentes

Casi todo el código es original. Lo que es de terceros, acotado y citado:

- **Solo la orbe de voz** usa una pieza de terceros: la función de **ruido simplex 3D de Ashima Arts / Stefan Gustavson** (licencia **MIT**, `components/presence-blob/shaders.ts`). El resto de la orbe —el desplazamiento fbm, el glow fresnel, los estados y el canvas de react-three-fiber— es implementación propia de una técnica estándar y documentada (esfera desplazada por ruido + rim glow). No se reutiliza código de aplicación de terceros.
- El **gráfico de evolución del ánimo** (SVG propio) está inspirado conceptualmente en el proyecto open-source [Voice-Journal](https://github.com/JuampiHernandez/Voice-Journal) (MIT); el código es nuestro.

El resto (capa de datos Arkiv, cifrado, API routes, integración de voz, UI, deck) es original de este proyecto.

## La coach

La voz con la que hablás se llama **Luna**. Susurro es la plataforma; Luna es la compañera.

## Licencia

MIT
