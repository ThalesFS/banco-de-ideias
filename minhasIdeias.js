const API_BASE = "http://localhost:8080/api/ideias/professor/";

const listaContainer = document.getElementById("listaIdeias") || document.getElementById("lista-ideias");
const iconeBDI = document.getElementById("iconeBDI");
const logoutBtn = document.getElementById("logout");

const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  window.location.href = "login.html";
}

 //Redirecionamento do ícone BDI (home)
if (iconeBDI) {
  iconeBDI.addEventListener("click", () => {
    if (!usuario) return window.location.href = "login.html";
    window.location.href = usuario.tipo === "aluno" ? "alunoHome.html" : "professorHome.html";
  });
}

// logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
  });
}


// CHAMADA A API
async function carregarMinhasIdeias() {
  try {
    const res = await fetch(`${API_BASE}${usuario.id}`);
    if (!res.ok) throw new Error("Erro ao buscar ideias do professor.");
    const ideias = await res.json();

    montarCards(ideias);
  } catch (err) {
    console.error("Erro ao carregar minhas ideias:", err);
    if (listaContainer) listaContainer.innerHTML = `<p class="erro">Erro ao carregar suas ideias.</p>`;
  }
}


// AQUI MONTA OS CARDS
function criarCardSimples(ideia) {
  // título + botões (excluir E editar)
  return `
    <div class="ideia-card" data-id="${ideia.id}">
      <div class="ideia-info" role="button" tabindex="0">
        <span class="ideia-titulo">${escapeHtml(ideia.titulo || "Sem título")}</span>
      </div>

      <div class="card-actions">
        <button class="card-icon icon-delete" data-id="${ideia.id}" title="Excluir">
          <img src="/imagens/iconeDelete.png">
        </button>

        <button class="card-icon icon-edit" data-id="${ideia.id}" title="Editar">
          <img src="/imagens/iconeAlterar.png">
        </button>
      </div>
    </div>
  `;
}

function montarCards(lista) {
  if (!listaContainer) return;

  if (!Array.isArray(lista) || lista.length === 0) {
    listaContainer.innerHTML = `<p class="sem-ideias">Você ainda não cadastrou nenhuma ideia.</p>`;
    return;
  }

  listaContainer.innerHTML = lista.map(criarCardSimples).join("");

  // depois de montar, configurar eventos
  configurarEventosDosCards();
}


// EVENTOS DOS CARDS
function configurarEventosDosCards() {
  // clicar no card para acessar a ideia individualmente 
  document.querySelectorAll(".ideia-card .ideia-info").forEach(el => {
    el.addEventListener("click", (e) => {
      const card = e.currentTarget.closest(".ideia-card");
      const id = card?.dataset?.id;
      if (id) window.location.href = `ideia.html?id=${id}`;
    });

    // permitir Enter para acessibilidade
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const card = e.currentTarget.closest(".ideia-card");
        const id = card?.dataset?.id;
        if (id) window.location.href = `ideia.html?id=${id}`;
      }
    });
  });

  // editar: não propaga clique para o card
  document.querySelectorAll(".card-icon.icon-edit").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (id) window.location.href = `editarIdeia.html?id=${id}`;
    });
  });

  // excluir: confirmação e chamada DELETE
  document.querySelectorAll(".card-icon.icon-delete").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!id) return;

      const confirmar = confirm("Tem certeza que deseja excluir esta ideia?");
      if (!confirmar) return;

      try {
        // envia header X-Professor-Id e query parameter professorId para compatibilidade
        const url = `http://localhost:8080/api/ideias/${id}?professorId=${usuario.id}`;
        const resp = await fetch(url, {
          method: "DELETE",
          headers: {
            "X-Professor-Id": String(usuario.id)
          }
        });

        if (!resp.ok) {
          // tenta ler mensagem de erro do backend
          let msg;
          try {
            msg = await resp.text();
          } catch (_) { msg = "Erro ao excluir"; }
          alert(msg || "Erro ao excluir a ideia.");
          return;
        }

        alert("Ideia excluída com sucesso.");
        carregarMinhasIdeias(); // recarrega a lista atualizada

      } catch (err) {
        console.error("Erro ao excluir ideia:", err);
        alert("Erro ao excluir a ideia. Veja o console.");
      }
    });
  });
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

carregarMinhasIdeias();
