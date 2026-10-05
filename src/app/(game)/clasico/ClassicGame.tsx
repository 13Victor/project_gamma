"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  CLASSIC_ATTRIBUTES,
  compareClassic,
  type ClassicComparison,
} from "@/lib/game-logic/classic-compare";
import { getDailyChampion } from "@/lib/game-logic/daily-champion";
import {
  getChallengeNumber,
  toUTCDateString,
} from "@/lib/game-logic/daily-seed";
import { getDisplayStreak } from "@/lib/game-logic/progress";
import { buildShareText } from "@/lib/game-logic/share-text";
import { useGameStore } from "@/stores/useGameStore";
import { CLASS_LABELS, type Champion } from "@/types/champion";

const LABELS: Record<(typeof CLASSIC_ATTRIBUTES)[number], string> = {
  gender: "Género",
  positions: "Posición",
  species: "Especie",
  resource: "Recurso",
  classes: "Gama",
  region: "Región",
  releaseYear: "Año",
};

const MARKERS = {
  match: "🟩",
  miss: "🟥",
  up: "⬆️",
  down: "⬇️",
  unknown: "",
} as const;

function formatValue(
  champion: Champion,
  key: (typeof CLASSIC_ATTRIBUTES)[number]
): string {
  const value = champion[key];
  if (value === undefined) return "—";
  if (Array.isArray(value)) {
    const list: string[] = value;
    return (key === "classes" ? list.map((t) => CLASS_LABELS[t] ?? t) : list).join(", ");
  }
  return String(value);
}

// "Hoy" (UTC) se calcula solo en el cliente. En servidor/hidratación es null,
// y se vuelve a comprobar cada 30 s para que el reto cambie a las 00:00 UTC.
function subscribeToClock(onChange: () => void) {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
}
const getToday = () => toUTCDateString(new Date());
const getServerToday = () => null;

export function ClassicGame({ champions }: { champions: Champion[] }) {
  const today = useSyncExternalStore(subscribeToClock, getToday, getServerToday);
  const progress = useGameStore((state) => state.modes.clasico);
  const submitGuess = useGameStore((state) => state.submitGuess);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void useGameStore.persist.rehydrate();
  }, []);

  if (champions.length === 0) {
    return (
      <p>
        No hay campeones. Ejecuta <code>npm run data:update</code>.
      </p>
    );
  }
  if (today === null) return <p>Cargando…</p>;

  const date = new Date(`${today}T00:00:00Z`);
  const target = getDailyChampion(date, champions);

  const attemptIds = progress.dayDate === today ? progress.dayAttempts : [];
  const rows = attemptIds.flatMap((id) => {
    const champion = champions.find((c) => c.id === id);
    return champion
      ? [{ champion, result: compareClassic(champion, target) }]
      : [];
  });
  const solved = progress.lastCompletedDate === today;
  // Solo se muestran las columnas de las que tenemos dato en el objetivo.
  const columns = CLASSIC_ATTRIBUTES.filter((key) => target[key] !== undefined);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const name = query.trim().toLowerCase();
    const guess = champions.find((c) => c.name.toLowerCase() === name);
    if (!guess) return setMessage("No encuentro ese campeón.");
    if (attemptIds.includes(guess.id)) return setMessage("Ya lo has probado.");

    submitGuess("clasico", today!, guess.id, compareClassic(guess, target).isCorrect);
    setQuery("");
    setMessage("");
  }

  async function handleShare() {
    const text = buildShareText({
      challengeNumber: getChallengeNumber(date),
      attempts: rows.map((row): ClassicComparison => row.result),
      url: `${window.location.origin}/clasico`,
    });
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Resultado copiado al portapapeles.");
    } catch {
      setMessage("No se pudo copiar el resultado.");
    }
  }

  return (
    <>
      <p>
        Reto #{getChallengeNumber(date)} · Racha: {getDisplayStreak(progress, today)}{" "}
        · Máxima: {progress.maxStreak} · Jugadas: {progress.played} · Ganadas:{" "}
        {progress.won}
      </p>

      {solved ? (
        <p>
          ¡Acertaste! Era {target.name}, en {rows.length} intentos. Vuelve a las
          00:00 UTC para el siguiente.{" "}
          <button type="button" onClick={handleShare}>
            Compartir resultado
          </button>
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            list="champion-names"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Escribe un campeón"
            aria-label="Campeón"
            autoComplete="off"
          />
          <datalist id="champion-names">
            {champions
              .filter((c) => !attemptIds.includes(c.id))
              .map((c) => (
                <option key={c.id} value={c.name} />
              ))}
          </datalist>{" "}
          <button type="submit">Probar</button>
        </form>
      )}
      {message && <p role="status">{message}</p>}

      {rows.length > 0 && (
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>Campeón</th>
              {columns.map((key) => (
                <th key={key}>{LABELS[key]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().map(({ champion, result }) => (
              <tr key={champion.id}>
                <td>
                  <Image
                    src={champion.imageUrl}
                    alt=""
                    width={32}
                    height={32}
                  />{" "}
                  {champion.name}
                </td>
                {columns.map((key) => (
                  <td key={key}>
                    {MARKERS[result[key]]} {formatValue(champion, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
