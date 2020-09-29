import React, { useEffect, useState } from "react";
import { setAccessToken } from "./accessToken";
import { Routes } from "./Routes";

interface AppProps {}

export const App: React.FC<AppProps> = ({}) => {
  const [loading, setLoading] = useState(true);

  //  use the refresh token to get a new access token so that if user refreshes page, he will still be logged in
  useEffect(() => {
    fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include",
    })
      .then(async (x) => {
        const { accessToken } = await x.json();
        setAccessToken(accessToken);
        setLoading(false);
      })
      .catch((err) => console.warn(err));
  }, []);

  if (loading) return <div>Loading...</div>;

  return <Routes />;
};
