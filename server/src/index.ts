import "dotenv/config";
import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import cors from "cors";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";
// import { User } from "./entity/User";

(async () => {
  const app = express();
  // fix cors issues by explicitly setting allowed origins
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(cookieParser());

  //special cookie refresh auth endpoint
  app.post("/refresh_token", async (req, res) => {
    // check if jid cookie exists, if not, return an error
    const token = req.cookies.jid;
    if (!token) return res.send({ ok: false, accessToken: "" });

    // make sure the token is not expired and/or there is no error with it
    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      res.send({ ok: false, accessToken: "" });
    }

    // token is valid and we can get its user
    const user: User | undefined = await User.findOne({ id: payload.userId });

    // if no user found, send an empty access token
    if (!user) return res.send({ ok: false, accessToken: "" });

    // if user is trying to use an old token - invalidate it using auto increment token version (in User entity)
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    // reset the refresh token in cookie
    sendRefreshToken(res, createRefreshToken(user));

    // create new access token for them
    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  //Middleware is also applied in resolvers for route auth
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log(`We're a go on PORT 4000`);
  });
})();
