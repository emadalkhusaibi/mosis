"use client";
/* Save scheduling relies on refs inside stable callbacks; the compiler hint below is about optimisation, not correctness. */
/* eslint-disable react-hooks/preserve-manual-memoization */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { emptyState, stateSchema, type State } from "@/domain/state";
import { migrate } from "@/domain/migrate";
import { useSession as useAuthSession } from "@/lib/auth-client";
import { accountsEnabled } from "@/lib/features";

const noSession = { isPending: false, data: null } as const;
/** With accounts off, the session is never fetched and everyone works as a guest. */
const useSession = accountsEnabled ? useAuthSession : () => noSession;

export type SaveStatus = "loading" | "saved" | "saving" | "local" | "error" | "conflict" | "offline";
export type Mode = "guest" | "account";

const GUEST_KEY = "moasis-workspace";
/** Keys written by the two original apps; read once so earlier practice isn't lost. */
const LEGACY_KEYS = ["moasis-liquid-v1", "moasis-practice-v1"];

type Workspace = {
  state: State;
  ready: boolean;
  mode: Mode;
  status: SaveStatus;
  user: { name: string; email: string } | null;
  /** Applies a change. Returns false (and changes nothing) if the result would be invalid. */
  update: (fn: (s: State) => State) => boolean;
  replace: (s: State) => void;
  retry: () => void;
  reloadFromServer: () => Promise<void>;
};

const Ctx = createContext<Workspace | null>(null);

function readGuest(): State | null {
  try {
    const own = migrate(JSON.parse(localStorage.getItem(GUEST_KEY) ?? "null"));
    if (own) return own;
    for (const key of LEGACY_KEYS) {
      const legacy = migrate(JSON.parse(localStorage.getItem(key) ?? "null"));
      if (legacy) return legacy;
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return null;
}

function writeGuest(s: State) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [state, setState] = useState<State>(emptyState);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("guest");
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [user, setUser] = useState<Workspace["user"]>(null);

  const revision = useRef(0);
  const inFlight = useRef(false);
  const dirty = useRef(false);
  const latest = useRef(state);
  const modeRef = useRef(mode);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushToServer = useCallback(async () => {
    if (inFlight.current) {
      dirty.current = true;
      return;
    }
    inFlight.current = true;
    dirty.current = false;
    setStatus("saving");
    try {
      const res = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: latest.current, revision: revision.current }),
      });
      if (res.status === 409) {
        setStatus("conflict");
        dirty.current = false;
      } else if (!res.ok) {
        setStatus("error");
      } else {
        revision.current = (await res.json()).revision;
        setStatus(dirty.current ? "saving" : "saved");
      }
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    } finally {
      inFlight.current = false;
      if (dirty.current) void pushToServer();
    }
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (modeRef.current === "guest") {
      // "Saved on this device" appears only once the browser has accepted the write.
      setStatus("saving");
      timer.current = setTimeout(() => setStatus(writeGuest(latest.current) ? "local" : "error"), 250);
    } else {
      setStatus("saving");
      timer.current = setTimeout(() => void pushToServer(), 600);
    }
  }, [pushToServer]);

  const loadAccount = useCallback(async () => {
    const res = await fetch("/api/workspace", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { user: { name: string; email: string }; state: State | null; revision: number };
    setUser(data.user);
    revision.current = data.revision;
    if (data.state) {
      latest.current = data.state;
      setState(data.state);
      setStatus("saved");
    } else {
      // First sign-in: carry over guest practice rather than starting from nothing.
      const guest = readGuest();
      const initial = guest ?? emptyState();
      setState(initial);
      latest.current = initial;
      if (guest) await pushToServer();
      else setStatus("saved");
    }
  }, [pushToServer]);

  useEffect(() => {
    if (session.isPending) return;
    let cancelled = false;
    (async () => {
      if (session.data?.user) {
        setMode("account");
        modeRef.current = "account";
        try {
          await loadAccount();
        } catch {
          if (!cancelled) setStatus("error");
        }
      } else {
        setMode("guest");
        modeRef.current = "guest";
        setUser(null);
        const guest = readGuest() ?? emptyState();
        latest.current = guest;
        setState(guest);
        setStatus("local");
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [session.isPending, session.data?.user, loadAccount]);

  // Flush pending guest writes when the tab is hidden or closed so nothing is lost.
  useEffect(() => {
    const flush = () => {
      if (modeRef.current !== "guest" || !timer.current) return;
      clearTimeout(timer.current);
      timer.current = null;
      setStatus(writeGuest(latest.current) ? "local" : "error");
    };
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  const update = useCallback(
    (fn: (s: State) => State) => {
      const next = fn(latest.current);
      if (next === latest.current) return true;
      const parsed = stateSchema.safeParse(next);
      if (!parsed.success) {
        if (process.env.NODE_ENV !== "production") console.warn("Rejected invalid workspace change", parsed.error.issues);
        return false;
      }
      latest.current = parsed.data;
      setState(parsed.data);
      schedule();
      return true;
    },
    [schedule],
  );

  const replace = useCallback(
    (s: State) => {
      latest.current = s;
      setState(s);
      schedule();
    },
    [schedule],
  );

  const value = useMemo<Workspace>(
    () => ({
      state,
      ready,
      mode,
      status,
      user,
      update,
      replace,
      retry: () => {
        if (modeRef.current === "guest") setStatus(writeGuest(latest.current) ? "local" : "error");
        else void pushToServer();
      },
      reloadFromServer: async () => {
        setStatus("loading");
        try {
          await loadAccount();
        } catch {
          setStatus("error");
        }
      },
    }),
    [state, ready, mode, status, user, update, replace, pushToServer, loadAccount],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const v = useContext(Ctx);
  if (!v) throw new Error("WorkspaceProvider missing");
  return v;
}
