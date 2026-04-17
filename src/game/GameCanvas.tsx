import { useEffect, useRef, useState } from "react";

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
  const [isReady, setIsReady] = useState(import.meta.env.MODE === "test");

  useEffect(() => {
    onRoomChangedRef.current = onRoomChanged;
  }, [onRoomChanged]);

  useEffect(() => {
    if (import.meta.env.MODE === "test" || !containerRef.current) {
      return;
    }

    let cancelled = false;
    setIsReady(false);

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
      const checkReady = () => {
        if (cancelled || !containerRef.current) {
          return;
        }

        if (containerRef.current.querySelector("canvas")) {
          setIsReady(true);
        }
      };

      checkReady();

      const canvasObserver = new MutationObserver(() => {
        checkReady();
      });

      canvasObserver.observe(containerRef.current, {
        childList: true,
        subtree: true
      });

      const handleRoomEntered = (event: RoomEnteredEvent) => {
        onRoomChangedRef.current?.(event.roomId);
      };

      game.events.on("ROOM_CHANGED", handleRoomEntered);
      destroyRef.current = () => {
        canvasObserver.disconnect();
        game.events.off("ROOM_CHANGED", handleRoomEntered);
        game.destroy(true);
      };
    })();

    return () => {
      cancelled = true;
      setIsReady(import.meta.env.MODE === "test");
      destroyRef.current?.();
      destroyRef.current = null;
    };
  }, []);

  return (
    <div
      aria-busy={!isReady}
      data-game-ready={isReady ? "true" : "false"}
      data-testid="game-canvas"
      ref={containerRef}
      style={{
        width: "960px",
        height: "640px"
      }}
    />
  );
}
