import { useMemo, useState } from "react";

import { useAppStore } from "../../../state/appStore";
import {
  groupMeetingTasksByStatus,
  MEETING_TASK_SOURCE_LABELS,
  MEETING_TASK_STATUS_LABELS
} from "../tasks/meetingTasks";
import type { MeetingTaskStatus } from "../../../types/domain";

const panelStyle = {
  display: "grid",
  gap: "16px",
  width: "min(920px, calc(100vw - 440px))",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(180deg, rgba(18,27,43,0.92) 0%, rgba(12,18,29,0.94) 100%)",
  color: "#F5EBD7",
  boxShadow: "0 28px 80px rgba(0,0,0,0.34)"
} satisfies React.CSSProperties;

const lanesStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px"
} satisfies React.CSSProperties;

const statusOrder: MeetingTaskStatus[] = [
  "new",
  "in_progress",
  "ready_to_submit",
  "submitted"
];

export function MeetingRoomPanel() {
  const tasks = useAppStore((state) => state.meetingTasks);
  const claimMeetingTask = useAppStore((state) => state.claimMeetingTask);
  const markMeetingTaskReady = useAppStore((state) => state.markMeetingTaskReady);
  const submitMeetingTask = useAppStore((state) => state.submitMeetingTask);
  const groupedTasks = useMemo(() => groupMeetingTasksByStatus(tasks), [tasks]);
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});

  return (
    <section aria-label="meeting-room-panel" style={panelStyle}>
      <div>
        <h2 style={{ margin: 0 }}>Meeting Room</h2>
        <p style={{ margin: "6px 0 0", color: "#CBB794" }}>
          Chat-first task control console for delegation, progress, and submission.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
        {statusOrder.map((status) => (
          <article
            key={status}
            style={{
              padding: "12px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <strong>{MEETING_TASK_STATUS_LABELS[status]}</strong>
            <div style={{ color: "#D6C19D", marginTop: "4px" }}>{groupedTasks[status].length}</div>
          </article>
        ))}
      </div>

      <div style={lanesStyle}>
        {statusOrder.map((status) => (
          <section
            key={status}
            aria-label={`${status}-lane`}
            style={{
              padding: "14px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: "12px",
              alignContent: "start"
            }}
          >
            <h3 style={{ margin: 0 }}>{MEETING_TASK_STATUS_LABELS[status]}</h3>
            {groupedTasks[status].length === 0 ? (
              <p style={{ margin: 0, color: "#B8A27E" }}>No tasks in this lane.</p>
            ) : (
              groupedTasks[status].map((task) => (
                <article
                  key={task.id}
                  style={{
                    padding: "14px",
                    borderRadius: "16px",
                    background:
                      task.source === "chat"
                        ? "linear-gradient(180deg, rgba(88,55,24,0.34) 0%, rgba(60,38,18,0.26) 100%)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      task.source === "chat"
                        ? "1px solid rgba(247,212,139,0.24)"
                        : "1px solid rgba(255,255,255,0.08)",
                    display: "grid",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <strong>{task.title}</strong>
                    <span style={{ color: "#E5CB98", fontSize: "12px" }}>
                      {MEETING_TASK_SOURCE_LABELS[task.source]}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#CCB794", fontSize: "13px" }}>{task.description}</p>

                  {task.status === "new" ? (
                    <button type="button" aria-label={`领取任务 ${task.title}`} onClick={() => claimMeetingTask(task.id)}>
                      领取
                    </button>
                  ) : null}

                  {task.status === "in_progress" ? (
                    <button
                      type="button"
                      aria-label={`标记待提交 ${task.title}`}
                      onClick={() => markMeetingTaskReady(task.id)}
                    >
                      标记待提交
                    </button>
                  ) : null}

                  {task.status === "ready_to_submit" ? (
                    <>
                      <textarea
                        aria-label={`任务结果 ${task.id}`}
                        value={resultDrafts[task.id] ?? task.resultText}
                        onChange={(event) =>
                          setResultDrafts((currentDrafts) => ({
                            ...currentDrafts,
                            [task.id]: event.target.value
                          }))
                        }
                        style={{
                          width: "100%",
                          minHeight: "88px",
                          borderRadius: "12px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(0,0,0,0.2)",
                          color: "#F5EBD7",
                          padding: "10px"
                        }}
                      />
                      <button
                        type="button"
                        aria-label={`提交结果 ${task.title}`}
                        onClick={() => submitMeetingTask(task.id, resultDrafts[task.id] ?? task.resultText)}
                      >
                        提交结果
                      </button>
                    </>
                  ) : null}

                  {task.status === "submitted" ? (
                    <p style={{ margin: 0, color: "#F1DFB7", fontSize: "13px" }}>{task.resultText}</p>
                  ) : null}
                </article>
              ))
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
