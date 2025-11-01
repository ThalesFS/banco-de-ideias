fetch("http://localhost:8080/api/professores")
.then(response => response.json())
.then(data => {
  console.log("Professores via API:", data);
  const lista = document.getElementById("lista-professores");
  if(lista){
    lista.innerHTML = data.map(nome => `<li>${nome}</li>`).join("");
  }
})
.catch(error => console.error("Erro ao buscar professores", error));

const botaoExplorar = document.getElementById('btnExplorar');

botaoExplorar.addEventListener('click', () => {
  alert('Site em desenvolvimento 🚧');
});