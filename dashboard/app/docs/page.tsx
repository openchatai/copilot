import React from "react";

type Props = {};

function page({}: Props) {
  return <div className="grid grid-cols-6 grid-rows-6 h-screen">
    <div className="bg-primary" />
    <div className="bg-primary-foreground" />
    <div className="bg-secondary" />
    <div className="bg-secondary-foreground" />
    <div className="bg-destructive" />
    <div className="bg-accent" />
    <div className="bg-accent-foreground" />
    <div className="bg-accent-alt" />
  </div>;
}

export default page;
