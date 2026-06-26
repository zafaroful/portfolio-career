type SessionLike = {
  user?: {
    id?: string | null;
    email?: string | null;
  } | null;
} | null | undefined;

/** Auth.js can expose an empty session object; require a user id. */
export function hasValidSession(session: SessionLike): boolean {
  return Boolean(session?.user?.id);
}
