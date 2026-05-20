(function () {
    // Converte string de data (ISO, dd-mm-yyyy ou dd/mm/yyyy) para objeto Date com validação básica.
    function parseDate(value) {
        if (!value) return null;

        const normalized = String(value).trim();
        const localMatch = normalized.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);

        if (localMatch) {
            const day = Number(localMatch[1]);
            const month = Number(localMatch[2]);
            const year = Number(localMatch[3]);

            const parsedLocal = new Date(year, month - 1, day);

            if (
                parsedLocal.getFullYear() === year &&
                parsedLocal.getMonth() === month - 1 &&
                parsedLocal.getDate() === day
            ) {
                return parsedLocal;
            }
        }

        const parsed = new Date(normalized);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    // Formata uma data para exibição no padrão brasileiro dd/mm/yyyy.
    function formatDateBr(value) {
        const date = parseDate(value);
        if (!date) return value ?? "";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear());

        return `${day}/${month}/${year}`;
    }

    // Cria uma instância de datagrid com paginação client-side.
    function create(config) {
        const rowsElement = document.querySelector(config.rowsSelector);
        const countElement = config.countSelector ? document.querySelector(config.countSelector) : null;
        const pageSizeElement = config.pageSizeSelector ? document.querySelector(config.pageSizeSelector) : null;
        const pageInfoElement = config.paginationInfoSelector ? document.querySelector(config.paginationInfoSelector) : null;
        const prevPageButton = config.prevPageSelector ? document.querySelector(config.prevPageSelector) : null;
        const nextPageButton = config.nextPageSelector ? document.querySelector(config.nextPageSelector) : null;

        if (!rowsElement) {
            throw new Error("DataGrid: rowsSelector não encontrado.");
        }

        if (typeof config.rowTemplate !== "function") {
            throw new Error("DataGrid: rowTemplate é obrigatório e deve ser função.");
        }

        let allRows = Array.isArray(config.data) ? config.data : [];
        let currentPage = 1;
        let pageSize = Number(pageSizeElement?.value || config.initialPageSize || 25);

        function getTotalPages() {
            return Math.max(1, Math.ceil(allRows.length / pageSize));
        }

        function getVisibleRows() {
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            return allRows.slice(start, end);
        }

        function clampCurrentPage() {
            const totalPages = getTotalPages();
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;
        }

        function updateBodyHeight() {
            const firstRow = rowsElement.querySelector("tr");
            const rowHeight = firstRow?.getBoundingClientRect().height || 44;

            const tableElement = rowsElement.closest("table");
            const scrollbarWidth = rowsElement.offsetWidth - rowsElement.clientWidth;
            if (tableElement) {
                tableElement.style.setProperty("--datagrid-scrollbar-width", `${Math.max(scrollbarWidth, 0)}px`);
            }
            const rowsPerPage = Number(pageSizeElement?.value || pageSize || config.initialPageSize || 25);
            const safeRowsPerPage = Math.max(rowsPerPage, 1);
            const configuredVisibleRows = Number(config.bodyHeightRows);
            const defaultVisibleRows = Math.min(safeRowsPerPage, 10);
            const visibleRows = Number.isFinite(configuredVisibleRows) && configuredVisibleRows > 0
                ? configuredVisibleRows
                : defaultVisibleRows;
            const defaultBodyHeight = rowHeight * visibleRows;
            const configuredBodyHeight = Number(config.bodyHeight);
            const bodyHeight = Number.isFinite(configuredBodyHeight) && configuredBodyHeight > 0
                ? configuredBodyHeight
                : defaultBodyHeight;

            rowsElement.style.setProperty("--datagrid-body-height", `${bodyHeight}px`);
        }

        function buildPageMarkers(totalPages) {
            if (!pageInfoElement) return;

            const maxVisiblePages = 5;
            pageInfoElement.innerHTML = "";

            const appendPageButton = (pageNumber, isActive = false) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = `datagrid-page-marker${isActive ? " is-active" : ""}`;
                button.textContent = String(pageNumber);
                button.setAttribute("aria-label", `Ir para página ${pageNumber}`);
                button.setAttribute("aria-current", isActive ? "page" : "false");
                button.addEventListener("click", () => setPage(pageNumber));
                pageInfoElement.appendChild(button);
            };

            const appendEllipsisButton = () => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "datagrid-page-marker datagrid-page-marker-ellipsis";
                button.textContent = "...";
                button.setAttribute("aria-label", `Ir para última página (${totalPages})`);
                button.addEventListener("click", () => setPage(totalPages));
                pageInfoElement.appendChild(button);
            };

            if (totalPages <= maxVisiblePages) {
                for (let page = 1; page <= totalPages; page += 1) appendPageButton(page, page === currentPage);
                return;
            }

            for (let page = 1; page <= maxVisiblePages; page += 1) appendPageButton(page, page === currentPage);
            appendEllipsisButton();
        }

        function updateFooter() {
            const total = allRows.length;
            const visible = getVisibleRows().length;

            if (countElement) {
                countElement.innerText = `Mostrando ${visible} de ${total} registro(s)`;
            }

            buildPageMarkers(getTotalPages());

            const isFirstPage = currentPage <= 1;
            const isLastPage = currentPage >= getTotalPages();

            if (prevPageButton) {
                prevPageButton.disabled = isFirstPage;
            }

            if (nextPageButton) {
                nextPageButton.disabled = isLastPage;
            }
        }

        function render() {
            clampCurrentPage();
            const visibleRows = getVisibleRows();

            if (!visibleRows.length) {
                rowsElement.innerHTML = `<tr><td colspan="99">${config.emptyMessage || "Nenhum registro encontrado."}</td></tr>`;
                updateBodyHeight();
                updateFooter();
                return;
            }

            rowsElement.innerHTML = visibleRows.map(config.rowTemplate).join("");
            updateBodyHeight();
            updateFooter();
        }

        function setData(data, options = {}) {
            allRows = Array.isArray(data) ? data : [];

            if (options.resetPage !== false) {
                currentPage = 1;
            }

            render();
        }

        function setPage(page) {
            currentPage = Number(page);
            render();
        }

        function setPageSize(size) {
            const nextSize = Number(size);
            if (!Number.isFinite(nextSize) || nextSize <= 0) return;

            pageSize = nextSize;
            currentPage = 1;
            render();
        }

        pageSizeElement?.addEventListener("change", () => {
            setPageSize(pageSizeElement.value);
        });

        prevPageButton?.addEventListener("click", () => {
            if (currentPage <= 1) return;
            setPage(currentPage - 1);
        });

        nextPageButton?.addEventListener("click", () => {
            if (currentPage >= getTotalPages()) return;
            setPage(currentPage + 1);
        });

        render();

        return {
            setData,
            setPage,
            setPageSize,
            refresh: render,
            getState: () => ({
                currentPage,
                pageSize,
                totalRows: allRows.length,
                totalPages: getTotalPages()
            })
        };
    }

    // Expõe API pública para reutilização nas páginas que renderizam DataGrid.
    window.DataGrid = {
        parseDate,
        formatDateBr,
        create
    };
})();
