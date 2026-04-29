import { useEffect, useRef, useState } from 'react';
import MyLists from './components/MyLists';
import ListDetail from './components/ListDetail';
import Toast from './components/Toast';
import { List, PendingTaskAction, Task } from './types';
import { pwaUpdateEvent } from './pwa';
import { createDefaultLists, createId, normalizeLists, pickListStyle } from './utils';

const STORAGE_KEY = 'reminders-lite-data';
const TOAST_MS = 4000;

type ToastState = {
  id: string;
  message: string;
  actionLabel?: string;
  kind: 'task' | 'update';
};

const loadLists = (): List[] => {
  if (typeof window === 'undefined') {
    return createDefaultLists();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultLists();
  }

  try {
    return normalizeLists(JSON.parse(raw));
  } catch {
    return createDefaultLists();
  }
};

export default function App() {
  const [lists, setLists] = useState<List[]>(loadLists);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingTaskAction, setPendingTaskAction] = useState<PendingTaskAction | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  useEffect(() => () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const showUpdatePrompt = () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }

      setToast({
        id: createId(),
        kind: 'update',
        message: 'App updated. Refresh to use the latest version.',
        actionLabel: 'Refresh',
      });
    };

    window.addEventListener(pwaUpdateEvent, showUpdatePrompt);
    return () => window.removeEventListener(pwaUpdateEvent, showUpdatePrompt);
  }, []);

  const selectedList = lists.find((list) => list.id === selectedListId) ?? null;

  const scheduleTaskToastExpiry = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setPendingTaskAction(null);
      setToast(null);
      toastTimeoutRef.current = null;
    }, TOAST_MS);
  };

  const addList = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setLists((current) => {
      const style = pickListStyle(current.length);
      return [
        ...current,
        {
          id: createId(),
          name: trimmed,
          color: style.color,
          icon: style.icon,
          tasks: [],
        },
      ];
    });
  };

  const updateList = (listId: string, updates: Pick<List, 'name' | 'color' | 'icon'>) => {
    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? {
              ...list,
              name: updates.name.trim() || list.name,
              color: updates.color,
              icon: updates.icon,
            }
          : list,
      ),
    );
  };

  const deleteList = (listId: string) => {
    setLists((current) => current.filter((list) => list.id !== listId));
    setSelectedListId((current) => (current === listId ? null : current));
  };

  const addTask = (listId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: [...list.tasks, { id: createId(), text: trimmed }],
            }
          : list,
      ),
    );
  };

  const updateTask = (listId: string, taskId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) => (task.id === taskId ? { ...task, text: trimmed } : task)),
            }
          : list,
      ),
    );
  };

  const deleteTask = (listId: string, task: Task) => {
    setLists((current) =>
      current.map((list) =>
        list.id === listId
          ? { ...list, tasks: list.tasks.filter((entry) => entry.id !== task.id) }
          : list,
      ),
    );
  };

  const showTaskToast = (action: PendingTaskAction, message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setPendingTaskAction(action);
    setToast({ id: createId(), kind: 'task', message, actionLabel: 'Undo' });
    scheduleTaskToastExpiry();
  };

  const completeTask = (listId: string, task: Task) => {
    let pending: PendingTaskAction | null = null;

    setLists((current) =>
      current.map((list) => {
        if (list.id !== listId) {
          return list;
        }

        const index = list.tasks.findIndex((entry) => entry.id === task.id);
        if (index === -1) {
          return list;
        }

        pending = { listId, task, index, mode: 'complete' };
        return { ...list, tasks: list.tasks.filter((entry) => entry.id !== task.id) };
      }),
    );

    if (pending) {
      showTaskToast(pending, `"${task.text}" completed`);
    }
  };

  const swipeDeleteTask = (listId: string, task: Task) => {
    let pending: PendingTaskAction | null = null;

    setLists((current) =>
      current.map((list) => {
        if (list.id !== listId) {
          return list;
        }

        const index = list.tasks.findIndex((entry) => entry.id === task.id);
        if (index === -1) {
          return list;
        }

        pending = { listId, task, index, mode: 'delete' };
        return { ...list, tasks: list.tasks.filter((entry) => entry.id !== task.id) };
      }),
    );

    if (pending) {
      showTaskToast(pending, `"${task.text}" deleted`);
    }
  };

  const undoTaskAction = () => {
    if (!pendingTaskAction) {
      return;
    }

    const { listId, task, index } = pendingTaskAction;
    setLists((current) =>
      current.map((list) => {
        if (list.id !== listId) {
          return list;
        }

        const tasks = [...list.tasks];
        tasks.splice(index, 0, task);
        return { ...list, tasks };
      }),
    );

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setPendingTaskAction(null);
    setToast(null);
  };

  const dismissToast = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    if (toast?.kind === 'task') {
      setPendingTaskAction(null);
    }
    setToast(null);
  };

  const addNewReminder = () => {
    const targetListId = lists[0]?.id;
    if (!targetListId) {
      return;
    }
    setSelectedListId(targetListId);
  };

  return (
    <div className="min-h-screen bg-app text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-6">
        {selectedList ? (
          <ListDetail
            list={selectedList}
            onBack={() => setSelectedListId(null)}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onSwipeDeleteTask={swipeDeleteTask}
            onUpdateTask={updateTask}
            onCompleteTask={completeTask}
            onUpdateList={updateList}
            onDeleteList={deleteList}
          />
        ) : (
          <MyLists
            lists={lists}
            onOpenList={setSelectedListId}
            onAddList={addList}
            onNewReminder={addNewReminder}
          />
        )}
      </main>

      <Toast
        open={Boolean(toast)}
        message={toast?.message ?? ''}
        actionLabel={toast?.actionLabel}
        onAction={toast?.kind === 'update' ? () => window.location.reload() : undoTaskAction}
        onClose={dismissToast}
      />
    </div>
  );
}
