"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "es" | "en";

// ---------------------------------------------------------------------------
// Dictionary — ES source of truth, EN must mirror every key (TS enforces it).
// Keys are flat/namespaced ("section.field") for readability.
// ---------------------------------------------------------------------------

const es = {
  // ---- language switcher ----
  "lang.toEN": "EN",
  "lang.toES": "ES",
  "lang.ariaLabel": "Cambiar idioma",

  // ---- nav / footer ----
  "footer.disclaimer": "Susurro, no reemplaza a un terapeuta profesional",
  "footer.home": "inicio",
  "footer.launchApp": "Lanzar app",
  "footer.pitch": "Pitch deck",
  "footer.github": "GitHub",

  // ---- landing — hero ----
  "landing.heroTagline":
    "Un compañero de bienestar con voz. Lo que le contás vive cifrado — y es tuyo, no de una plataforma.",
  "landing.launchApp": "Lanzar la app →",
  "landing.viewPitch": "Ver el pitch",
  "landing.poweredBy": "Powered by",

  // ---- landing — problem ----
  "landing.problemKicker": "El problema",
  "landing.problemH2":
    "La gente ya usa la IA como terapeuta. Pero tiene que elegir.",
  "landing.problemStat1": "Uso de IA generativa en 2025: terapia y compañía (Harvard Business Review).",
  "landing.problemStat2": "De todo el uso de IA — casi el doble que en 2024.",
  "landing.problemBody1":
    "ChatGPT tiene un chat efímero para hablar de cosas sensibles, pero sin memoria no hay contexto. Hoy elegís: ",
  "landing.problemBodyHighlight": "o privacidad, o continuidad",
  "landing.problemBody2": ". Susurro te da las dos.",

  // ---- landing — product section ----
  "landing.productKicker": "El producto",
  "landing.productH2": "Hablás con Luna. Tu semana queda cifrada y tuya.",
  "landing.productTagline":
    "Check-ins de 3 minutos por voz. Susurro arma tu racha, ve tus patrones y te sugiere pasos chiquitos — todo cifrado de punta a punta.",

  // ---- landing — how it works ----
  "landing.howKicker": "Cómo funciona",
  "landing.how1Title": "Hablás con Luna",
  "landing.how1Desc":
    "Un coach de voz natural, cálido, en argentino. Check-ins de 3 minutos.",
  "landing.how2Title": "Se cifra y vive en Arkiv",
  "landing.how2Desc":
    "Lo que decís se cifra en tu navegador con una llave derivada de tu wallet.",
  "landing.how3Title": "Vos tenés el control",
  "landing.how3Desc":
    "Le das acceso por tiempo limitado, lo cortás y borrás tu data cuando querés.",

  // ---- landing — why arkiv ----
  "landing.whyArkivKicker": "Por qué Arkiv",
  "landing.whyArkivBody":
    "Tu memoria vive en Arkiv: consultable, con expiración nativa y borrado real. Solo tu wallet descifra tu contenido — ni siquiera nuestro servidor puede leerlo.",

  // ---- landing — final CTA ----
  "landing.finalCtaH2": "Tu confianza es tuya.",

  // ---- product showcase (shared) ----
  "showcase.mockVos": "vos",
  "showcase.mockLuna": "luna",
  "showcase.mockVosMsg":
    "Hoy ando en un cuatro… discutí con mi pareja y me quedó dando vueltas todo el día.",
  "showcase.mockLunaReply":
    "Qué feo cuando una charla queda picando. Lo anoto. ¿Pasó algo puntual o se fue escalando solo?",
  "showcase.checkinFooter": "check-in de 3 min · voz natural (ElevenLabs)",
  "showcase.recsHeading": "Recomendaciones para esta semana · generado con",
  "showcase.aiGateway": "AI Gateway",
  "showcase.rec1":
    "Retomá la charla con tu pareja desde lo que sentís, no desde el cansancio.",
  "showcase.rec2": "Repetí esas cenas con amigos: es lo que más te recarga.",
  "showcase.rec3":
    "En las noches bajón, dejá el teléfono lejos 20 minutos antes de dormir.",

  // ---- stats labels (streak/registros/hoy) ----
  "stats.daysInRow": "días seguidos",
  "stats.dayInRow": "día seguido",
  "stats.entries": "registros",
  "stats.today": "hoy",

  // ---- mood timeline ----
  "timeline.heading": "Tu ánimo",
  "timeline.lastNDays": "últimos {n} días",

  // ---- threads ----
  "threads.worries": "Lo que te preocupa",
  "threads.brights": "Lo que te hace bien",

  // ---- recommendations card ----
  "recs.heading": "Para esta semana",
  "recs.generatedWith": "generado con",
  "recs.thinking": "Pensando recomendaciones para vos…",
  "recs.crisis":
    "No reemplaza ayuda profesional. Si la estás pasando mal, en Argentina llamá al 135.",
  "recs.markDone": "Marcar como hecho",
  "recs.dismiss": "Descartar",

  // ---- deck ----
  "deck.navHint": "← → para navegar · ESC vuelve al inicio",
  "deck.poweredBy": "Powered by",
  "deck.heroTagline":
    "Un coach de bienestar con voz. Tu memoria vive cifrada — y es tuya.",
  "deck.heroFooter": "Puna Tech 2026",
  "deck.source": "fuente",

  // slide: Salta / loneliness
  "deck.saltaKicker": "Por qué importa",
  "deck.saltaTitle":
    "Salta tiene una de las tasas de suicidio más altas de Argentina.",
  "deck.saltaStat1Big": "2×",
  "deck.saltaStat1Text":
    "Salta duplica el promedio nacional: 13,5 vs 6,7 suicidios por 100.000 hab.",
  "deck.saltaStat2Big": "65%",
  "deck.saltaStat2Text":
    "De los intentos en la provincia son jóvenes de 19 a 29 años.",
  "deck.saltaBullet1":
    "La {{accent}} son factores de riesgo reconocidos — la OMS declaró la soledad una amenaza para la salud global (2023).",
  "deck.saltaBullet1Accent": "soledad y el aislamiento social",
  "deck.saltaBullet2":
    "Falta un espacio íntimo, sin juicio y disponible siempre para hablar de cómo uno se siente.",

  // slide: Problem
  "deck.problemKicker": "El problema",
  "deck.problemTitle":
    "La gente ya usa la IA como terapeuta. Pero tiene que elegir: privacidad o memoria.",
  "deck.problemStat1Big": "#1",
  "deck.problemStat1Label": "Terapia y compañía",
  "deck.problemStat1Text":
    "Uso de IA generativa en 2025 (Harvard Business Review)",
  "deck.problemStat2Big": "−30%",
  "deck.problemStat2Text":
    "Hacer journaling a diario baja los síntomas de depresión en 8 semanas (escritura expresiva)",
  "deck.problemBullet1":
    "La gente recurre a la IA para procesar duelo, ansiedad y soledad, sin miedo al juicio y a cualquier hora.",
  "deck.problemBullet2":
    "ChatGPT ofrece un “chat efímero” para hablar de temas sensibles sin que se guarden — pero sin memoria, no hay contexto ni seguimiento.",
  "deck.problemBullet3":
    "El dilema: {{accent}}. Hoy no podés tener las dos.",
  "deck.problemBullet3Accent": "o privacidad, o continuidad",

  // slide: Solution
  "deck.solutionKicker": "La solución",
  "deck.solutionTitle": "Susurro: voz + memoria cifrada que es tuya.",
  "deck.solutionBody":
    "Un coach de bienestar con voz cuya memoria vive cifrada en Arkiv y es 100% del usuario. Privacidad {{accent}} continuidad.",
  "deck.solutionBodyAccent": "y",
  "deck.solutionBullet1":
    "Hablás con voz natural; el contexto persiste entre sesiones.",
  "deck.solutionBullet2":
    "Todo se cifra en tu navegador con una llave derivada de tu wallet.",
  "deck.solutionBullet3":
    "Le das acceso al coach por el tiempo que querés — y lo cortás cuando querés.",
  "deck.solutionBullet4":
    "Ves tu data, borrás registros uno por uno o todo de una.",

  // slide: Product — conversation
  "deck.prodConvoKicker": "El producto",
  "deck.prodConvoTitle": "Hablás con Luna, una coach con voz.",
  "deck.prodConvoTimer": "2:45 restantes · check-in de 3 min",
  "deck.prodConvoFooter":
    "Voz natural (ElevenLabs). Lo que registrás se cifra en tu navegador y se guarda en Arkiv.",

  // slide: Product — dashboard
  "deck.prodDashKicker": "El producto",
  "deck.prodDashTitle": "Tu semana, cifrada y tuya.",

  // slide: How it works
  "deck.howKicker": "Cómo funciona",
  "deck.howTitle": "Voz que entiende, memoria que es tuya.",
  "deck.howFlow1": "ElevenLabs recibe y transcribe tu audio",
  "deck.howFlow2": "se cifra en tu navegador",
  "deck.howFlow3": "Arkiv guarda el dato (la app paga el gas fee, vos no)",
  "deck.howFlow4": "el coach te responde por voz",
  "deck.howStackLabel": "Stack",

  // slide: Why Arkiv
  "deck.arkivKicker": "Por qué Arkiv",
  "deck.arkivTitle": "La capa de datos correcta para esto.",
  "deck.arkivBullet1Bold": "expiresIn",
  "deck.arkivBullet1Rest":
    " nativo: el acceso se auto-revoca por primitiva, no por lógica de app. Único de Arkiv.",
  "deck.arkivBullet2Bold": "Atributos consultables",
  "deck.arkivBullet2Rest":
    ": el coach pide solo lo que necesita; el payload sensible queda cifrado.",
  "deck.arkivBullet3Bold": "$creator inmutable",
  "deck.arkivBullet3Rest":
    ": cada lectura del coach queda en un registro verificable.",
  "deck.arkivBullet4Bold": "Borrado real + pruning",
  "deck.arkivBullet4Rest":
    ": cuando borrás, se elimina del estado y se poda. Y siempre fue ciphertext.",

  // slide: Tracks
  "deck.tracksKicker": "Arkiv × Puna Tech",
  "deck.tracksTitle": "Unimos las tres verticales del track.",
  "deck.tracks1Bold": "Memoria de IA que es tuya",
  "deck.tracks1Rest":
    " — el contexto del coach vive cifrado y es propiedad del usuario.",
  "deck.tracks2Bold": "Procedencia y auditoría de IA",
  "deck.tracks2Rest":
    " — registro público y verificable de cada acceso del coach.",
  "deck.tracks3Bold": "Capa de datos personales",
  "deck.tracks3Rest":
    " — el usuario otorga y revoca permiso de lectura con un click.",

  // slide: Business model
  "deck.bizKicker": "Modelo de negocio",
  "deck.bizTitle":
    "El plan cubre el costo de voz y deja ganancia desde el día cero.",
  "deck.bizDesc":
    "El único costo real es la voz: ~$0.06 por minuto (con 95% off en los silencios de una charla reflexiva).",
  "deck.bizColPlan": "Plan",
  "deck.bizColUsage": "Uso",
  "deck.bizColPrice": "Precio",
  "deck.bizColVoiceCost": "Costo voz",
  "deck.bizColProfit": "Ganancia",
  "deck.bizPlanCasual": "Casual",
  "deck.bizPlanRegular": "Regular",
  "deck.bizPlanPower": "Power",
  "deck.bizUsage1": "~2 min/día",
  "deck.bizUsage2": "~6 min/día",
  "deck.bizUsage3": "~14 min/día",
  "deck.bizFooter":
    "Cada usuario que paga su plan cubre sus minutos de ElevenLabs y deja margen. Rentable por usuario desde el primer mes.",

  // slide: Roadmap V2
  "deck.roadmapKicker": "V2 · Roadmap",
  "deck.roadmapTitle": "V2: empezamos a cobrar por uso, sobre Celo.",
  "deck.roadmap1Bold": "Pagos por uso en USDT sobre Celo",
  "deck.roadmap1Rest":
    " (x402 + fee abstraction): el usuario paga sin tocar gas ni tokens nativos.",
  "deck.roadmap2Bold": "Distribución vía MiniPay",
  "deck.roadmap2Rest":
    ": lanzamos como Mini App, con acceso a {{accent}} — un caso de uso masivo para Arkiv.",
  "deck.roadmap2Accent": "+16M de usuarios",
  "deck.roadmap3Bold": "Identidad ERC-8004 del coach:",
  "deck.roadmap3Rest":
    " wallet propia + reputación verificable derivada de los access logs de Arkiv.",

  // slide: Builder
  "deck.builderKicker": "Sobre el builder",
  "deck.builderTitle": "Arturo Grande — Product Builder.",
  "deck.builder1":
    "Salteño. Escaló una fintech de $5M a $65M USD procesados en 3 años.",
  "deck.builder2Pre": "Lanzó una Mini App web3 con ",
  "deck.builder2Accent": "+1.000 usuarios en 40 países",
  "deck.builder2Post": ".",
  "deck.builder3":
    "9 hackathons ganados: Celo, Polkadot, ETHGlobal, Avalanche, GenLayer, Worldcoin, Stellar.",
  "deck.builder4":
    "Podcast de tecnología +250k reproducciones · fundador de desafia.tech.",

  // slide: Close
  "deck.closeTitle": "Tu registro emocional es tuyo.",
  "deck.closeSub": "Gracias por tu atención.",
  "deck.closeLinkDemo": "Demo en vivo → susurro-nine.vercel.app",
  "deck.closeLinkCode": "Código → github.com/artugrande/susurro",
  "deck.closeLinkTwitter": "Twitter → @ArtuGrande",

  // ---- auth (connect button) ----
  "auth.signIn": "Ingresá con tu email",
  "auth.loading": "Cargando…",
  "auth.startTalking": "Empezá a hablar con Luna",
  "auth.encrypting": "Cifrando tu espacio…",
  "auth.pillTooltip": "Ver mi cuenta",

  // ---- account modal ----
  "account.title": "Estás conectado a esta cuenta",
  "account.body":
    "Tu espacio está cifrado y solo vos podés leerlo. Tu wallet es self-custodial — la creaste vos, no una plataforma.",
  "account.signOut": "Cerrar sesión",
  "account.stay": "Seguir conectado",
  "account.signedOutToast": "Te deslogueaste correctamente.",

  // ---- experience (login screen tagline) ----
  "experience.tagline1":
    "Un compañero de IA con voz que te escucha. Lo que le contás vive cifrado y es tuyo — no de una plataforma.",
  "experience.tagline2":
    "Tu memoria de conversaciones vive en Arkiv. Le das acceso por el tiempo que vos quieras, y lo cortás cuando quieras.",

  // ---- conversation ----
  "conv.tapToStart": "Tocá la esfera para empezar tu check-in de 3 minutos",
  "conv.connecting": "Conectando con Luna…",
  "conv.lunaSpeaking": "Luna está hablando…",
  "conv.lunaListening": "Luna te escucha…",
  "conv.remaining": "restantes",
  "conv.talkWithLuna": "Hablar con Luna",
  "conv.connectingShort": "Conectando…",
  "conv.endConversation": "Terminar conversación",
  "conv.startBtnAria": "Empezar a hablar con Luna",
  "conv.transcriptYou": "vos",
  "conv.transcriptSusurro": "susurro",

  "conv.welcomeTitle": "Hola, soy Luna 🌙",
  "conv.welcome1":
    "Soy tu compañera para pensar en voz alta — no reemplazo a un terapeuta.",
  "conv.welcome2Pre": "Todo lo que hablemos se guarda ",
  "conv.welcome2Accent": "cifrado con tu llave",
  "conv.welcome2Post": ". Solo vos podés leerlo.",
  "conv.welcome3Pre": "El check-in dura ",
  "conv.welcome3Accent": "3 minutos",
  "conv.welcome3Post": ". Cortás cuando quieras.",
  "conv.welcomeCta": "Empezar a hablar",

  "conv.toolError":
    "Tuve un problema técnico al guardar eso, pero seguimos hablando.",
  "conv.toolMoodOk":
    "Listo, guardé tu registro de ánimo cifrado en Arkiv.",
  "conv.toolJournalOk": "Guardé esa entrada en tu diario, cifrada.",
  "conv.toolGrantOk": "Acceso otorgado por {hours} hora(s) a: {scopes}.",
  "conv.toolNoAccessMood":
    "No tengo acceso a tus registros de ánimo. Pedile permiso al usuario con request_access.",
  "conv.toolNoAccessJournal":
    "No tengo acceso a tu diario. Pedile permiso al usuario con request_access.",
  "conv.toolNoMoods": "No hay registros de ánimo en ese período.",
  "conv.toolNoJournals": "No hay entradas de diario en ese período.",
  "conv.toolNoteSavingMood": "guardando ánimo",
  "conv.toolNoteSavingJournal": "guardando en el diario",
  "conv.toolNoteAsking": "pidiendo acceso",
  "conv.toolNoteRecallMood": "consultando ánimo",
  "conv.toolNoteRecallJournal": "consultando diario",

  // ---- my data dashboard ----
  "mydata.header": "Mis registros",
  "mydata.sub": "Cifrados con tu llave. Solo vos podés leerlos.",
  "mydata.empty":
    "Todavía no guardaste nada. Hablá con Luna y lo que registres aparece acá.",
  "mydata.colMood": "Ánimo",
  "mydata.colShared": "Qué compartiste",
  "mydata.noNote": "(sin nota)",
  "mydata.deleteRow": "Eliminar este registro",
  "mydata.deleteAll": "Eliminar todo y revocar el acceso",
  "mydata.confirmTitle": "¿Eliminar todo?",
  "mydata.confirmDesc":
    "Se borran todos tus registros y se corta cualquier acceso de Susurro. Esta acción no se puede deshacer.",
  "mydata.confirmYes": "Sí, eliminar todo",
  "mydata.confirmCancel": "Cancelar",
  "mydata.confirmDeleting": "Eliminando…",
  "mydata.toastRowDeleted": "Registro eliminado de Arkiv",
  "mydata.toastRowDeleteFail": "No se pudo eliminar. Reintentá.",
  "mydata.toastAllDeleted": "Eliminé todo: {n} {label} y accesos",
  "mydata.toastAllNothing": "No quedaba nada para eliminar",
  "mydata.toastAllFail": "No se pudo eliminar todo. Reintentá.",
  "mydata.entryOne": "registro",
  "mydata.entryMany": "registros",
  "mydata.explorerNote":
    "🔒 Cada registro vive cifrado en Arkiv (testnet BRAGA) — solo tu wallet puede descifrarlo. Cada vez que guardás algo, es una transacción real on-chain. ",
  "mydata.explorerLink": "Ver las transacciones de Susurro en Arkiv ↗",

  // ---- weekly recap ----
  "recap.heading": "Resumen de tu semana",
  "recap.play": "Reproducir",
  "recap.pause": "Pausar",
  "recap.generating": "Generando…",
  "recap.audioNote": "Resumen en audio · voz IA",
  "recap.audioError": "No pude generar el audio. Reintentá.",
  "recap.empty":
    "Todavía no hay registros esta semana. Hacé un check-in conmigo y te armo tu resumen.",

  // recap dynamic text fragments (assembled in lib/stats.ts)
  "recap.thisWeekN": "Esta semana registraste {n} {label}.",
  "recap.momentOne": "momento",
  "recap.momentMany": "momentos",
  "recap.avgLine": " Tu ánimo promedió {avg} sobre 10.",
  "recap.trendUp":
    " Venís de menos a más: el cierre de semana te encontró mejor.",
  "recap.trendDown":
    " La semana se fue poniendo más cuesta arriba hacia el final.",
  "recap.trendFlat": " Te mantuviste bastante estable.",
  "recap.topTags": " Lo que más apareció: {tags}.",
  "recap.thanks": " Gracias por hacerte este espacio.",

  // ---- seed button ----
  "seed.idle": "Cargar una semana de datos de ejemplo",
  "seed.loading": "Cargando datos cifrados…",
  "seed.done": "✓ Datos de ejemplo cargados",
  "seed.error": "Error — reintentar",
  "seed.txLink": "Ver la transacción en Arkiv ↗",

  // ---- grant chip ----
  "grant.scopeMood": "Ánimo",
  "grant.scopeJournal": "Diario",
  "grant.scopeInsight": "Observaciones",
  "grant.open": "Acceso ABIERTO",
  "grant.canRead": "Susurro puede leer: ",
  "grant.cutNow": "🔴 Cortar acceso ahora",
  "grant.cutting": "Cortando…",
} as const;

