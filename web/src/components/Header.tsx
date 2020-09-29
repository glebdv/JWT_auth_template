import React from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { setAccessToken } from "../accessToken";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

const Header: React.FC = () => {
  // @TODO: add persisted cache here (updateing after mutating)
  const { data, loading } = useMeQuery();
  const [logout, { client }] = useLogoutMutation();

  let welcomeText: any = null;

  const logoutHandler = async () => {
    if (!data || !data.me) return;

    await logout();
    setAccessToken("");

    try {
      await client.resetStore();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    welcomeText = null;
  } else if (data && data.me) {
    welcomeText = <div>Welcome, {data.me.email}</div>;
  } else {
    welcomeText = <div>Not logged in</div>;
  }

  return (
    <header>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/register">Register</Link>
      </div>
      <div>
        <Link to="/login">Login</Link>
      </div>
      <div>
        <Link to="/bye">Bye</Link>
      </div>
      {welcomeText}
      {!loading && data && data.me && (
        <button onClick={() => logoutHandler()}>Logout</button>
      )}
    </header>
  );
};

export default Header;
