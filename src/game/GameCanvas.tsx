import { useEffect, useRef } from "react";

import type { RoomId } from "../types/domain";

type RoomEnteredEvent = {
  type: "ROOM_CHANGED";
  roomId: RoomId | null;
};

type GameCanvasProps = {
  onRoomChanged?: (roomId: RoomId | null) => void;
};

export function GameCanvas({ onRoomChanged }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const destroyRef = useRef<(() => void) | null>(null);
  const onRoomChangedRef = useRef(onRoomChanged);

  useEffect(() => {
    onRoomChangedRef.current = onRoomChanged;
  }, [onRoomChanged]);

  useEffect(() => {
    if (import.meta.env.MODE === "test" || !containerRef.current) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const [{ default: Phaser }, { BootScene }, { PreloadScene }, { OfficeScene }] = await Promise.all([
        import("phaser"),
        import("./scenes/BootScene"),
        import("./scenes/PreloadScene"),
        import("./scenes/OfficeScene")
      ]);

      if (cancelled || !containerRef.current) {
        return;
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 960,
        height: 640,
        backgroundColor: "#111827",
        scene: [BootScene, PreloadScene, OfficeScene]
      };

      const game = new Phaser.Game(config);
      const handleRoomEntered = (event: RoomEnteredEvent) => {
        onRoomChangedRef.current?.(event.roomId);
      };

      game.events.on("ROOM_CHANGED", handleRoomEntered);
      destroyRef.current = () => {
        game.events.off("ROOM_CHANGED", handleRoomEntered);
        game.destroy(true);
      };
    })();

    return () => {
      cancelled = true;
      destroyRef.current?.();
      destroyRef.current = null;
    };
  }, []);

  return <div data-testid="game-canvas" ref={containerRef} />;
}
