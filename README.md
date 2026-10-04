# League Daily Game

Juego diario estilo Wordle del universo de League of Legends. v0.1: solo modo Clásico. La especificación completa está en [`spec.md`](./spec.md); las convenciones para trabajar en el repo, en [`AGENTS.md`](./AGENTS.md).

## Puesta en marcha

```bash
nvm use            # Node 24 (ver .nvmrc)
npm install
npm run data:update   # genera src/data/champions.json desde Data Dragon
npm run dev
```

Variables de entorno (opcionales en local): `NEXT_PUBLIC_SITE_URL` — URL pública, usada en sitemap, robots y metadatos.

## Datos

| Archivo | Origen |
|---|---|
| `src/data/champions.json` | Generado por `npm run data:update`. No editar a mano. |
| `src/data/champions-manual.json` | A mano: `{ "<id de Data Dragon>": { gender, positions, species, region, releaseYear } }` |

Un campeón solo es jugable (y solo tiene página y entrada en el sitemap) si tiene entrada en el JSON manual. `data:update` lista los que faltan.

## Estructura

```
src/
  app/              rutas: /, /clasico, /como-jugar, /campeones/[slug], sitemap, robots
  lib/
    champions.ts    combina los dos JSON en campeones jugables
    game-logic/     lógica pura con tests: reto diario, comparación, progreso, compartir
  stores/           Zustand + persist (localStorage)
  scripts/          ingesta de Data Dragon
  types/            tipos de dominio
```

## Estado de v0.1

Hecho: lógica del reto diario, comparación de los 7 atributos, rachas/estadísticas, texto de compartir, store persistido, rutas con metadatos, sitemap y robots.

Pendiente: UI del juego en `/clasico` (textbox con autocompletado, tabla de intentos, compartir), datos manuales de campeones, AdSense, GA4 (`game_start`, `game_complete`, `game_share`) y fijar `EPOCH_START_UTC` en `daily-seed.ts` al día real de lanzamiento. Checklist completa en spec §10.
