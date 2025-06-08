"use client"
import { SessionProvider } from "next-auth/react";
import React from "react";

function provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default provider;
