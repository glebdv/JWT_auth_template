import {
  HttpLink,
  InMemoryCache,
  ApolloLink,
  ApolloClient,
  from,
} from "@apollo/client";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import { getAccessToken, setAccessToken } from "../accessToken";
import JwtDecode from "jwt-decode";

// declare our domain here
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

// what kind of cache are we using (with the in memory cache)
const cache = new InMemoryCache();

// authenticate user when moving through routes
const authMiddleware = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  // add the authorization to the headers
  operation.setContext({
    headers: {
      authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  return forward(operation);
});

// refresh te access token if it's expired (i.e.: mid session - dont want to lose the user)
const tokenRefresh = new TokenRefreshLink({
  accessTokenField: "accessToken",
  isTokenValidOrUndefined: () => {
    const token = getAccessToken();

    if (!token) return true;

    try {
      const { exp } = JwtDecode(token);

      if (Date.now() >= exp * 1000) return false;

      return true;
    } catch (error) {
      return false;
    }
  },
  fetchAccessToken: () => {
    return fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include",
    });
  },
  handleFetch: (accessToken) => {
    setAccessToken(accessToken);
  },
  handleError: (err) => {
    // full control over handling token fetch Error
    console.warn("Your refresh token is invalid. Try to relogin");
    console.log(err);
  },
});

// send out the client. The order in link matters - it's the order they will be executed at
export const apolloClient = new ApolloClient({
  link: from([tokenRefresh, authMiddleware, httpLink]),
  cache,
});
