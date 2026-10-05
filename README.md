# League Daily Game

Juego diario estilo Wordle del universo de League of Legends. v0.1: solo modo Clásico. La especificación completa está en [`spec.md`](./spec.md); las convenciones para trabajar en el repo, en [`AGENTS.md`](./AGENTS.md).

## Puesta en marcha

```bash
nvm use               # Node 24 (ver .nvmrc)
npm install
npm run data:update   # genera src/data/champions.json desde Data Dragon (necesita red)
npm run dev           # y abre http://localhost:3000/clasico
```

Sin ejecutar `data:update`, `/clasico` muestra "No hay campeones".

Variable opcional: `NEXT_PUBLIC_SITE_URL` — URL pública, usada en sitemap, robots y metadatos.

## Datos

Los datos de campeones se montan en capas (detalle y justificación en [`docs/fuentes-de-datos.md`](./docs/fuentes-de-datos.md)):

| Archivo | Origen |
|---|---|
| `src/data/champions.json` | Generado por `npm run data:update` a partir de Data Dragon + CommunityDragon + el TXT de años. **No editar a mano.** |
| `src/data/sources/champion-release-years.txt` | A mano (de la wiki): `Nombre<TAB>Año`, con el nombre en inglés ("Kai'Sa"). |
| `src/data/champions-manual.json` | A mano, **gana siempre**: `{ "<id>": { ...campos } }`. Añade lo que ninguna fuente da (`gender`, `positions`, `species`, `region`) y corrige cualquier campo de `champions.json`. |

Todos los campeones de Data Dragon son jugables desde el primer momento. Los datos que faltan son opcionales: un atributo sin dato se compara como `unknown` y su columna no se muestra mientras el campeón del día no lo tenga.

El `id` de Data Dragon (`Ahri`, `Kaisa`, `MonkeyKing`...) es la clave del JSON manual y también la URL de la ficha (`/campeones/Kaisa`). `data:update` termina con un informe: campeones sin año, nombres sin pareja, valores de cada categoría y correcciones manuales activas.

## Estructura

```
src/
  app/
    (game)/clasico/   pantalla del daily (page.tsx servidor + ClassicGame.tsx cliente)
    campeones/[id]/   ficha por campeón · como-jugar/ · sitemap.ts · robots.ts
  lib/
    champions.ts      combina los dos JSON
    game-logic/       lógica pura con tests: reto diario, comparación, progreso, compartir
  stores/             Zustand + persist (localStorage)
  scripts/            ingesta de Data Dragon
  types/              tipos de dominio
```

La UI está **deliberadamente sin estilos** (HTML plano, sin Tailwind activo) mientras se valida la lógica. El diseño real viene después.

## Cómo proceder

1. **Datos de Data Dragon:** `npm run data:update`, abrir `/clasico` y jugar. Con solo gama y recurso ya se puede probar todo el ciclo: autocompletado, intentos, victoria, racha, recarga y compartir.
2. **Datos manuales, por tandas:** añadir entradas a `champions-manual.json` (género, posiciones, especie, región, y cualquier corrección). Cada atributo nuevo aparece como columna en cuanto el campeón del día lo tiene. Empezar por los atributos más fáciles de rellenar para los 170 (año, género) e ir sumando.
3. **Antes de publicar:** fijar `EPOCH_START_UTC` en `daily-seed.ts` al día de lanzamiento, y decidir el nombre (`lib/site.ts`).
4. **Diseño:** cuando la lógica esté validada, estilar `/clasico` (reactivar Tailwind en `globals.css`) y, después, AdSense y GA4 (spec §10).

## Estado de v0.1

Hecho: lógica del reto diario, comparación de los 7 atributos, rachas/estadísticas, texto de compartir, store persistido, pantalla funcional de `/clasico`, rutas con metadatos, sitemap y robots.

Pendiente: datos manuales, diseño de la UI, AdSense, GA4 (`game_start`, `game_complete`, `game_share`) y fijar `EPOCH_START_UTC`. Checklist completa en spec §10.
