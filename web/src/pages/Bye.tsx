import React from "react";
import { useByeQuery } from "../generated/graphql";

export const Bye: React.FC = ({}) => {
  const { data, loading, error } = useByeQuery({
    fetchPolicy: "network-only",
  });

  if (loading) return <div>loading...</div>;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) return <div>No Data</div>;

  return <div>{data.bye}</div>;
};
