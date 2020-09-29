import { Response } from "express";

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("jid", token, {
    httpOnly: true, //cannot access cookie through javascript - enables
    path: "/refresh_token",
  });
};
