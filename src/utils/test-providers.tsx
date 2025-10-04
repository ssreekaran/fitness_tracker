import React from "react";
import { MemoryRouter } from "react-router-dom";

// Custom render function that includes providers
export const AllTheProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};
