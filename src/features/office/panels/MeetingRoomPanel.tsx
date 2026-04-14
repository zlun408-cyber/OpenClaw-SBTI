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
  width: "min(980px, calc(100vw - 440px))",
  padding: "20px",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(180deg, rgba(18,27,43,0.92) 0%, rgba(12,18,29,0.94) 100%)",
  color: "#F5EBD7",
  boxShadow: "0 28px 80px rgba(0,0,0,0.34)"
} satisfies React.CSSProperties;

const statusOrder: MeetingTaskStatus[] = [
  "new",
  "in_progress",
  "ready_to_submit",
  "submitted"
];

type MeetingStationId = "dispatch" | "execution" | "submission";

const MEETING_STATIONS: Array<{
  id: MeetingStationId;
  label: string;
  description: string;
  focusStatus: MeetingTaskStatus;
  top: string;
  left: string;
  width: string;
  height: string;
  tint: string;
}> = [
  {
    id: "dispatch",
    label: "任务发布台",
    description: "适合创建、派发与领取新任务。",
    focusStatus: "new",
    top: "18%",
    left: "8%",
    width: "26%",
    height: "40%",
    tint: "rgba(120, 89, 46, 0.42)"
  },
  {
    id: "execution",
    label: "执行看板",
    description: "适合跟进进行中的工作推进。",
    focusStatus: "in_progress",
    top: "38%",
    left: "38%",
    width: "28%",
    height: "34%",
    tint: "rgba(79, 111, 159, 0.42)"
  },
  {
    id: "submission",
    label: "提交席",
    description: "适合查看待提交任务并完成结果提交。",
    focusStatus: "ready_to_submit",
    top: "18%",
    left: "70%",
    width: "18%",
    height: "46%",
    tint: "rgba(88, 122, 85, 0.42)"
  }
];

export function MeetingRoomPanel() {
  const tasks = useAppStore((state) => state.meetingTasks);
  const claimMeetingTask = useAppStore((state) => state.claimMeetingTask);
  const markMeetingTaskReady = useAppStore((state) => state.markMeetingTaskReady);
  const submitMeetingTask = useAppStore((state) => state.submitMeetingTask);
  const groupedTasks = useMemo(() => groupMeetingTasksByStatus(tasks), [tasks]);
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});
  const [activeStationId, setActiveStationId] = useState<MeetingStationId>("dispatch");
  const activeStation = useMemo(
    () => MEETING_STATIONS.find((item) => item.id === activeStationId) ?? MEETING_STATIONS[0],
    [activeStationId]
  );
  const [focusMessage, setFocusMessage] = useState(`已聚焦会议工位：${activeStation.label}`);

  return (
    <section aria-label="meeting-room-panel" style={panelStyle}>
      <div>
        <h2 style={{ margin: 0 }}>Meeting Room</h2>
        <p style={{ margin: "6px 0 0", color: "#CBB794" }}>
          The meeting room now supports scene hotspots: click the station first, then drive the task loop.
        </p>
      </div>

      <div style={{ color: "#E7D5B1" }}>{focusMessage}</div>

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
            <h3 style={{ margin: 0 }}>Meeting Floor</h3>
            <p style={{ margin: "4px 0 0", color: "#CBB794", fontSize: "13px" }}>
              任务发布台、执行看板、提交席分别对应任务发布、推进和结果提交。
            </p>
          </div>

          <div
            aria-label="meeting-scene"
            style={{
              position: "relative",
              minHeight: "320px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "radial-gradient(circle at 24% 18%, rgba(247, 212, 139, 0.16), transparent 24%), linear-gradient(180deg, rgba(26,39,61,0.96) 0%, rgba(15,24,38,0.98) 62%, rgba(10,15,24,0.99) 100%)"
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
                background: "linear-gradient(180deg, rgba(63,48,31,0.82) 0%, rgba(35,27,18,0.92) 100%)"
              }}
            />

            {MEETING_STATIONS.map((station) => {
              const active = station.id === activeStationId;
              return (
                <button
                  key={station.id}
                  type="button"
                  aria-label={`会议工位 ${station.label}`}
                  onClick={() => {
                    setActiveStationId(station.id);
                    setFocusMessage(`已聚焦会议工位：${station.label}`);
                  }}
                  style={{
                    position: "absolute",
                    top: station.top,
                    left: station.left,
                    width: station.width,
                    height: station.height,
                    borderRadius: "18px",
                    border: active ? "1px solid rgba(245,235,215,0.42)" : "1px solid rgba(255,255,255,0.12)",
                    background: `linear-gradient(180deg, ${station.tint} 0%, rgba(18,25,37,0.44) 100%)`,
                    color: "#F9F0DE",
                    display: "grid",
                    alignContent: "space-between",
                    textAlign: "left",
                    padding: "14px",
                    cursor: "pointer",
                    boxShadow: active ? "0 0 0 1px rgba(247,212,139,0.18), 0 12px 30px rgba(0,0,0,0.24)" : "0 12px 30px rgba(0,0,0,0.22)"
                  }}
                >
                  <strong style={{ fontSize: "16px" }}>{station.label}</strong>
                  <span style={{ fontSize: "12px", color: "#E3CFAC", lineHeight: 1.5 }}>{station.description}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
            {statusOrder.map((status) => (
              <article
                key={status}
                style={{
                  padding: "12px",
                  borderRadius: "16px",
                  background:
                    activeStation.focusStatus === status
                      ? "rgba(247,212,139,0.14)"
                      : "rgba(255,255,255,0.06)",
                  border:
                    activeStation.focusStatus === status
                      ? "1px solid rgba(247,212,139,0.18)"
                      : "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <strong>{MEETING_TASK_STATUS_LABELS[status]}</strong>
                <div style={{ color: "#D6C19D", marginTop: "4px" }}>{groupedTasks[status].length}</div>
              </article>
            ))}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
          {statusOrder.map((status) => (
            <section
              key={status}
              aria-label={`${status}-lane`}
              style={{
                padding: "14px",
                borderRadius: "18px",
                background:
                  activeStation.focusStatus === status
                    ? "rgba(247,212,139,0.08)"
                    : "rgba(255,255,255,0.04)",
                border:
                  activeStation.focusStatus === status
                    ? "1px solid rgba(247,212,139,0.2)"
                    : "1px solid rgba(255,255,255,0.08)",
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
      </div>
    </section>
  );
}
