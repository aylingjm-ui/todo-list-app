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

export type PendingDeletion = {
  task: Task;
  listId: string;
  index: number;
};
