let telaAtual = 1;

const temasPorFesta = {
  aniversario: ["Princesa", "Super-herói", "Carros"],
  mesversario: ["Animais", "Cores", "Ursinhos"],
  "15anos": ["Discoteca", "Prata", "Hollywood"],
  bodas: ["Dourado", "Prata", "Clássico"]
};

function mostrarTela(n) {
  document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
  document.getElementById(`tela${n}`).classList.add("ativa");
  telaAtual = n;
  atualizarProgresso();

  if (n === 3) carregarTemas();
  if (n === 8) gerarResumo();
}

function proximaTela(n) {
  mostrarTela(n);
}

function voltarTela(n) {
  mostrarTela(n);
}

function atualizarProgresso() {
  const totalTelas = 8;
  const porcentagem = (telaAtual / totalTelas) * 100;
  document.getElementById("progress-bar").style.width = `${porcentagem}%`;
}

function carregarTemas() {
  const tipo = document.querySelector("input[name='tipoFesta']:checked")?.value;
  const lista = document.getElementById("listaTemas");
  lista.innerHTML = "";

  if (tipo && temasPorFesta[tipo]) {
    temasPorFesta[tipo].forEach(t => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="radio" name="tema" value="${t}"> ${t}`;
      lista.appendChild(label);
    });
  } else {
    lista.innerHTML = "<p>Selecione um tipo de festa primeiro.</p>";
  }
}

function gerarResumo() {
  const nome = document.getElementById("nomeCliente").value;
  const tipo = document.querySelector("input[name='tipoFesta']:checked")?.value;
  const tema = document.querySelector("input[name='tema']:checked")?.value;
  const combo = document.querySelector("input[name='combo']:checked")?.value;
  const semMesa = document.getElementById("semMesa").checked ? "Sim" : "Não";
  const nomeHomenageado = document.getElementById("nomeHomenageado").value;
  const idade = document.getElementById("idadeHomenageado").value;
  const data = document.getElementById("dataFesta").value;

  const adicionais = Array.from(document.querySelectorAll("#tela6 input[type='checkbox']:checked"))
    .map(a => a.value)
    .join(", ");

  document.getElementById("resumo").innerHTML = `
    <p><b>Cliente:</b> ${nome}</p>
    <p><b>Tipo:</b> ${tipo}</p>
    <p><b>Tema:</b> ${tema}</p>
    <p><b>Combo:</b> ${combo} (Sem mesa: ${semMesa})</p>
    <p><b>Homenageado:</b> ${nomeHomenageado} ${idade ? `(${idade} anos)` : ""}</p>
    <p><b>Adicionais:</b> ${adicionais || "Nenhum"}</p>
    <p><b>Data:</b> ${data}</p>
  `;
}

function enviarWhatsApp() {
  const resumo = document.getElementById("resumo").innerText;
  const numero = "5521977153453"; // Coloque o número da Encantivo
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(resumo)}`;
  window.open(url, "_blank");
}
