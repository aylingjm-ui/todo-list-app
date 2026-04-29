export type Task = {
  id: string;
  text: string;
};

export type List = {
  id: string;
  name: string;
  color: string;
  icon: string;
  tasks: Task[];
};

export type PendingTaskAction = {
  task: Task;
  listId: string;
  index: number;
  mode: 'complete' | 'delete';
};
