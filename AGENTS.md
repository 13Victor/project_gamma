<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Convenciones del proyecto

`spec.md` define QUÉ se construye; este archivo, CÓMO trabajar en el repo. **Lee `spec.md` antes de empezar cualquier tarea.**

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm test` — Vitest (una pasada) · `npm run test:watch`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run build` — build de producción
- `npm run data:update` — regenera `src/data/champions.json` desde Data Dragon (necesita red)

Antes de dar una tarea por terminada: `npm test`, `npm run typecheck` y `npm run lint` en verde.

## Reglas

- **Alcance v0.1: solo modo Clásico.** Grid, Items, histórico, auth, i18n y límite de intentos están en el backlog (spec §2.2). Si una tarea se extiende hacia ellos, para y avísalo.
- **Reto diario** (spec §3): día anclado a UTC, determinístico, nunca `Math.random()`. No cambies `daily-seed.ts` sin mantener sus tests en verde y avisar.
- **La página del juego no puede resolver "hoy" en el servidor**: se prerenderiza en build. La fecha y el campeón del día se calculan en el cliente.
- **Datos** (spec §9 y `docs/fuentes-de-datos.md`): `champions.json` se genera, no se edita. Cualquier dato que añadir o corregir va en `champions-manual.json`, indexado por `id` de Data Dragon, y gana a las fuentes. Los años salen de `src/data/sources/champion-release-years.txt` y se cruzan por nombre en inglés. Ningún fetch a fuentes externas fuera de `update-data.ts`.
- **Lógica pura y testeada** en `src/lib/game-logic/`; el store solo la envuelve y persiste. Si cambia la forma del estado persistido, sube `version` en `useGameStore` y añade `migrate`.
- **UI sin estilos por ahora**: HTML plano, Tailwind desactivado en `globals.css`. No añadas diseño hasta que se pida; la prioridad es validar la lógica.
- Los datos manuales son opcionales: un atributo ausente se compara como `unknown` y no debe romper ni mostrarse como fallo.
- Textos de UI en español. Imports con alias `@/` en `src/app`; relativos dentro de `src/lib` y `src/stores`.
- Next.js 16: `params` es una `Promise`. Consulta `node_modules/next/dist/docs/` ante cualquier duda de API.
