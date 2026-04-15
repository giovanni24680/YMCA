import { downloadStateFile } from "../storage.js";

export function initExportButtons() {
    document.querySelectorAll("[data-export-state]").forEach((button) => {
        button.addEventListener("click", () => {
            downloadStateFile(button.dataset.exportFilename || "oulm-local-export.json");
        });
    });
}
