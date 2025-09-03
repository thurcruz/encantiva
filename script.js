let telaAtual = 1;
const totalTelas = 8;


const temasPorFesta = {
  "Aniversário": ["Princesa", "Super Heróis", "Safari"],
  "15 Anos": ["Discoteca", "Prata", "Hollywood"],
  "Bodas": ["Dourado", "Prata", "Clássico"],
  "Mêsversário": ["Ursinhos", "Arco-íris", "Nuvens"]
};

function atualizarProgresso() {
    const progress = ((telaAtual - 1) / (totalTelas - 1)) * 100;
    document.getElementById("progress").style.width = progress + "%";
    document.getElementById("etapaAtual").innerText = `Etapa ${telaAtual} de ${totalTelas}`;
}

function validarTela(tela) {
    if (tela === 2 && !document.getElementById("nomeCliente").value.trim()) {
        alert("Digite seu nome para continuar.");
        return false;
    }
    if (tela === 3 && !document.querySelector('input[name="tipoFesta"]:checked')) {
        alert("Selecione um tipo de festa.");
        return false;
    }
    return true;
}

function proximaTela(n) {
    if (!validarTela(telaAtual)) return;
    // resto do código...
}

function proximaTela(n) {
  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");
  atualizarProgresso();

  if (telaAtual === 3) carregarTemas();
  if (telaAtual === 8) gerarResumo();
}

function voltarTela(n) {
  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");
  atualizarProgresso();
}

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
    label.innerHTML = `<input type="radio" name="temaFesta" value="${tema}"> ${tema}`;
    listaDiv.appendChild(label);
  });
}

function mostrarTemas() {
  document.getElementById("listaTemas").classList.remove("hidden");
}

function filtrarTemas() {
  const termo = document.getElementById("pesquisaTema").value.toLowerCase();
  document.querySelectorAll("#listaTemas label").forEach(label => {
    label.style.display = label.textContent.toLowerCase().includes(termo) ? "block" : "none";
  });
}

function gerarResumo() {
  const nome = document.getElementById("nomeCliente").value;
  const tipo = document.querySelector('input[name="tipoFesta"]:checked')?.value || "";
  const tema = document.querySelector('input[name="temaFesta"]:checked')?.value || "";
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

function enviarWhatsApp() {
  const resumo = document.getElementById("resumo").innerText;
  const numero = "5521977153453"; // coloque aqui o número do WhatsApp
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(resumo)}`;
  window.open(url, "_blank");
}
