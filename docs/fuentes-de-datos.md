# Fuentes de datos

Cómo se construyen los datos de campeones, qué aporta cada fuente y cómo se corrige un dato que no nos convence. Complementa `spec.md` §9.

## Resumen

Los datos se montan en **capas**. Cada capa pisa a la anterior:

| # | Capa | Dónde vive | Quién la escribe |
|---|---|---|---|
| 1 | Data Dragon | `champions.json` | `npm run data:update` |
| 2 | CommunityDragon | `champions.json` | `npm run data:update` |
| 3 | Wiki (años) | `champions.json` | `npm run data:update` lee `src/data/sources/champion-release-years.txt` |
| 4 | **Manual** | `champions-manual.json` | tú, a mano. **Siempre gana.** |

`champions.json` se regenera entero cada vez: nunca se edita. Todo lo que quieras añadir o corregir va en `champions-manual.json`, así sobrevive a las actualizaciones.

## Qué aporta cada fuente

**Data Dragon** (CDN oficial de Riot, versionado por parche): `id`, `key`, nombre localizado, título, icono, `tags` (gama) y `partype` (recurso). Es la fuente de verdad de *qué campeones existen*: el roster sale de aquí.

**CommunityDragon** (`raw.communitydragon.org`, proyecto de la comunidad): extrae los datos internos del cliente. Lo que se ha verificado en `…/global/{default|es_es}/v1/`:

- `champion-summary.json`: lista de todos los campeones con `id` numérico, `name`, `alias`. Incluye una entrada `-1` ("None") y copias con id ≥ 60000 (`Jade_*`) que hay que ignorar. Por eso se parte siempre del roster de Data Dragon.
- `champions/{id}.json`, un fichero por campeón: `shortBio`, `tacticalInfo` (`damageType`, `attackType`, `style`, `difficulty`), `championTagInfo` (`championTagPrimary`, `championTagSecondary`), `playstyleInfo` (daño, durabilidad, control, movilidad, utilidad, en escala 0-3), `roles`, `skins`, `spells`, `passive`.
- El idioma `es_es` existe y localiza `title`, `shortBio` y los textos de los tags ("Daño continuo", "Curación propia"). `damageType` y `attackType` son códigos y no cambian con el idioma.

**Wiki** (`champion-release-years.txt`): año de lanzamiento. Ninguna API lo da. Es un fichero a mano, una línea por campeón, `Nombre<TAB>Año`.

## Cómo se cruzan las fuentes

- **Data Dragon ↔ CommunityDragon:** por número. `key` de Data Dragon == `id` de CommunityDragon (Aatrox = 266). No se cruza por `alias`: no coincide siempre con el `id` de Data Dragon (p. ej. `FiddleSticks` frente a `Fiddlesticks`).
- **Wiki ↔ campeones:** por **nombre en inglés**, normalizado. La wiki escribe "Kai'Sa" y "Nunu & Willump", pero Data Dragon en español dice "Nunu y Willump". Por eso `data:update` toma el nombre en inglés del `name` de CommunityDragon (idioma `default`), lo guarda como `englishName` y compara con `normalizeName()` (minúsculas, sin acentos ni signos: "Kai'Sa" y "Kaisa" dan `kaisa`). Esa clave es solo para comparar; no se usa en URLs.
- Si un nombre del TXT o un campeón no encuentra pareja, `data:update` lo lista al final. Nunca se adivina.

## Datos nuevos incorporados

| Campo | Fuente | Ejemplo (Aatrox) | Notas |
|---|---|---|---|
| `shortBio` | CommunityDragon | "Aatrox y sus hermanos…" | Resumen del lore, localizado. |
| `damageType` | CommunityDragon | `physical` | Se guarda sin el prefijo `k` de la fuente (`kPhysical`). Solo se ha visto `kPhysical`; `data:update` imprime todos los valores que aparezcan para revisarlos. |
| `attackType` | CommunityDragon | `melee` | `melee` / `ranged`. Candidato a atributo del modo Clásico (spec §11). |
| `tagPrimary` / `tagSecondary` | CommunityDragon | "Daño continuo" / "Curación propia" | Texto localizado. Pistas de estilo de juego. El secundario puede faltar. |
| `releaseYear` | Wiki | `2013` | |
| `englishName` | CommunityDragon | "Aatrox" | Solo para cruzar con fuentes externas. |

**No incorporado (todavía):** `playstyleInfo` (números 0-3, buenos para pistas o un modo futuro), `roles` (duplica los `tags` de Data Dragon), skins, habilidades, audio.

**Biografía larga:** no está en `champions/{id}.json` (ni en inglés ni en español; solo `shortBio`). Si se quiere, la opción conocida es Data Dragon: `data/{locale}/champion/{id}.json` incluye `lore`. Es un fichero por campeón, o el agregado `championFull.json`. Sin verificar todavía; se decide cuando haga falta.

## Cómo corregir un dato

Añade una entrada en `src/data/champions-manual.json`, indexada por `id` de Data Dragon. Cualquier campo de `champions.json` se puede pisar, y también se pueden añadir los que ninguna fuente da (`gender`, `positions`, `species`, `region`):

```json
{
  "Aatrox": { "resource": "Ninguno", "gender": "Masculino", "positions": ["Top"] },
  "Ahri":   { "species": "Vastaya", "region": "Ionia" }
}
```

Tras cada `npm run data:update`, el script imprime las **correcciones activas** (`Aatrox.resource: "Pozo de Sangre" -> "Ninguno"`). Si una fuente ya trae el valor correcto, el override sobra y se borra. También avisa de ids manuales que ya no existen.

Un campeón nuevo, o uno cuyo año falta, aparece en el informe como "sin año": se añade una línea al TXT, o `releaseYear` al manual.

## Riesgos y mantenimiento

- **CommunityDragon no es oficial ni tiene garantías de disponibilidad.** Se usa solo en `data:update` (ya está en la spec: nada de llamadas a fuentes externas en ejecución). Si cae o cambia el formato, el script tolera campos ausentes y falla campeón a campeón, avisando; el juego sigue funcionando con los datos ya generados.
- **`latest` sigue al cliente, que puede ir por delante de Data Dragon.** Un campeón recién salido puede existir en una fuente y no en otra. El roster manda Data Dragon, así que el que falte simplemente no aparece hasta que lo haga. Se puede fijar un parche con `CDRAGON_PATCH=15.20`.
- **Imágenes:** hoy se usan las de Data Dragon (oficial, versionadas). CommunityDragon también las sirve, pero al ser un servicio de la comunidad no conviene depender de él en producción. Si se quieren sus recursos, lo razonable es descargarlos en el build o en el despliegue.
- **El juego depende del número de campeones.** Volver a ejecutar `data:update` cuando salga un campeón cambia los retos de los días siguientes (ver README).
- **Contenido de Riot:** los textos e imágenes son propiedad de Riot Games. Antes de publicar, añadir el aviso legal que exige su política de contenido para webs de fans y revisarla.
- **Mantenimiento mínimo:** lo único manual recurrente es una línea en el TXT por campeón nuevo, más sus pocos datos manuales.
