// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecMarkdownContent } from "@/components/specs/spec-markdown-content";

describe("SpecMarkdownContent", () => {
  it("renders markdown headings and lists with the shared renderer", () => {
    render(<SpecMarkdownContent markdown={"# Title\n\n- Item one\n- Item two"} />);

    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Item one")).toBeInTheDocument();
    expect(screen.getByText("Item two")).toBeInTheDocument();
  });
});
