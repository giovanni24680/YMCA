export function initStepper(rootSelector = "[data-stepper]") {
    document.querySelectorAll(rootSelector).forEach((stepper) => {
        const panels = [...stepper.querySelectorAll("[data-step-panel]")];
        const badges = [...stepper.querySelectorAll("[data-step-badge]")];
        const previous = stepper.querySelector("[data-step-prev]");
        const next = stepper.querySelector("[data-step-next]");
        const submit = stepper.querySelector("[data-step-submit]");
        const progressFill = stepper.querySelector("[data-stepper-progress-fill]");
        let currentIndex = 0;

        function sync() {
            panels.forEach((panel, index) => {
                panel.dataset.current = String(index === currentIndex);
            });

            badges.forEach((badge, index) => {
                badge.dataset.current = String(index === currentIndex);
            });

            if (previous) {
                previous.disabled = currentIndex === 0;
                previous.style.opacity = currentIndex === 0 ? "0.4" : "1";
            }

            if (next) {
                next.hidden = currentIndex === panels.length - 1;
            }

            if (submit) {
                submit.hidden = currentIndex !== panels.length - 1;
            }

            if (progressFill) {
                const percent = panels.length > 1
                    ? Math.round(((currentIndex + 1) / panels.length) * 100)
                    : 100;
                progressFill.style.width = `${percent}%`;
            }
        }

        next?.addEventListener("click", () => {
            currentIndex = Math.min(currentIndex + 1, panels.length - 1);
            sync();
        });

        previous?.addEventListener("click", () => {
            currentIndex = Math.max(currentIndex - 1, 0);
            sync();
        });

        badges.forEach((badge, index) => {
            badge.addEventListener("click", () => {
                currentIndex = index;
                sync();
            });
        });

        sync();
    });
}
