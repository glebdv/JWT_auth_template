import {
  Arg,
  Ctx,
  Int,
  Query,
  Field,
  Resolver,
  Mutation,
  ObjectType,
  UseMiddleware,
} from "type-graphql";
import { User } from "./entity/User";
import argon2 from "argon2";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => User, { nullable: true })
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    if (!payload) throw new Error("no auth");

    return `your userId is: ${payload.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: MyContext) {
    const authorization = context.req.headers["authorization"];

    if (!authorization) return null;

    try {
      const token = authorization.split(" ")[1];
      //payload = return sign() function first param (jsonwebtoken) in auth.ts
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      context.payload = payload as any;

      return User.findOne(payload.userId);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await argon2.hash(password);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");
    return true;
  }

  // @TODO: testing => do NOT use in PROD!!! this invalidates all tokens for user but it's exposed to public
  // `() => Int`   is there because ints cannot by auto-typecasted. Need to specify
  // better use this in some function some way (i.e. when user clicks "forgot password")
  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({
      where: { email },
      // select: ["password"],
    });

    if (!user) throw new Error("Could not find user");

    const valid = await argon2.verify(user.password, password);

    if (!valid) throw new Error("Please check username and password");

    sendRefreshToken(res, createRefreshToken(user!));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }
}
