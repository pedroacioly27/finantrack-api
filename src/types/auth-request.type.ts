export type AuthRequest = Request & {
  user: {
    sub: number;
    email: string;
  };
};
