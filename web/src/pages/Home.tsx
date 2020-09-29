import React from "react";
import { useUsersQuery } from "../generated/graphql";

interface HomeProps {}

export const Home: React.FC<HomeProps> = ({}) => {
  const { loading, data } = useUsersQuery({ fetchPolicy: "network-only" }); //no cache - always query db

  if (loading || !data) return <div>loading...</div>;

  return (
    <div>
      <h2>Users: </h2>
      <ul>
        {data.users.map((user) => {
          return (
            <li key={`user${user.id}`}>
              email: {user.email}, id: {user.id}, created at: {user.createdAt}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
