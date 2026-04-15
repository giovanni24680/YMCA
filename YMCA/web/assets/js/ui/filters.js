export function initFilters() {
    const filterGroups = [...document.querySelectorAll("[data-filter-group]")];

    filterGroups.forEach((group) => {
        const targetSelector = group.dataset.filterTarget;
        const buttons = [...group.querySelectorAll("[data-filter-value]")];

        function applyFilter(value) {
            buttons.forEach((button) => {
                button.dataset.active = String(button.dataset.filterValue === value);
            });

            const items = [...document.querySelectorAll(targetSelector)];
            items.forEach((item) => {
                if (value === "all") {
                    item.classList.remove("utility-hidden");
                    item.style.display = "";
                    return;
                }

                const haystack = [
                    item.dataset.county,
                    item.dataset.age,
                    item.dataset.kind,
                    item.dataset.vibe
                ].filter(Boolean);

                const matches = haystack.some((entry) => entry.toLowerCase().includes(value.toLowerCase()));
                if (matches) {
                    item.classList.remove("utility-hidden");
                    item.style.display = "";
                } else {
                    item.classList.add("utility-hidden");
                    item.style.display = "none";
                }
            });
        }

        buttons.forEach((button) => {
            button.addEventListener("click", () => applyFilter(button.dataset.filterValue));
        });

        applyFilter(group.dataset.filterDefault || "all");
    });
}
