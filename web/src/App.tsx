import React, { useEffect, useState } from "react";
import { setAccessToken } from "./accessToken";
import { Routes } from "./Routes";

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // use the refresh token to get a new access token so that if user refreshes page, he will still be logged in
  // uses same-site policy so an attacker cannot use this route outside of the website
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
