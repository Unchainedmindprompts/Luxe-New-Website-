export const sent = [];
export const resendBehavior = { mode: "ok" };

export class Resend {
  constructor() {
    this.emails = {
      send: async (payload) => {
        sent.push(payload);
        if (resendBehavior.mode === "provider-error") {
          return { data: null, error: { name: "mocked-provider-error" } };
        }
        if (resendBehavior.mode === "throw") {
          throw new Error("mocked-exception");
        }
        return { data: { id: "mock-resend-id" }, error: null };
      },
    };
  }
}
