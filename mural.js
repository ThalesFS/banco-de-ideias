const API_URL = "http://localhost:8080/api/ideias";

let paginaAtual = 0;
let tamanhoPagina = 5;

let termoBusca = "";
let statusFiltro = "";
let ordenacao = "recent";

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const orderBy = document.getElementById("orderBy");
const cardsContainer = document.getElementById("cardsContainer");
const paginationContainer = document.getElementById("pagination");
const iconeBDI = document.getElementById("iconeBDI");
const closeBtn = document.getElementById("close-btn");
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    window.location.href = "login.html"; // se nao achar o usuario logado, manda pra login
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

closeBtn.addEventListener("click", () => {
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

// CHAMADA A API

async function carregarIdeias() {
    try {
        let url = `${API_URL}?page=${paginaAtual}&size=${tamanhoPagina}`;

        if (termoBusca) url += `&busca=${encodeURIComponent(termoBusca)}`;
        if (statusFiltro) url += `&statusIdeia=${statusFiltro}`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        montarCards(dados.content);
        montarPaginacao(dados.totalPages);

    } catch (error) {
        console.error("Erro ao carregar ideias:", error);
    }
}

// montagem dos cards informando os atributos previstos no prototipo (professor, seu departamento, titulo da ideia e sua descricao)
// e um textinho como botao "ver mais" para acessar a ideia individualmente

function criarCard(ideia) {
    return `
            <div class="card">
                <div class="card-header">
                    <strong>${ideia.professorNome}</strong> - 
                    <span>${ideia.professorDepartamento}</span>
                </div>

                <div class="card-title">${ideia.titulo}</div>

                <div class="card-desc">${ideia.descricao}</div>

                <div class="card-footer">
                    <a class="btn-vermais" href="ideia.html?id=${ideia.id}">
                        Ver mais +
                    </a>
                </div>
            </div>
        `;
}

function montarCards(lista) {
    cardsContainer.innerHTML = lista.map(criarCard).join("");
}

// PAGINAÇÃO (ô troço complicado)

function montarPaginacao(totalPaginas) {
    if (totalPaginas <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let html = "";

    // Primeira página
    html += `<button onclick="irParaPagina(0)">&lt;&lt;</button>`;

    // Página anterior
    html += `<button onclick="irParaPagina(${Math.max(paginaAtual - 1, 0)})">&lt;</button>`;

    // Números das páginas (exibe até 5 botões)
    const inicio = Math.max(0, paginaAtual - 2);
    const fim = Math.min(totalPaginas, inicio + 5);

    for (let i = inicio; i < fim; i++) {
        html += `<button class="${i === paginaAtual ? "active" : ""}" onclick="irParaPagina(${i})">${i + 1}</button>`;
    }

    // Próxima página
    html += `<button onclick="irParaPagina(${Math.min(paginaAtual + 1, totalPaginas - 1)})">&gt;</button>`;

    // Última página
    html += `<button onclick="irParaPagina(${totalPaginas - 1})">&gt;&gt;</button>`;

    paginationContainer.innerHTML = html;
}

function irParaPagina(num) {
    paginaAtual = num;
    carregarIdeias();
}


// EVENTOS
// busca
searchInput.addEventListener("input", () => {
    termoBusca = searchInput.value.trim();
    paginaAtual = 0;
    carregarIdeias();
});

// filtro por status
filterStatus.addEventListener("change", () => {
    statusFiltro = filterStatus.value;
    paginaAtual = 0;
    carregarIdeias();
});

// ordenação (do backend ainda não implementada)
orderBy.addEventListener("change", () => {
    ordenacao = orderBy.value;
    paginaAtual = 0;
    carregarIdeias();
});

// e o logout ne
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
});

carregarIdeias();