// Captura o ID da ideia atraves de parametro da URL
const urlParams = new URLSearchParams(window.location.search);
const ideiaId = urlParams.get("id");

// Elementos da página
const tituloEl = document.getElementById("titulo-ideia");
const professorEl = document.getElementById("professor-ideia");
const descricaoEl = document.getElementById("descricao-ideia");
const tecnologiasEl = document.getElementById("tecnologias-ideia");
const cursosEl = document.getElementById("cursos-ideia");
const statusEl = document.getElementById("status-ideia");
const btnInteresse = document.getElementById("btn-interesse");
const iconeBDI = document.getElementById("iconeBDI");
const botaoX = document.getElementById("close-btn");

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        window.location.href = "login.html"; // se nao achar o usuario logado, manda pra login
    }

    // logout
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });

    // controla a visibilidade do botão "Tenho Interesse" (por enquanto será assim)
    if (!usuario || usuario.tipo !== "aluno") {
        btnInteresse.style.display = "none";
    }

    //Redireciona o ícone BDI Home (pegando o tipo do usuario logado)
    iconeBDI.addEventListener("click", () => {
        if (!usuario) {
            window.location.href = "login.html";
            return;
        }

        if (usuario.tipo === "aluno") {
            window.location.href = "alunoHome.html";
        } else if (usuario.tipo === "professor") {
            window.location.href = "professorHome.html";
        }
    });

    botaoX.addEventListener('click', function () {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Se não houver histórico, redireciona para uma página padrão
            window.location.href = '/';
        }
    });

    btnInteresse.addEventListener("click", async () => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario || usuario.tipo !== "aluno") return;

        const temInteresse = btnInteresse.dataset.interesse === "ativo";

        if (!temInteresse) {
            // -------------------------------- REGISTRAR INTERESSE ---------------------------------
            try {
                const payload = { ideiaId: Number(ideiaId), alunoId: usuario.id };

                const response = await fetch("http://localhost:8080/api/interesses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("Interesse registrado com sucesso!");
                    window.location.href = "alunoHome.html";
                    return;
                }

                // aqui serve mais para testes, o esperado é que o botão mude e nao ocorra este cenário
                if (response.status === 409) {
                    alert("Você já demonstrou interesse nesta ideia :)");
                    return;
                }

                alert("Erro ao registrar interesse.");

            } catch (erro) {
                console.error(erro);
                alert("Erro ao registrar interesse.");
            }
            // -------------------------------- REGISTRAR INTERESSE ---------------------------------
        } else {
            // ---------------------------------vv REMOVER INTERESSE vv-----------------------------------
            const confirmar = confirm("Tem certeza de que deseja retirar seu interesse?");
            if (!confirmar) return;

            try {
                // Primeiro busca o interesse para obter o ID
                const busca = await fetch(`http://localhost:8080/api/interesses/buscar?alunoId=${usuario.id}&ideiaId=${ideiaId}`);

                if (!busca.ok) {
                    alert("Não foi possível localizar seu interesse para removê-lo.");
                    return;
                }

                const interesse = await busca.json(); // aqui tem o objeto que quero o ID

                const response = await fetch(`http://localhost:8080/api/interesses/${interesse.id}`, {
                    method: "DELETE"
                });

                if (response.ok) {
                    alert("Interesse retirado com sucesso. Há muitas outras ideias!");
                    window.location.href = "alunoHome.html";
                    return;
                }

                alert("Erro ao retirar interesse.");

            } catch (erro) {
                console.error(erro);
                alert("Erro ao retirar interesse.");
            }
        }
    });     // --------------------------------- ^^ REMOVER INTERESSE ^^ ----------------------------------

    // ---------------------------------------------------------------- RESPONSAVEL POR ALTERAR O BOTÃO DE INTERESSE ---------------------------------
    async function verificarInteresse() {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario || usuario.tipo !== "aluno") return;

        try {
            const resp = await fetch(`http://localhost:8080/api/interesses/verificar?alunoId=${usuario.id}&ideiaId=${ideiaId}`);

            if (resp.status === 200) {
                // Se o aluno já tem interesse, troca o botão para o de desfazer interesse
                btnInteresse.textContent = "Retirar Interesse";
                btnInteresse.classList.add("btn-cancelar");
                btnInteresse.dataset.interesse = "ativo";
            } else {
                // Não tem interesse -> botão normal
                btnInteresse.textContent = "Tenho Interesse";
                btnInteresse.classList.remove("btn-cancelar");
                btnInteresse.dataset.interesse = "inativo";
            }

        } catch (e) {
            console.error("Erro ao verificar interesse:", e);
        }
    }// ---------------------------------------------------------------- RESPONSAVEL POR ALTERAR O BOTÃO DE INTERESSE ---------------------------------

    // ----------------------------------------------------------- RESPONSAVEL POR CARREGAR OS DADOS DA IDEIA ---------------------------------
    async function carregarIdeia() {
        try {
            const response = await fetch(`http://localhost:8080/api/ideias/${ideiaId}`);

            if (!response.ok) {
                throw new Error("Não foi possível carregar a ideia.");
            }

            const ideia = await response.json();

            // Preenche campos na tela
            tituloEl.textContent = ideia.titulo;
            professorEl.textContent = `${ideia.professorNome} (${ideia.professorDepartamento})`;
            descricaoEl.textContent = ideia.descricao;

            tecnologiasEl.textContent = ideia.tecnologias || "Não informado";
            cursosEl.textContent = ideia.cursos || "Não informado";
            if (ideia.status === "EM_ANDAMENTO") {
                ideia.status = "EM ANDAMENTO"
            }
            statusEl.textContent = ideia.status;

        } catch (erro) {
            console.error(erro);
            alert("Erro ao carregar a ideia. Consulte o console");
        }
    }// ----------------------------------------------------------- RESPONSAVEL POR CARREGAR OS DADOS DA IDEIA ---------------------------------

    // ---------------------------------------------------------- RESPONSAVEL POR LISTAR OS ALUNOS INTERESSADOS NA IDEIA (Visualização apenas do professor dono da ideia) ---------------------------------
    async function carregarInteressados() {
        const usuario = JSON.parse(localStorage.getItem("usuario"));

        if (!usuario || usuario.tipo !== "professor") {
            return; // aluno não deve ver a lista
        }

        try {
            // Primeiro busca a ideia para saber quem é o dono
            const ideiaResp = await fetch(`http://localhost:8080/api/ideias/${ideiaId}`);
            const ideia = await ideiaResp.json();
            console.log(ideia);
            console.log(ideia.professorId);
            console.log(usuario.id);

            if (ideia.professorId !== usuario.id) {
                return; // professor NÃO é dono: não mostra
            }

            // Então busca lista de interessados
            const resp = await fetch(`http://localhost:8080/api/interesses/ideia/${ideiaId}`);

            if (!resp.ok) {
                console.warn("Nenhum interessado encontrado.");
                return;
            }

            const interessados = await resp.json();

            const bloco = document.getElementById("bloco-interessados");
            const lista = document.getElementById("lista-interessados");

            bloco.style.display = "block"; // agora mostra o bloco

            if (interessados.length === 0) {
                lista.innerHTML = "<li>Nenhum aluno demonstrou interesse ainda.</li>";
                return;
            }

            lista.innerHTML = "";

            interessados.forEach(aluno => {
                const li = document.createElement("li");
                li.textContent = `${aluno.nome} — ${aluno.curso || "Curso não informado"}`;
                lista.appendChild(li);
            });

        } catch (erro) {
            console.error("Erro ao carregar interessados:", erro);
        }
    }// ---------------------------------------------------------- RESPONSAVEL POR LISTAR OS ALUNOS INTERESSADOS NA IDEIA (Visualização apenas do professor dono da ideia) ---------------------------------

    carregarIdeia();
    verificarInteresse();
    carregarInteressados();

});
