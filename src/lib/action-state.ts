export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  /** Timestamp so repeated identical results still trigger UI feedback. */
  at?: number;
  data?: Record<string, unknown>;
};

export const idleState: ActionState = { status: "idle" };
