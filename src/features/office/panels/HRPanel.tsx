import { useState } from "react";

import { defaultOpenClawAdapter } from "../../openclaw/defaultAdapter";
import type { OpenClawAdapter } from "../../openclaw/OpenClawAdapter";
import {
  pickMarkdownBinding,
  syncHrDocument,
  type HrDocumentKind,
  type LocalMarkdownBinding
} from "./hrDocumentSync";

type HRPanelProps = {
  adapter?: OpenClawAdapter;
  filePicker?: (expectedName: string) => Promise<LocalMarkdownBinding | null>;
};

type DocumentEditorState = {
  content: string;
  binding: LocalMarkdownBinding | null;
  statusMessage: string;
  isSyncing: boolean;
};

const createInitialDocumentState = (kind: HrDocumentKind): DocumentEditorState => ({
  content: `# ${kind === "soul" ? "Soul" : "Memory"}\n`,
  binding: null,
  statusMessage: `未绑定 ${kind}.md`,
  isSyncing: false
});

const panelStyle = {
  display: "grid",
  gap: "16px",
  width: "min(980px, calc(100vw - 440px))",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(180deg, rgba(26,18,35,0.94) 0%, rgba(15,12,22,0.96) 100%)",
  color: "#F4E9DA",
  boxShadow: "0 28px 80px rgba(0,0,0,0.34)"
} satisfies React.CSSProperties;

const textareaStyle = {
  width: "100%",
  minHeight: "280px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(7, 10, 16, 0.62)",
  color: "#F7F1E8",
  padding: "14px",
  resize: "vertical"
} satisfies React.CSSProperties;

const HR_STATIONS: Array<{
  kind: HrDocumentKind;
  label: string;
  description: string;
  top: string;
  left: string;
  width: string;
  height: string;
  tint: string;
}> = [
  {
    kind: "soul",
    label: "Soul 台",
    description: "管理人格、原则、偏好与行为底色。",
    top: "18%",
    left: "10%",
    width: "28%",
    height: "42%",
    tint: "rgba(133, 76, 162, 0.42)"
  },
  {
    kind: "memory",
    label: "Memory 档案柜",
    description: "维护长期记忆、上下文与重要经历。",
    top: "32%",
    left: "56%",
    width: "26%",
    height: "46%",
    tint: "rgba(86, 104, 163, 0.42)"
  }
];

