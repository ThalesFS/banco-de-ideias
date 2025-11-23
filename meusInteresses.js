document.addEventListener("DOMContentLoaded", async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario || usuario.tipo !== "aluno") {
        alert("Acesso não autorizado.");  //implementar para as outras telas
        window.location.href = "/login.html";
        return;
    }

    //Redirecionamento do ícone BDI (home)
    if (iconeBDI) {
        iconeBDI.addEventListener("click", () => {
            if (!usuario) return window.location.href = "login.html";
            window.location.href = usuario.tipo === "aluno" ? "alunoHome.html" : "professorHome.html";
        });
    }

    // logout
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });

    const lista = document.getElementById("listaInteresses");

    try {
        const response = await fetch(`http://localhost:8080/api/interesses/aluno/${usuario.id}`);

        if (!response.ok) {
            throw new Error("Erro ao buscar interesses.");
        }

        const ideias = await response.json();

        if (ideias.length === 0) {
            lista.innerHTML = `<p style="opacity:0.7;">Você ainda não demonstrou interesse em nenhuma ideia.</p>`;
            return;
        }

        ideias.forEach(ideia => {
            const card = document.createElement("div");
            card.classList.add("ideia-card");

            // título
            const titulo = document.createElement("div");
            titulo.classList.add("ideia-titulo");
            titulo.textContent = ideia.titulo;

            card.appendChild(titulo);

            // clique -> abre a página da ideia
            card.onclick = () => {
                window.location.href = `/ideia.html?id=${ideia.id}`;
            };

            lista.appendChild(card);
        });

    } catch (erro) {
        console.error(erro);
        lista.innerHTML = `<p style="color:red;">Erro ao carregar interesses.</p>`;
    }
});