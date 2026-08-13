import "next-auth";

// Augments NextAuth's built-in types so `session.user.id` is typed instead
// of needing `as { id: string }` casts sprinkled through every server page.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }
}
