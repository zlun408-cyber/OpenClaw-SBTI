import type {
  MeetingTask,
  MeetingTaskSource,
  MeetingTaskStatus
} from "../../../types/domain";

const seedTaskBlueprints: Array<{
  title: string;
  description: string;
  status: MeetingTaskStatus;
  resultText?: string;
}> = [
  {
    title: "整理今日销售线索",
    description: "默认任务池：按优先级输出待跟进客户。",
    status: "new"
  },
  {
    title: "生成竞品周报初稿",
    description: "默认任务池：汇总本周竞品动态。",
    status: "in_progress"
  },
  {
    title: "输出晨会纪要",
    description: "默认任务池：整理今天的会议纪要。",
    status: "ready_to_submit"
  },
  {
    title: "归档上周任务结果",
    description: "默认任务池：保留已完成提交记录。",
    status: "submitted",
    resultText: "已完成上周任务归档并同步给团队。"
  }
] as const;

let taskCounter = 0;

const nextTaskId = () => `meeting-task-${String(taskCounter++).padStart(3, "0")}`;

export const MEETING_TASK_STATUS_LABELS: Record<MeetingTaskStatus, string> = {
  new: "New Tasks",
  in_progress: "In Progress",
  ready_to_submit: "Ready to Submit",
  submitted: "Submitted"
};

export const MEETING_TASK_SOURCE_LABELS: Record<MeetingTaskSource, string> = {
  seed: "Seed Tasks",
  chat: "Chat Generated"
};

export type CreateMeetingTaskInput = {
  title: string;
  description: string;
  source: MeetingTaskSource;
  status?: MeetingTaskStatus;
  resultText?: string;
};

export function createMeetingTaskRecord({
  title,
  description,
  source,
  status = "new",
  resultText = ""
}: CreateMeetingTaskInput): MeetingTask {
  const now = new Date().toISOString();

  return {
    id: nextTaskId(),
    title: title.trim(),
    description: description.trim(),
    source,
    status,
    createdAt: now,
    updatedAt: now,
    resultText
  };
}

export function createDefaultMeetingTasks(): MeetingTask[] {
  return seedTaskBlueprints.map((task) =>
    createMeetingTaskRecord({
      title: task.title,
      description: task.description,
      source: "seed",
      status: task.status,
      resultText: task.resultText
    })
  );
}

export function groupMeetingTasksByStatus(tasks: readonly MeetingTask[]) {
  return {
    new: tasks.filter((task) => task.status === "new"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    ready_to_submit: tasks.filter((task) => task.status === "ready_to_submit"),
    submitted: tasks.filter((task) => task.status === "submitted")
  };
}
