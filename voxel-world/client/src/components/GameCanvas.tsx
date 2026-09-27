import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

const HOTBAR = [
  { key: "1", name: "Grass", glyph: "▰", tone: "grass" },
  { key: "2", name: "Dirt", glyph: "▰", tone: "dirt" },
  { key: "3", name: "Stone", glyph: "◆", tone: "stone" },
  { key: "4", name: "Wood", glyph: "▥", tone: "wood" },
  { key: "5", name: "Leaf", glyph: "✦", tone: "leaf" },
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    let handle: GameHandle | null = null;
    createGameScene(engine, canvas).then((nextHandle) => {
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" style={{ touchAction: "none" }} />
      <section id="hud" aria-label="Voxel World controls">
        <div className="hud-topbar">
          <div className="brand-lockup">
            <span className="brand-mark">VW</span>
            <div>
              <strong>VOXEL WORLD</strong>
              <span>FRONTIER BUILD 01</span>
            </div>
          </div>
          <div className="world-readout">
            <span className="live-dot" /> <span id="status">Loading frontier…</span>
          </div>
        </div>

        <div className="crosshair" aria-hidden="true"><i /><i /><i /><i /></div>

        <div className="hud-bottom">
          <div className="control-card">
            <span className="control-kicker">FIELD NOTES</span>
            <span>WASD للحركة · الماوس للنظر</span>
            <span>يسار للكسر · يمين للبناء · 1—5 للاختيار</span>
          </div>
          <div id="hotbar" className="hotbar" aria-label="Block inventory">
            {HOTBAR.map((item, index) => (
              <div key={item.key} className={`hotbar-slot ${index === 0 ? "selected" : ""}`} data-slot={index}>
                <span className="slot-key">{item.key}</span>
                <span className={`block-glyph ${item.tone}`}>{item.glyph}</span>
                <span className="slot-name">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="seed-card">
            <span className="control-kicker">SEED 07A</span>
            <span>AMBER ISLE</span>
          </div>
        </div>

        <div id="demo-badge" className="demo-badge">DEMO FLIGHT · MOVE TO PLAY</div>
        <div className="start-hint">انقر داخل العالم لبدء الاستكشاف</div>
      </section>
    </main>
  );
}
