(function () {
    // Coleta todos os componentes de seleção única presentes na tela.
    const selects = Array.from(document.querySelectorAll(".enum-combo-box"));

    // Mantém controle para evitar registrar listeners duplicados quando init for chamado mais de uma vez.
    let initialized = false;

    // Se não houver componentes na página, expõe API vazia para manter contrato estável.
    if (!selects.length) {
        window.EnumComboBox = {
            // Inicialização vazia para páginas sem enum-combo-box.
            init: () => { },
            // Sincronização vazia para páginas sem enum-combo-box.
            syncAll: () => { }
        };
        return;
    }

    // Função utilitária para obter as partes internas de um select customizado.
    const getControlParts = (selectElement) => {
        // Captura o botão/trigger responsável por abrir o menu.
        const trigger = selectElement.querySelector(":scope > button[type='button']");
        // Captura o input hidden que armazena o valor selecionado.
        const valueInput = selectElement.querySelector("input[type='hidden']");
        // Captura todas as opções clicáveis do menu.
        const options = Array.from(selectElement.querySelectorAll(".enum-combo-box-option"));
        // Retorna objeto com os elementos para facilitar uso posterior.
        return { trigger, valueInput, options };
    };

    // Sincroniza valor do input com estado visual e texto exibido no trigger.
    const syncOptionState = (selectElement) => {
        // Obtém trigger, input e opções do componente atual.
        const { trigger, valueInput, options } = getControlParts(selectElement);

        // Garante que todos os elementos obrigatórios existam antes de prosseguir.
        if (!trigger || !valueInput || !options.length) {
            return;
        }

        // Lê valor atual armazenado no input hidden.
        const currentValue = valueInput.value ?? "";
        // Monta conjunto de valores considerados vazios para ocultar rótulo.
        const emptyValues = new Set(
            // Lê lista de vazios configurada no dataset.
            (valueInput.dataset.emptyValues || "")
                // Divide os valores por vírgula.
                .split(",")
                // Remove espaços extras em cada item.
                .map((value) => value.trim())
                // Remove itens efetivamente vazios da lista intermediária.
                .filter((value) => value !== "")
        );

        // Inclui string vazia como valor vazio padrão.
        emptyValues.add("");

        // Encontra opção correspondente ao valor atual do input.
        let activeOption = options.find((option) => option.dataset.value === currentValue);

        // Se não achar opção válida para valor não vazio, aplica fallback para primeira opção.
        if (!activeOption && currentValue !== "") {
            // Define primeira opção como ativa.
            activeOption = options[0];
            // Sincroniza input hidden com valor da opção de fallback.
            valueInput.value = activeOption.dataset.value ?? "";
        }

        // Atualiza classe visual e atributo ARIA de cada opção.
        options.forEach((option) => {
            // Verifica se a opção iterada é a opção ativa.
            const isActive = option === activeOption;
            // Liga/desliga classe CSS de destaque.
            option.classList.toggle("active", isActive);
            // Atualiza atributo de acessibilidade com estado pressionado.
            option.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        // Define rótulo da opção ativa com fallback para texto do elemento.
        const activeLabel = activeOption
            ? (activeOption.dataset.label || activeOption.textContent?.trim() || "")
            : "";

        // Mostra rótulo no trigger apenas quando valor não for considerado vazio.
        trigger.textContent = emptyValues.has(currentValue)
            ? ""
            : activeLabel;
        // Emite evento input para integrações reativas ouvirem mudança.
        valueInput.dispatchEvent(new Event("input", { bubbles: true }));
        // Emite evento change para manter compatibilidade com listeners padrão.
        valueInput.dispatchEvent(new Event("change", { bubbles: true }));
    };

    // Fecha menu do select e atualiza atributo ARIA do trigger.
    const closeSelect = (selectElement) => {
        // Localiza trigger do componente atual.
        const trigger = selectElement.querySelector(":scope > button[type='button']");
        // Remove classe de abertura do menu.
        selectElement.classList.remove("open");
        // Se trigger existir, marca estado de expansão como falso.
        if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
        }
    };

    // Abre menu do select e atualiza atributo ARIA do trigger.
    const openSelect = (selectElement) => {
        // Localiza trigger do componente atual.
        const trigger = selectElement.querySelector(":scope > button[type='button']");
        // Adiciona classe de abertura do menu.
        selectElement.classList.add("open");
        // Se trigger existir, marca estado de expansão como verdadeiro.
        if (trigger) {
            trigger.setAttribute("aria-expanded", "true");
        }
    };

    // Recalcula estado visual de todos os componentes.
    const syncAll = () => {
        selects.forEach((selectElement) => {
            syncOptionState(selectElement);
        });
    };

    // Registra comportamento de cada componente encontrado na página.
    const init = () => {
        // Evita duplicação de listeners quando init for chamado mais de uma vez.
        if (initialized) {
            return;
        }

        selects.forEach((selectElement) => {
            // Obtém partes internas necessárias para interação.
            const { trigger, options } = getControlParts(selectElement);

            // Se componentes mínimos não existirem, ignora este select.
            if (!trigger || !options.length) {
                return;
            }

            // Alinha estado inicial visual com valor já presente no input hidden.
            syncOptionState(selectElement);

            // Alterna abertura ao clicar na área principal do componente.
            selectElement.addEventListener("click", (event) => {
                // Ignora cliques no menu/opções para não reabrir indevidamente.
                if (event.target.closest(".enum-combo-box-menu")) {
                    return;
                }

                // Verifica se select atual está aberto no momento do clique.
                const isOpen = selectElement.classList.contains("open");

                // Fecha todos os selects antes de decidir abrir o atual.
                selects.forEach(closeSelect);

                // Se estava fechado, abre o select clicado.
                if (!isOpen) {
                    openSelect(selectElement);
                }
            });

            // Registra clique para cada opção do menu.
            options.forEach((option) => {
                // Ao clicar em uma opção, atualiza valor selecionado.
                option.addEventListener("click", () => {
                    // Busca o input hidden associado ao select atual.
                    const valueInput = selectElement.querySelector("input[type='hidden']");
                    // Se input não existir, não há como persistir seleção.
                    if (!valueInput) {
                        return;
                    }

                    // Copia valor da opção clicada para o input hidden.
                    valueInput.value = option.dataset.value ?? "";
                    // Atualiza estado visual após mudança de valor.
                    syncOptionState(selectElement);
                    // Fecha menu após seleção para concluir interação.
                    closeSelect(selectElement);
                });
            });
        });

        // Fecha selects ao clicar fora de cada componente.
        document.addEventListener("click", (event) => {
            // Percorre todos os selects para validar se clique foi externo.
            selects.forEach((selectElement) => {
                // Se o clique ocorrer fora do componente, fecha o menu.
                if (!selectElement.contains(event.target)) {
                    closeSelect(selectElement);
                }
            });
        });

        initialized = true;
    };

    // Expõe API pública simples para inicialização e sincronização externa.
    window.EnumComboBox = {
        init,
        syncAll
    };

    // Mantém compatibilidade com páginas legadas que apenas importam o script.
    init();
})();
