import { useEffect, useRef } from "react";

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const destroyRef = useRef<(() => void) | null>(null);

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
      destroyRef.current = () => game.destroy(true);
    })();

    return () => {
      cancelled = true;
      destroyRef.current?.();
      destroyRef.current = null;
    };
  }, []);

  return <div data-testid="game-canvas" ref={containerRef} />;
}
