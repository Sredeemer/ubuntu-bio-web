import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasetSearch } from "../DatasetSearch";

describe("DatasetSearch Component", () => {
  it("renders catalog search with initial dataset cards", () => {
    render(<DatasetSearch />);
    expect(screen.getByText("African Bioinformatics Datasets")).toBeDefined();
    expect(screen.getByPlaceholderText(/Search by pathogen/i)).toBeDefined();
    expect(screen.getByText(/Lassa Mammarenavirus/i)).toBeDefined();
  });

  it("filters datasets by search query", () => {
    render(<DatasetSearch />);
    const searchInput = screen.getByPlaceholderText(/Search by pathogen/i);

    fireEvent.change(searchInput, { target: { value: "cholera" } });

    expect(screen.getByText(/Vibrio cholerae/i)).toBeDefined();
    expect(screen.queryByText(/Lassa Mammarenavirus/i)).toBeNull();
  });

  it("filters datasets by pathogen category pill", () => {
    render(<DatasetSearch />);
    const vectorBtn = screen.getByRole("button", { name: "Vector" });

    fireEvent.click(vectorBtn);

    expect(screen.getByText(/Anopheles gambiae/i)).toBeDefined();
    expect(screen.queryByText(/Lassa Mammarenavirus/i)).toBeNull();
  });

  it("filters datasets by country query in search input", () => {
    render(<DatasetSearch />);
    const searchInput = screen.getByPlaceholderText(/Search by pathogen/i);

    fireEvent.change(searchInput, { target: { value: "Kenya" } });

    expect(screen.getByText(/Vibrio cholerae/i)).toBeDefined();
    expect(screen.queryByText(/Lassa Mammarenavirus/i)).toBeNull();
  });

  it("filters datasets by African Union country dropdown", () => {
    render(<DatasetSearch />);
    const countrySelect = screen.getByLabelText(/Filter by African Union nation/i);

    fireEvent.change(countrySelect, { target: { value: "SN" } });

    expect(screen.getByText(/Lassa Mammarenavirus/i)).toBeDefined();
    expect(screen.queryByText(/Vibrio cholerae/i)).toBeNull();
  });

  it("renders lead institution in card footer strip", () => {
    render(<DatasetSearch />);
    expect(screen.getByText("Institut Pasteur de Dakar")).toBeDefined();
  });
});
