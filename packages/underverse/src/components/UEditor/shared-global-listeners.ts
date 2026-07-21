type SharedGlobalEventOptions = boolean | Pick<AddEventListenerOptions, "capture" | "passive">;

type SharedGlobalEventRegistry = {
  listeners: Set<EventListener>;
  nativeListener: EventListener;
  options: SharedGlobalEventOptions | undefined;
};

const registriesByTarget = new WeakMap<EventTarget, Map<string, SharedGlobalEventRegistry>>();

function getListenerOptionsKey(options: SharedGlobalEventOptions | undefined) {
  const capture = typeof options === "boolean" ? options : Boolean(options?.capture);
  const passive = typeof options === "object" ? Boolean(options.passive) : false;
  return `${capture ? 1 : 0}:${passive ? 1 : 0}`;
}

/**
 * Shares one native listener for equivalent window/document subscriptions.
 * Editor-specific DOM listeners intentionally remain local to their editor.
 */
export function subscribeSharedGlobalEvent(
  target: EventTarget,
  type: string,
  listener: EventListener,
  options?: SharedGlobalEventOptions,
) {
  let targetRegistries = registriesByTarget.get(target);
  if (!targetRegistries) {
    targetRegistries = new Map();
    registriesByTarget.set(target, targetRegistries);
  }

  const registryKey = `${type}:${getListenerOptionsKey(options)}`;
  let registry = targetRegistries.get(registryKey);

  if (!registry) {
    const listeners = new Set<EventListener>();
    const nativeListener: EventListener = (event) => {
      for (const currentListener of [...listeners]) {
        currentListener.call(target, event);
      }
    };

    registry = { listeners, nativeListener, options };
    targetRegistries.set(registryKey, registry);
    target.addEventListener(type, nativeListener, options);
  }

  registry.listeners.add(listener);
  let subscribed = true;

  return () => {
    if (!subscribed) return;
    subscribed = false;

    registry?.listeners.delete(listener);
    if (!registry || registry.listeners.size > 0) return;

    target.removeEventListener(type, registry.nativeListener, registry.options);
    targetRegistries?.delete(registryKey);
  };
}
