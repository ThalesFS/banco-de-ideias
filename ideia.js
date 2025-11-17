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

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        window.location.href = "login.html"; // se nao achar o usuario logado, manda pra login
    }

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


    // Função para carregar dados da ideia
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
            cursosEl.textContent = ideia.cursosInteresse || "Não informado";
            statusEl.textContent = ideia.status;

        } catch (erro) {
            console.error(erro);
            alert("Erro ao carregar a ideia. Veja o console para mais detalhes.");
        }
    }
    carregarIdeia();

    // logout
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });
});