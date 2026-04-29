const UPDATE_EVENT = 'todo-pwa-update';

export const registerPwa = () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  let prompted = false;
  const hadController = Boolean(navigator.serviceWorker.controller);

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (prompted || !hadController) {
          return;
        }

        prompted = true;
        window.dispatchEvent(new Event(UPDATE_EVENT));
      });

      window.setInterval(() => {
        registration.update().catch(() => undefined);
      }, 60 * 60 * 1000);
    } catch {
      // Ignore registration failures and allow the app to keep working online.
    }
  });
};

export const pwaUpdateEvent = UPDATE_EVENT;
