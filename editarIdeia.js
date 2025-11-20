const API_BASE = "http://localhost:8080/api/ideias/";
const urlParams = new URLSearchParams(window.location.search);
const ideiaId = urlParams.get("id");
const usuario = JSON.parse(localStorage.getItem("usuario"));
const professorId = usuario.id;
const logoutBtn = document.getElementById("logout");

//impedimento de usuario nao logado
if (!usuario) {
  window.location.href = "login.html";
}

if (!ideiaId) {
    alert("ID da ideia não informado!");
    window.location.href = "/professorHome.html";
}

// auto explicativo (impede alunos de utilizarem esta funcionalidade)
if (!usuario || usuario.tipo !== "professor") {
    alert("Apenas professores podem editar ideias.");
    window.location.href = "/login.html";
}

// logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
}

// Receber os dados da ideia
async function carregarIdeia() {
    try {
        const response = await fetch(`${API_BASE}${ideiaId}`);

        if (!response.ok) {
            throw new Error("Erro ao buscar ideia");
        }

        const ideia = await response.json();

        document.getElementById("titulo").value = ideia.titulo;
        document.getElementById("descricao").value = ideia.descricao;
        document.getElementById("tecnologias").value = ideia.tecnologias || "";
        document.getElementById("cursos").value = ideia.cursos;

        // Ajustar status no select
        const selectStatus = document.getElementById("status");

        const statusMap = {
            "ABERTA": "aberta",
            "EM_ANDAMENTO": "em andamento",
            "CONCLUIDA": "concluida"
        };

        selectStatus.value = statusMap[ideia.status];
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados da ideia.");
    }
}

carregarIdeia();


// ENVIAR UPDATE (PUT)
document.getElementById("formIdeia").addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;
    const tecnologias = document.getElementById("tecnologias").value;
    const cursos = document.getElementById("cursos").value;
    const status = document.getElementById("status").value;

    // Enum funcionando
    const statusBackend = {
        "aberta": "ABERTA",
        "em andamento": "EM_ANDAMENTO",
        "concluida": "CONCLUIDA"
    };

    const ideiaAtualizada = {
        titulo,
        descricao,
        tecnologias,
        cursos,
        status: statusBackend[status]
    };

    try {
        const response = await fetch(`${API_BASE}${ideiaId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Professor-Id": professorId
            },
            body: JSON.stringify(ideiaAtualizada)
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar a ideia");
        }

        alert("Ideia atualizada com sucesso!");
        window.location.href = "/professorHome.html";

    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar a ideia.");
    }
});
