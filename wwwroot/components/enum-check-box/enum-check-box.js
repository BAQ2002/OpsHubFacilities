(function () {
    // Guarda configuração textual padrão usada nos rótulos dos gatilhos.
    const LABELS = {
        single: "1 selecionado",
        multiple: (count) => `${count} selecionados`
    };

    // Coleta todos os selects de múltipla escolha disponíveis na tela atual.
    const selects = Array.from(document.querySelectorAll(".enum-check-box"));

    // Se não houver nenhum enum-check-box na página, não há trabalho a executar.
    if (!selects.length) {
        // Mesmo sem componentes ativos, expõe API mínima para manter contrato estável.
        window.EnumCheckBox = {
            // Inicialização vazia para páginas sem enum-check-box.
            init: () => { },
            // Sincronização vazia para páginas sem enum-check-box.
            syncAll: () => { }
        };
        return;
    }

    // Marca estado visual de preenchimento do campo flutuante pai de cada select.
    const syncFloatingState = (selectElement) => {
        
        const field = selectElement.closest(".floating-field");//Localiza o container visual responsável pela label flutuante.
        // Se não existir container, interrompe para evitar erro de acesso.
        if (!field) {
            return;
        }

        // Conta quantos checkboxes estão efetivamente marcados no componente.
        const checkedCount = selectElement.querySelectorAll("input[type='checkbox']:checked").length;
        
        field.classList.toggle("filled", checkedCount > 0); //Ativa classe de preenchido quando ao menos um item estiver selecionado.
    };

    // Atualiza texto do gatilho do select conforme quantidade de itens marcados.
    const syncTriggerLabel = (selectElement) => {
        // Captura botão principal usado para abrir/fechar menu.
        const trigger = selectElement.querySelector(":scope > button[type='button']");
        // Se o gatilho não existir, não há rótulo para sincronizar.
        if (!trigger) {
            return;
        }

        // Conta itens atualmente marcados no menu interno.
        const checkedCount = selectElement.querySelectorAll("input[type='checkbox']:checked").length;

        // Quando não houver seleção, o rótulo deve permanecer vazio.
        if (checkedCount === 0) {
            trigger.textContent = "";
            syncFloatingState(selectElement);
            return;
        }

        // Define texto singular ou plural de acordo com total selecionado.
        trigger.textContent = checkedCount === 1
            ? LABELS.single
            : LABELS.multiple(checkedCount);
        // Recalcula estado visual do campo após atualizar o rótulo.
        syncFloatingState(selectElement);
    };

    // Fecha um único select e atualiza metadados de acessibilidade do gatilho.
    const closeSelect = (selectElement) => {
        
        const trigger = selectElement.querySelector         //Captura gatilho principal para atualizar aria-expanded.
                 (":scope > button[type='button']");
        
        selectElement.classList.remove("open");             //Remove marcador visual de aberto. 
       
        if (trigger)                                        //Se houver gatilho.
        {
            trigger.setAttribute("aria-expanded", "false"); //Explicita estado fechado para leitores de tela.
        }
    };

    // Abre um único select e atualiza metadados de acessibilidade do gatilho.
    const openSelect = (selectElement) => {
        // Captura gatilho principal para atualizar aria-expanded.
        const trigger = selectElement.querySelector(":scope > button[type='button']");
        
        selectElement.classList.add("open");// Adiciona marcador visual de aberto.
        
        if (trigger) //Se houver gatilho, explicita estado aberto para leitores de tela.
        {
            trigger.setAttribute("aria-expanded", "true");
        }
    };

    // Atualiza todos os componentes de múltipla seleção da página.
    const syncAll = () => {
        // Percorre cada select para sincronizar texto e estado visual.
        selects.forEach(syncTriggerLabel);
    };

    // Registra eventos de interação em todos os enum-check-boxs encontrados.
    const init = () => {
        // Conecta fluxo de abertura/fechamento e seleção para cada componente.
        selects.forEach((selectElement) => {
            // Captura gatilho principal para abertura do menu.
            const trigger = selectElement.querySelector(":scope > button[type='button']");
            // Captura todos os checkboxes internos do select.
            const checkboxes = Array.from(selectElement.querySelectorAll("input[type='checkbox']"));

            // Se estrutura mínima não existir, ignora componente inválido.
            if (!trigger || !checkboxes.length) {
                return;
            }

            // Alterna abertura ao clicar no container fora do menu interno.
            selectElement.addEventListener("click", (event) => {
                // Impede propagação para evitar fechamento imediato pelo listener global.
                event.stopPropagation();
                // Ignora cliques dentro do menu para não conflitar com escolha de opção.
                if (event.target.closest(".enum-check-box-menu")) {
                    return;
                }

                // Verifica se componente atual estava aberto antes do clique.
                const wasOpen = selectElement.classList.contains("open");
                // Fecha todos os selects antes de decidir o próximo estado.
                selects.forEach(closeSelect);

                // Se estava fechado, abre componente clicado.
                if (!wasOpen) {
                    openSelect(selectElement);
                }
            });

            // Reage à marcação/desmarcação de cada checkbox interno.
            checkboxes.forEach((checkbox) => {
                checkbox.addEventListener("change", () => {
                    // Atualiza rótulo e estado visual imediatamente após alteração.
                    syncTriggerLabel(selectElement);
                    // Publica evento semântico para páginas reagirem (ex.: reaplicar filtros).
                    selectElement.dispatchEvent(new CustomEvent("enum-check-box:change", { bubbles: true }));
                });
            });

            // Sincroniza estado inicial do componente no carregamento.
            syncTriggerLabel(selectElement);
        });

        // Fecha todos os componentes quando houver clique fora deles.
        document.addEventListener("click", () => {
            selects.forEach(closeSelect);
        });
    };

    // Expõe API pública simples para inicialização e sincronização externa.
    window.EnumCheckBox = {
        init,
        syncAll
    };
})();
