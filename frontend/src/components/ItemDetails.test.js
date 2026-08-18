import { buildBarcodePrintHtml } from "./ItemDetails";

describe("buildBarcodePrintHtml", () => {
    it("includes item name, barcode, and print trigger", () => {
        const html = buildBarcodePrintHtml(
            { name: "Laptop", barcode: "INV123456" },
            "data:image/png;base64,abc123"
        );

        expect(html).toContain("Laptop");
        expect(html).toContain("INV123456");
        expect(html).toContain("data:image/png;base64,abc123");
        expect(html).toContain("window.print()");
    });
});
