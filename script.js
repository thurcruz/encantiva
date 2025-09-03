let telaAtual = 1;
const totalTelas = 8;
let temasPorFesta = {};

fetch('temas.json')
  .then(res => res.json())
  .then(data => {
    temasPorFesta = data;
  })

// Atualiza barra de progresso e número de etapa
function atualizarProgresso() {
  document.getElementById("progress").style.width = ((telaAtual - 1) / (totalTelas - 1)) * 100 + "%";
  const etapa = document.getElementById("etapaAtual");
  if (etapa) etapa.textContent = `Tela ${telaAtual} de ${totalTelas}`;
}

// Avança para a próxima tela
function proximaTela(n) {
  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");
  atualizarProgresso();

  if (telaAtual === 3) carregarTemas();
  if (telaAtual === 8) gerarResumo();
}

// Volta para a tela anterior
function voltarTela(n) {
  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");
  atualizarProgresso();
}

// Carrega temas na Tela 3
function carregarTemas() {
  const tipoSelecionado = document.querySelector('input[name="tipoFesta"]:checked');
  const listaDiv = document.getElementById("listaTemas");
  listaDiv.innerHTML = "";

  if (!tipoSelecionado) {
    listaDiv.innerHTML = "<p>Por favor, volte e selecione um tipo de festa.</p>";
    return;
  }

  const temas = temasPorFesta[tipoSelecionado.value] || [];
  temas.forEach(tema => {
    const label = document.createElement("label");
    label.textContent = tema;
    label.onclick = () => {
      document.getElementById("pesquisaTema").value = tema;
      listaDiv.style.display = "none"; // fecha lista ao selecionar
    };
    listaDiv.appendChild(label);
  });
}

// Mostra a lista de temas ao clicar no input
function mostrarTemas() {
  const lista = document.getElementById("listaTemas");
  lista.style.display = "block";
}

// Filtra os temas conforme a digitação
function filtrarTemas() {
  const termo = document.getElementById("pesquisaTema").value.toLowerCase();
  document.querySelectorAll("#listaTemas label").forEach(label => {
    label.style.display = label.textContent.toLowerCase().includes(termo) ? "block" : "none";
  });
}

// Fecha lista se clicar fora do select customizado
document.addEventListener("click", function(e) {
  const container = document.querySelector(".select-busca");
  if (!container.contains(e.target)) {
    document.getElementById("listaTemas").style.display = "none";
  }
});

// Gera resumo do pedido na Tela 8
function gerarResumo() {
  const nome = document.getElementById("nomeCliente").value;
  const tipo = document.querySelector('input[name="tipoFesta"]:checked')?.value || "";
  const tema = document.getElementById("pesquisaTema").value || "";
  const combo = document.querySelector('input[name="combo"]:checked')?.value || "";
  const semMesa = document.getElementById("semMesa").checked ? "Sim" : "Não";
  const homenageado = document.getElementById("nomeHomenageado").value;
  const idade = document.getElementById("idadeHomenageado").value;
  const data = document.getElementById("dataFesta").value;

  const adicionais = Array.from(document.querySelectorAll('#tela6 input[type="checkbox"]:checked'))
    .map(a => a.value)
    .join(", ") || "Nenhum";

  document.getElementById("resumo").innerHTML = `
    <p><b>Cliente:</b> ${nome}</p>
    <p><b>Tipo:</b> ${tipo}</p>
    <p><b>Tema:</b> ${tema}</p>
    <p><b>Combo:</b> ${combo} (Sem mesa: ${semMesa})</p>
    <p><b>Homenageado:</b> ${homenageado} ${idade ? `(${idade} anos)` : ""}</p>
    <p><b>Adicionais:</b> ${adicionais}</p>
    <p><b>Data:</b> ${data}</p>
  `;
}

// Envia resumo pelo WhatsApp
function enviarWhatsApp() {
  const resumo = document.getElementById("resumo").innerText.trim();
  if (!resumo) {
    alert("O resumo do pedido está vazio!");
    return;
  }

  const numero = "5521977153453"; // seu número
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(resumo)}`;
  window.location.href = url; // abre o WhatsApp diretamente
}
