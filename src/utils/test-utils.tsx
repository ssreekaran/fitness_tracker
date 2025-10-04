import { ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { AllTheProviders } from "./test-providers";

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// Render function without router for components that don't need routing
const renderWithoutRouter = (
  ui: ReactElement,
  options?: RenderOptions
): RenderResult => render(ui, options);

// Re-export testing library functions
export { screen, waitFor, fireEvent, act } from "@testing-library/react";
export { customRender as render, renderWithoutRouter };
