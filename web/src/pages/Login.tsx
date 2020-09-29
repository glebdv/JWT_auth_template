import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { getAccessToken, setAccessToken } from "../accessToken";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login] = useLoginMutation();

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let response: any = null;

    try {
      response = await login({
        variables: {
          email,
          password,
        },
        update: (store, { data }) => {
          if (!data) return null;

          store.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.login.user,
            },
          });
        },
      });

      if (response && response.data) {
        setAccessToken(response.data.login.accessToken);
        const token = getAccessToken();
        console.log(token);
      }

      history.push("/");
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <div>
        <input
          type="text"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </div>
      <span style={{ color: "red" }}>{error}</span>
    </form>
  );
};
