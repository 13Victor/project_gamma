import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addAttempt,
  emptyProgress,
  syncDay,
  type ModeProgress,
} from "../lib/game-logic/progress";

/**
 * Modos de juego con progreso propio. En v0.1 solo existe "clasico", pero el
 * estado ya cuelga de `modes` para poder añadir modos sin romper los datos
 * guardados en localStorage (spec.md §5).
 */
export type GameMode = "clasico";

interface GameState {
  modes: Record<GameMode, ModeProgress>;
  /** Llamar al montar el juego: descarta los intentos si ha cambiado el día UTC. */
  syncDay: (mode: GameMode, today: string) => void;
  /** Registra un intento (ya comparado contra el objetivo) y actualiza rachas/stats. */
  submitGuess: (
    mode: GameMode,
    today: string,
    championId: string,
    isCorrect: boolean
  ) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      modes: { clasico: emptyProgress() },
      syncDay: (mode, today) =>
        set((state) => ({
          modes: { ...state.modes, [mode]: syncDay(state.modes[mode], today) },
        })),
      submitGuess: (mode, today, championId, isCorrect) =>
        set((state) => ({
          modes: {
            ...state.modes,
            [mode]: addAttempt(state.modes[mode], today, championId, isCorrect),
          },
        })),
    }),
    {
      name: "lol-daily-game",
      // Súbela cuando cambie la forma del estado y añade `migrate`.
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ modes: state.modes }),
      // Evita desajustes de hidratación SSR: el componente del juego debe
      // llamar a `useGameStore.persist.rehydrate()` al montarse en cliente.
      skipHydration: true,
    }
  )
);
