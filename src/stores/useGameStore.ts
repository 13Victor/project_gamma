import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addAttempt,
  emptyProgress,
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
  /**
   * Registra un intento (ya comparado contra el objetivo) y actualiza
   * rachas/stats. Si ha cambiado el día UTC, descarta antes los intentos viejos.
   */
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
      // No leer localStorage en el servidor: el componente del juego llama a
      // `useGameStore.persist.rehydrate()` al montarse en el cliente.
      skipHydration: true,
    }
  )
);
