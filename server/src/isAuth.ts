import { verify } from "jsonwebtoken";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { MyContext } from "./MyContext";

export const isAuth: Middleware<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];

  // if (!authorization) throw new Error("Not authenticated a");
  if (!authorization) return next();

  try {
    const token = authorization.split(" ")[1];
    //payload = return sign() function first param (jsonwebtoken) in auth.ts
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (error) {
    console.log(error);
    throw new Error("Not authenticated x");
  }

  return next();
};