// Keys from the ES dictionary; values widened to `string` so EN can use
// different text per key (otherwise `as const` would force EN to use the
// exact same literal strings as ES).
type Dict = { [K in keyof typeof es]: string };
type Key = keyof Dict;

const en: Dict = {
  // ---- language switcher ----
  "lang.toEN": "EN",
  "lang.toES": "ES",
  "lang.ariaLabel": "Change language",

  // ---- nav / footer ----
  "footer.disclaimer": "Susurro doesn't replace a professional therapist",
  "footer.home": "home",
  "footer.launchApp": "Launch app",
  "footer.pitch": "Pitch deck",
  "footer.github": "GitHub",

  // ---- landing — hero ----
  "landing.heroTagline":
    "A voice-based wellbeing companion. What you share is encrypted — and it's yours, not a platform's.",
  "landing.launchApp": "Launch the app →",
  "landing.viewPitch": "See the pitch",
  "landing.poweredBy": "Powered by",

  // ---- landing — problem ----
  "landing.problemKicker": "The problem",
  "landing.problemH2":
    "People are already using AI as a therapist. But they have to choose.",
  "landing.problemStat1":
    "Top use of generative AI in 2025: therapy and companionship (Harvard Business Review).",
  "landing.problemStat2": "Of all AI usage — nearly double 2024.",
  "landing.problemBody1":
    "ChatGPT has an ephemeral chat for sensitive things, but with no memory there's no context. Today you have to choose: ",
  "landing.problemBodyHighlight": "privacy or continuity",
  "landing.problemBody2": ". Susurro gives you both.",

  // ---- landing — product section ----
  "landing.productKicker": "The product",
  "landing.productH2": "Talk to Luna. Your week stays encrypted and yours.",
  "landing.productTagline":
    "3-minute voice check-ins. Susurro tracks your streak, sees your patterns, and suggests small steps — all end-to-end encrypted.",

  // ---- landing — how it works ----
  "landing.howKicker": "How it works",
  "landing.how1Title": "Talk to Luna",
  "landing.how1Desc":
    "A warm, natural voice coach. 3-minute check-ins.",
  "landing.how2Title": "Encrypted and stored on Arkiv",
  "landing.how2Desc":
    "What you say is encrypted in your browser with a key derived from your wallet.",
  "landing.how3Title": "You're in control",
  "landing.how3Desc":
    "You grant access for a limited time, cut it off, and delete your data whenever you want.",

  // ---- landing — why arkiv ----
  "landing.whyArkivKicker": "Why Arkiv",
  "landing.whyArkivBody":
    "Your memory lives on Arkiv: queryable, with native expiration and real deletion. Only your wallet decrypts your content — not even our server can read it.",

  // ---- landing — final CTA ----
  "landing.finalCtaH2": "Your trust is yours.",

  // ---- product showcase (shared) ----
  "showcase.mockVos": "you",
  "showcase.mockLuna": "luna",
  "showcase.mockVosMsg":
    "Today I'm at about a four… I had a fight with my partner and it stuck with me all day.",
  "showcase.mockLunaReply":
    "It's rough when a conversation lingers. I'm noting it. Was there something specific, or did it slowly escalate?",
  "showcase.checkinFooter": "3-min check-in · natural voice (ElevenLabs)",
  "showcase.recsHeading": "Recommendations for this week · generated with",
  "showcase.aiGateway": "AI Gateway",
  "showcase.rec1":
    "Bring up the conversation with your partner from what you feel, not from exhaustion.",
  "showcase.rec2":
    "Repeat those dinners with friends — it's what recharges you most.",
  "showcase.rec3":
    "On low nights, keep your phone away for 20 minutes before sleep.",

  // ---- stats labels ----
  "stats.daysInRow": "days in a row",
  "stats.dayInRow": "day in a row",
  "stats.entries": "entries",
  "stats.today": "today",

  // ---- mood timeline ----
  "timeline.heading": "Your mood",
  "timeline.lastNDays": "last {n} days",

  // ---- threads ----
  "threads.worries": "What's weighing on you",
  "threads.brights": "What lifts you up",

  // ---- recommendations card ----
  "recs.heading": "For this week",
  "recs.generatedWith": "generated with",
  "recs.thinking": "Thinking up recommendations…",
  "recs.crisis":
    "Not a replacement for professional help. If you're struggling, in Argentina call 135; in the US text 988.",
  "recs.markDone": "Mark as done",
  "recs.dismiss": "Dismiss",

  // ---- deck ----
  "deck.navHint": "← → to navigate · ESC returns home",
  "deck.poweredBy": "Powered by",
  "deck.heroTagline":
    "A voice-based wellbeing coach. Your memory lives encrypted — and it's yours.",
  "deck.heroFooter": "Puna Tech 2026",
  "deck.source": "source",

  // slide: Salta
  "deck.saltaKicker": "Why it matters",
  "deck.saltaTitle":
    "Salta has one of the highest suicide rates in Argentina.",
  "deck.saltaStat1Big": "2×",
  "deck.saltaStat1Text":
    "Salta doubles the national average: 13.5 vs 6.7 suicides per 100,000 people.",
  "deck.saltaStat2Big": "65%",
  "deck.saltaStat2Text":
    "Of attempts in the province are young people aged 19 to 29.",
  "deck.saltaBullet1":
    "{{accent}} are recognized risk factors — the WHO declared loneliness a global health threat (2023).",
  "deck.saltaBullet1Accent": "Loneliness and social isolation",
  "deck.saltaBullet2":
    "There's no intimate, judgment-free space available anytime to talk about how you feel.",

  // slide: Problem
  "deck.problemKicker": "The problem",
  "deck.problemTitle":
    "People already use AI as a therapist. But they have to choose: privacy or memory.",
  "deck.problemStat1Big": "#1",
  "deck.problemStat1Label": "Therapy & companionship",
  "deck.problemStat1Text":
    "Top use of generative AI in 2025 (Harvard Business Review)",
  "deck.problemStat2Big": "−30%",
  "deck.problemStat2Text":
    "Daily journaling reduces depression symptoms in 8 weeks (expressive writing)",
  "deck.problemBullet1":
    "People turn to AI to process grief, anxiety and loneliness — no judgment, any hour.",
  "deck.problemBullet2":
    "ChatGPT offers an \"ephemeral chat\" for sensitive topics that isn't saved — but with no memory, there's no context or follow-up.",
  "deck.problemBullet3":
    "The dilemma: {{accent}}. Today you can't have both.",
  "deck.problemBullet3Accent": "privacy or continuity",

  // slide: Solution
  "deck.solutionKicker": "The solution",
  "deck.solutionTitle":
    "Susurro: voice + encrypted memory that's yours.",
  "deck.solutionBody":
    "A voice-based wellbeing coach whose memory lives encrypted on Arkiv and is 100% the user's. Privacy {{accent}} continuity.",
  "deck.solutionBodyAccent": "and",
  "deck.solutionBullet1":
    "You speak with natural voice; context persists across sessions.",
  "deck.solutionBullet2":
    "Everything is encrypted in your browser with a key derived from your wallet.",
  "deck.solutionBullet3":
    "You grant the coach access for as long as you want — and cut it off whenever you want.",
  "deck.solutionBullet4":
    "You see your data and delete entries one by one or all at once.",

  // slide: Product — conversation
  "deck.prodConvoKicker": "The product",
  "deck.prodConvoTitle": "Talk to Luna, a coach with voice.",
  "deck.prodConvoTimer": "2:45 remaining · 3-min check-in",
  "deck.prodConvoFooter":
    "Natural voice (ElevenLabs). What you log is encrypted in your browser and stored on Arkiv.",

  // slide: Product — dashboard
  "deck.prodDashKicker": "The product",
  "deck.prodDashTitle": "Your week, encrypted and yours.",

  // slide: How it works
  "deck.howKicker": "How it works",
  "deck.howTitle": "Voice that understands, memory that's yours.",
  "deck.howFlow1": "ElevenLabs receives and transcribes your audio",
  "deck.howFlow2": "encrypted in your browser",
  "deck.howFlow3": "Arkiv stores the data (the app pays the gas fee, not you)",
  "deck.howFlow4": "the coach replies by voice",
  "deck.howStackLabel": "Stack",

  // slide: Why Arkiv
  "deck.arkivKicker": "Why Arkiv",
  "deck.arkivTitle": "The right data layer for this.",
  "deck.arkivBullet1Bold": "expiresIn",
  "deck.arkivBullet1Rest":
    " native: access auto-revokes by primitive, not by app logic. Unique to Arkiv.",
  "deck.arkivBullet2Bold": "Queryable attributes",
  "deck.arkivBullet2Rest":
    ": the coach asks only for what it needs; the sensitive payload stays encrypted.",
  "deck.arkivBullet3Bold": "Immutable $creator",
  "deck.arkivBullet3Rest":
    ": every read by the coach lands in a verifiable log.",
  "deck.arkivBullet4Bold": "Real deletion + pruning",
  "deck.arkivBullet4Rest":
    ": when you delete, it's gone from state and pruned. And it was always ciphertext.",

  // slide: Tracks
  "deck.tracksKicker": "Arkiv × Puna Tech",
  "deck.tracksTitle": "We hit all three track verticals.",
  "deck.tracks1Bold": "AI memory that's yours",
  "deck.tracks1Rest":
    " — the coach's context lives encrypted and is owned by the user.",
  "deck.tracks2Bold": "AI provenance & auditability",
  "deck.tracks2Rest":
    " — public, verifiable log of every coach access.",
  "deck.tracks3Bold": "Personal data layer",
  "deck.tracks3Rest":
    " — the user grants and revokes read permission with a click.",

  // slide: Business model
  "deck.bizKicker": "Business model",
  "deck.bizTitle": "Each plan covers voice cost and turns a profit from day one.",
  "deck.bizDesc":
    "The only real cost is voice: ~$0.06 per minute (with 95% off in the silences of a reflective chat).",
  "deck.bizColPlan": "Plan",
  "deck.bizColUsage": "Usage",
  "deck.bizColPrice": "Price",
  "deck.bizColVoiceCost": "Voice cost",
  "deck.bizColProfit": "Profit",
  "deck.bizPlanCasual": "Casual",
  "deck.bizPlanRegular": "Regular",
  "deck.bizPlanPower": "Power",
  "deck.bizUsage1": "~2 min/day",
  "deck.bizUsage2": "~6 min/day",
  "deck.bizUsage3": "~14 min/day",
  "deck.bizFooter":
    "Every paying user covers their ElevenLabs minutes and leaves margin. Profitable per user from month one.",

  // slide: Roadmap V2
  "deck.roadmapKicker": "V2 · Roadmap",
  "deck.roadmapTitle": "V2: start charging per use, on Celo.",
  "deck.roadmap1Bold": "Pay-per-use in USDT on Celo",
  "deck.roadmap1Rest":
    " (x402 + fee abstraction): the user pays without touching gas or native tokens.",
  "deck.roadmap2Bold": "Distribution via MiniPay",
  "deck.roadmap2Rest":
    ": we launch as a Mini App, reaching {{accent}} — a massive use case for Arkiv.",
  "deck.roadmap2Accent": "+16M users",
  "deck.roadmap3Bold": "ERC-8004 coach identity:",
  "deck.roadmap3Rest":
    " its own wallet + verifiable reputation derived from Arkiv access logs.",

  // slide: Builder
  "deck.builderKicker": "About the builder",
  "deck.builderTitle": "Arturo Grande — Product Builder.",
  "deck.builder1":
    "From Salta. Scaled a fintech from $5M to $65M USD processed in 3 years.",
  "deck.builder2Pre": "Launched a web3 Mini App with ",
  "deck.builder2Accent": "+1,000 users across 40 countries",
  "deck.builder2Post": ".",
  "deck.builder3":
    "9 hackathon wins: Celo, Polkadot, ETHGlobal, Avalanche, GenLayer, Worldcoin, Stellar.",
  "deck.builder4":
    "Tech podcast with +250k plays · founder of desafia.tech.",

  // slide: Close
  "deck.closeTitle": "Your emotional log is yours.",
  "deck.closeSub": "Thanks for your attention.",
  "deck.closeLinkDemo": "Live demo → susurro-nine.vercel.app",
  "deck.closeLinkCode": "Code → github.com/artugrande/susurro",
  "deck.closeLinkTwitter": "Twitter → @ArtuGrande",

  // ---- auth ----
  "auth.signIn": "Sign in with email",
  "auth.loading": "Loading…",
  "auth.startTalking": "Start talking with Luna",
  "auth.encrypting": "Encrypting your space…",
  "auth.pillTooltip": "View account",

  // ---- account modal ----
  "account.title": "You're signed in to this account",
  "account.body":
    "Your space is encrypted and only you can read it. Your wallet is self-custodial — you created it, not a platform.",
  "account.signOut": "Sign out",
  "account.stay": "Stay signed in",
  "account.signedOutToast": "Signed out successfully.",

  // ---- experience ----
  "experience.tagline1":
    "A voice-based AI companion that listens. What you share is encrypted and yours — not a platform's.",
  "experience.tagline2":
    "Your conversation memory lives on Arkiv. You grant access for as long as you want, and cut it off whenever you want.",

  // ---- conversation ----
  "conv.tapToStart": "Tap the orb to start your 3-minute check-in",
  "conv.connecting": "Connecting to Luna…",
  "conv.lunaSpeaking": "Luna is speaking…",
  "conv.lunaListening": "Luna is listening…",
  "conv.remaining": "remaining",
  "conv.talkWithLuna": "Talk to Luna",
  "conv.connectingShort": "Connecting…",
  "conv.endConversation": "End conversation",
  "conv.startBtnAria": "Start talking to Luna",
  "conv.transcriptYou": "you",
  "conv.transcriptSusurro": "susurro",

  "conv.welcomeTitle": "Hi, I'm Luna 🌙",
  "conv.welcome1":
    "I'm here to help you think out loud — I don't replace a therapist.",
  "conv.welcome2Pre": "Everything we talk about is saved ",
  "conv.welcome2Accent": "encrypted with your key",
  "conv.welcome2Post": ". Only you can read it.",
  "conv.welcome3Pre": "The check-in lasts ",
  "conv.welcome3Accent": "3 minutes",
  "conv.welcome3Post": ". You can stop whenever you want.",
  "conv.welcomeCta": "Start talking",

  "conv.toolError":
    "I had a technical hiccup saving that, but let's keep talking.",
  "conv.toolMoodOk": "Done — I saved your mood check-in, encrypted, on Arkiv.",
  "conv.toolJournalOk": "I saved that journal entry, encrypted.",
  "conv.toolGrantOk": "Access granted for {hours} hour(s) to: {scopes}.",
  "conv.toolNoAccessMood":
    "I don't have access to your mood logs. Ask the user for permission via request_access.",
  "conv.toolNoAccessJournal":
    "I don't have access to your journal. Ask the user for permission via request_access.",
  "conv.toolNoMoods": "No mood logs in that period.",
  "conv.toolNoJournals": "No journal entries in that period.",
  "conv.toolNoteSavingMood": "saving mood",
  "conv.toolNoteSavingJournal": "saving journal entry",
  "conv.toolNoteAsking": "requesting access",
  "conv.toolNoteRecallMood": "reading mood",
  "conv.toolNoteRecallJournal": "reading journal",

  // ---- my data ----
  "mydata.header": "My entries",
  "mydata.sub": "Encrypted with your key. Only you can read them.",
  "mydata.empty":
    "Nothing saved yet. Talk to Luna and whatever you log will appear here.",
  "mydata.colMood": "Mood",
  "mydata.colShared": "What you shared",
  "mydata.noNote": "(no note)",
  "mydata.deleteRow": "Delete this entry",
  "mydata.deleteAll": "Delete everything and revoke access",
  "mydata.confirmTitle": "Delete everything?",
  "mydata.confirmDesc":
    "All your entries will be deleted and any Susurro access will be cut. This can't be undone.",
  "mydata.confirmYes": "Yes, delete everything",
  "mydata.confirmCancel": "Cancel",
  "mydata.confirmDeleting": "Deleting…",
  "mydata.toastRowDeleted": "Entry deleted from Arkiv",
  "mydata.toastRowDeleteFail": "Couldn't delete. Try again.",
  "mydata.toastAllDeleted": "Deleted everything: {n} {label} and access grants",
  "mydata.toastAllNothing": "Nothing to delete",
  "mydata.toastAllFail": "Couldn't delete everything. Try again.",
  "mydata.entryOne": "entry",
  "mydata.entryMany": "entries",
  "mydata.explorerNote":
    "🔒 Every entry lives encrypted on Arkiv (BRAGA testnet) — only your wallet can decrypt it. Every save is a real on-chain transaction. ",
  "mydata.explorerLink": "See Susurro's transactions on Arkiv ↗",

  // ---- weekly recap ----
  "recap.heading": "Your week summary",
  "recap.play": "Play",
  "recap.pause": "Pause",
  "recap.generating": "Generating…",
  "recap.audioNote": "Audio summary · AI voice",
  "recap.audioError": "Couldn't generate audio. Try again.",
  "recap.empty":
    "No entries this week yet. Do a check-in with me and I'll put together your summary.",
  "recap.thisWeekN": "This week you logged {n} {label}.",
  "recap.momentOne": "moment",
  "recap.momentMany": "moments",
  "recap.avgLine": " Your mood averaged {avg} out of 10.",
  "recap.trendUp":
    " You moved from less to more: the end of the week found you better.",
  "recap.trendDown":
    " The week grew steeper toward the end.",
  "recap.trendFlat": " You stayed pretty steady.",
  "recap.topTags": " What came up most: {tags}.",
  "recap.thanks": " Thanks for giving yourself this space.",

  // ---- seed ----
  "seed.idle": "Load a week of sample data",
  "seed.loading": "Loading encrypted data…",
  "seed.done": "✓ Sample data loaded",
  "seed.error": "Error — retry",
  "seed.txLink": "View the transaction on Arkiv ↗",

  // ---- grant chip ----
  "grant.scopeMood": "Mood",
  "grant.scopeJournal": "Journal",
  "grant.scopeInsight": "Insights",
  "grant.open": "Access OPEN",
  "grant.canRead": "Susurro can read: ",
  "grant.cutNow": "🔴 Cut access now",
  "grant.cutting": "Cutting…",
};

// ---------------------------------------------------------------------------
// Tiny template — replaces `{name}` with the value at vars.name.
// ---------------------------------------------------------------------------
function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

// ---------------------------------------------------------------------------
// React context — locale state + t() function, persisted in localStorage.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "susurro.locale";

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translate a key, optionally with {name} variable substitution. */
  t: (k: Key, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  // Hydrate from localStorage / browser language on mount (client-only).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "es") {
        setLocaleState(saved);
        return;
      }
      const browser = (navigator.language || "").slice(0, 2).toLowerCase();
      if (browser === "en") setLocaleState("en");
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (k: Key, vars?: Record<string, string | number>) => {
      const dict = locale === "en" ? en : es;
      const raw = dict[k] ?? es[k];
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<I18nCtx>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
