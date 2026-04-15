export function initModalSystem() {
    const modals = [...document.querySelectorAll("[data-modal]")];

    function openModal(targetId) {
        const modal = document.querySelector(`[data-modal="${targetId}"]`);
        if (!modal) {
            return;
        }

        modal.dataset.open = "true";
        document.body.style.overflow = "hidden";
    }

    function closeModal(modal) {
        modal.dataset.open = "false";
        document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-open-modal]").forEach((trigger) => {
        trigger.addEventListener("click", () => openModal(trigger.dataset.openModal));
    });

    modals.forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal || event.target.closest("[data-close-modal]")) {
                closeModal(modal);
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        modals.forEach((modal) => {
            if (modal.dataset.open === "true") {
                closeModal(modal);
            }
        });
    });

    return { openModal };
}