export function HRPanel({
  adapter = defaultOpenClawAdapter,
  filePicker = pickMarkdownBinding
}: HRPanelProps) {
  const [soul, setSoul] = useState<DocumentEditorState>(() => createInitialDocumentState("soul"));
  const [memory, setMemory] = useState<DocumentEditorState>(() => createInitialDocumentState("memory"));
  const [activeKind, setActiveKind] = useState<HrDocumentKind>("soul");
  const [focusMessage, setFocusMessage] = useState("已聚焦人格维护台：soul.md");

  const bindDocument = async (kind: HrDocumentKind) => {
    const expectedName = `${kind}.md`;
    const binding = await filePicker(expectedName);
    if (!binding) {
      return;
    }

    const content = await binding.read();
    const nextState = {
      content,
      binding,
      statusMessage: `已绑定 ${binding.fileName}`,
      isSyncing: false
    };

    if (kind === "soul") {
      setSoul(nextState);
      return;
    }

    setMemory(nextState);
  };

  const syncDocument = async (kind: HrDocumentKind) => {
    const currentState = kind === "soul" ? soul : memory;
    const setState = kind === "soul" ? setSoul : setMemory;

    setState((previous) => ({ ...previous, isSyncing: true }));

    const result = await syncHrDocument({
      kind,
      content: currentState.content,
      adapter,
      fileBinding: currentState.binding
    });

    setState((previous) => ({
      ...previous,
      isSyncing: false,
      statusMessage: result.message
    }));
  };

  return (
    <section aria-label="hr-panel" style={panelStyle}>
      <div>
        <h2 style={{ margin: 0 }}>HR Office</h2>
        <p style={{ margin: "6px 0 0", color: "#D0BFA4" }}>
          HR has been upgraded to workstation hotspots: enter the room, click the correct desk, then maintain soul.md or memory.md.
        </p>
      </div>

      <div style={{ color: "#E6D4BD" }}>{focusMessage}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
        <section
          style={{
            padding: "16px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: "14px"
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Personnel Floor</h3>
            <p style={{ margin: "4px 0 0", color: "#BFAE96", fontSize: "13px" }}>
              Soul 台与 Memory 档案柜负责数字人格维护与长期记忆沉淀。
            </p>
          </div>

          <div
            aria-label="hr-scene"
            style={{
              position: "relative",
              minHeight: "320px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "radial-gradient(circle at 24% 18%, rgba(206, 164, 255, 0.14), transparent 24%), linear-gradient(180deg, rgba(31,22,45,0.96) 0%, rgba(19,14,29,0.98) 62%, rgba(12,10,20,0.99) 100%)"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 18%, transparent 100%), linear-gradient(0deg, rgba(0,0,0,0.22) 0%, transparent 34%)"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                bottom: "10%",
                height: "18%",
                borderRadius: "18px",
                background: "linear-gradient(180deg, rgba(71,48,92,0.82) 0%, rgba(37,28,55,0.92) 100%)"
              }}
            />

            {HR_STATIONS.map((station) => {
              const active = station.kind === activeKind;
              return (
                <button
                  key={station.kind}
                  type="button"
                  aria-label={`人事工位 ${station.label}`}
                  onClick={() => {
                    setActiveKind(station.kind);
                    setFocusMessage(
                      station.kind === "soul"
                        ? "已聚焦人格维护台：soul.md"
                        : "已聚焦档案柜：memory.md"
                    );
                  }}
                  style={{
                    position: "absolute",
                    top: station.top,
                    left: station.left,
                    width: station.width,
                    height: station.height,
                    borderRadius: "18px",
                    border: active ? "1px solid rgba(244,233,218,0.42)" : "1px solid rgba(255,255,255,0.14)",
                    background: `linear-gradient(180deg, ${station.tint} 0%, rgba(18,12,29,0.42) 100%)`,
                    color: "#F6EDE2",
                    display: "grid",
                    alignContent: "space-between",
                    textAlign: "left",
                    padding: "14px",
                    cursor: "pointer",
                    boxShadow: active ? "0 0 0 1px rgba(208,191,164,0.22), 0 12px 30px rgba(0,0,0,0.24)" : "0 12px 30px rgba(0,0,0,0.22)"
                  }}
                >
                  <strong style={{ fontSize: "16px" }}>{station.label}</strong>
                  <span style={{ fontSize: "12px", color: "#D8C6E8", lineHeight: 1.5 }}>{station.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ display: "grid", gap: "16px" }}>
          {[
            { kind: "soul" as const, label: "Soul 台", state: soul, setState: setSoul },
            { kind: "memory" as const, label: "Memory 档案柜", state: memory, setState: setMemory }
          ].map(({ kind, label, state, setState }) => {
            const active = kind === activeKind;

            return (
              <article
                key={kind}
                style={{
                  display: "grid",
                  gap: "12px",
                  padding: "16px",
                  borderRadius: "18px",
                  background: active ? "rgba(139, 110, 182, 0.12)" : "rgba(255,255,255,0.04)",
                  border: active ? "1px solid rgba(208,191,164,0.24)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: active ? "0 0 0 1px rgba(244,233,218,0.08)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{kind}.md</h3>
                    <p style={{ margin: "4px 0 0", color: "#BFAE96", fontSize: "13px" }}>
                      {label} · {state.statusMessage}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={() => void bindDocument(kind)}>
                      绑定 {kind}.md
                    </button>
                    <button type="button" onClick={() => void syncDocument(kind)}>
                      {state.isSyncing ? `同步中 ${kind}.md` : `同步 ${kind}.md`}
                    </button>
                  </div>
                </div>

                <label style={{ display: "grid", gap: "8px" }}>
                  <span>{kind}.md editor</span>
                  <textarea
                    aria-label={`${kind}.md editor`}
                    value={state.content}
                    onChange={(event) =>
                      setState((previous) => ({
                        ...previous,
                        content: event.target.value
                      }))
                    }
                    style={textareaStyle}
                  />
                </label>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}
