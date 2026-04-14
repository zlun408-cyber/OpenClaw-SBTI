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
  width: "min(960px, calc(100vw - 440px))",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(180deg, rgba(26,18,35,0.94) 0%, rgba(15,12,22,0.96) 100%)",
  color: "#F4E9DA",
  boxShadow: "0 28px 80px rgba(0,0,0,0.34)"
} satisfies React.CSSProperties;

const editorGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px"
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

export function HRPanel({
  adapter = defaultOpenClawAdapter,
  filePicker = pickMarkdownBinding
}: HRPanelProps) {
  const [soul, setSoul] = useState<DocumentEditorState>(() => createInitialDocumentState("soul"));
  const [memory, setMemory] = useState<DocumentEditorState>(() => createInitialDocumentState("memory"));

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
          Dual-channel personnel workspace for soul.md and memory.md.
        </p>
      </div>

      <div style={editorGridStyle}>
        {[
          { kind: "soul" as const, state: soul, setState: setSoul },
          { kind: "memory" as const, state: memory, setState: setMemory }
        ].map(({ kind, state, setState }) => (
          <article
            key={kind}
            style={{
              display: "grid",
              gap: "12px",
              padding: "16px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0 }}>{kind}.md</h3>
                <p style={{ margin: "4px 0 0", color: "#BFAE96", fontSize: "13px" }}>{state.statusMessage}</p>
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
        ))}
      </div>
    </section>
  );
}
