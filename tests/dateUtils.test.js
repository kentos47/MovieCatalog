function formatDateToDMY(isoDate) {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

describe("Date formatting", () => {
  test("formats ISO date to DD/MM/YYYY", () => {
    expect(formatDateToDMY("2025-12-31")).toBe("31/12/2025");
  });
  test("returns empty string for null input", () => {
    expect(formatDateToDMY(null)).toBe("");
  });
  test("returns original string for invalid format", () => {
    expect(formatDateToDMY("invalid")).toBe("invalid");
  });
});
