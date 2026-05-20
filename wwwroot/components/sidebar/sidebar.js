(function () {
    const SIDEBAR_CONFIG_ID = "sidebar-config";

    function parseSidebarConfig() {
        const configElement = document.getElementById(SIDEBAR_CONFIG_ID);
        if (!configElement) {
            return null;
        }

        try {
            return JSON.parse(configElement.textContent || "{}");
        } catch {
            return null;
        }
    }

    function createNavLink(link, currentController) {
        const item = document.createElement("a");
        item.className = "sidebar-nav-button";
        item.href = link.href || "#";

        const normalizedController = (currentController || "").toLowerCase();
        const targetController = (link.controller || "").toLowerCase();
        if (normalizedController && targetController && normalizedController === targetController) {
            item.classList.add("is-active");
        }

        const label = document.createElement("span");
        label.className = "sidebar-nav-label";
        label.textContent = link.label || "Link";

        item.appendChild(label);
        return item;
    }

    function createSection(section, currentController) {
        const sectionElement = document.createElement("section");
        sectionElement.className = "sidebar-section";

        const sectionLabel = document.createElement("span");
        sectionLabel.className = "sidebar-section-label";
        sectionLabel.textContent = section.label || "Seção";
        sectionElement.appendChild(sectionLabel);

        const linksContainer = document.createElement("div");
        linksContainer.className = "sidebar-links";

        (section.links || []).forEach((link) => {
            linksContainer.appendChild(createNavLink(link, currentController));
        });

        sectionElement.appendChild(linksContainer);
        return sectionElement;
    }

    function renderSidebar(sidebarRoot, config, currentController) {
        sidebarRoot.innerHTML = "";

        (config.sections || []).forEach((section) => {
            sidebarRoot.appendChild(createSection(section, currentController));
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const sidebarRoot = document.querySelector(".js-am-sidebar-root");
        if (!sidebarRoot) {
            return;
        }

        const config = parseSidebarConfig();
        if (!config) {
            return;
        }

        const currentController = document.body.dataset.currentController || "";
        renderSidebar(sidebarRoot, config, currentController);
    });
})();
