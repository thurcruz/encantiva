// ==========================================
// Variáveis globais
// ==========================================
let telaAtual = 1;
const totalTelas = 9; // atualizado até a tela 9
let temasPorFesta = {};
let mesaAtivada = true;
let comboSelecionado = null;

// ==========================================
// Carregamento inicial
// ==========================================
fetch('temas.json')
  .then(res => res.json())
  .then(data => {
    temasPorFesta = data;
  });

// ==========================================
// Barra de progresso
// ==========================================
function atualizarProgresso() {
  document.getElementById("progress").style.width =
    ((telaAtual - 1) / (totalTelas - 1)) * 100 + "%";

  const etapa = document.getElementById("etapaAtual");
  if (etapa) etapa.textContent = `Tela ${telaAtual} de ${totalTelas}`;
}

// ==========================================
// Notificações de erro
// ==========================================
function exibirErro(mensagem) {
  const notificacao = document.getElementById("notificacao");
  const mensagemErro = document.getElementById("mensagemErro");

  mensagemErro.textContent = mensagem;
  notificacao.classList.add("ativa");

  setTimeout(() => {
    notificacao.classList.remove("ativa");
  }, 3000);
}

function limparErro() {
  const erroElemento = document.getElementById(`erroTela${telaAtual}`);
  if (erroElemento) {
    erroElemento.textContent = "";
    erroElemento.style.display = "none";
  }
}

// ==========================================
// Validação de telas
// ==========================================
function validarTelaAtual() {
  if (telaAtual !== 1 && telaAtual !== 8 && telaAtual !== 9) limparErro();

  switch (telaAtual) {
    case 1:
      return true;
    case 2:
      return !!document.querySelector('input[name="tipoFesta"]:checked') ||
        (exibirErro("Selecione o tipo de festa para continuar."), false);
    case 3:
      return validarTema();
    case 4:
      return comboSelecionado !== null ||
        (exibirErro("Escolha um combo para continuar."), false);
    case 5:
      return validarHomenageado();
    case 6:
      return true;
    case 7:
      return validarData();
    case 8:
      return validarDados();
    case 9:
      return true;
    default:
      return true;
  }
}

function validarTema() {
  const inputTema = document.getElementById("pesquisaTema");
  const temaOutro = document.getElementById("temaOutro").checked;
  const novoTema = document.getElementById("novoTema").value.trim();
  const tipoSelecionado = document.querySelector('input[name="tipoFesta"]:checked')?.value;
  const temasDisponiveis = temasPorFesta[tipoSelecionado] || [];

  if (temaOutro) {
    if (!novoTema) {
      exibirErro("Digite o tema personalizado.");
      return false;
    }
  } else {
    if (!inputTema.value || !temasDisponiveis.includes(inputTema.value)) {
      exibirErro("Selecione um tema válido da lista ou marque 'Outro'.");
      return false;
    }
  }
  return true;
}

function validarHomenageado() {
  const homenageado = document.getElementById("nomeHomenageado").value.trim();
  if (!homenageado) {
    exibirErro("Informe o nome do homenageado.");
    return false;
  }
  return true;
}

function validarData() {
  const data = document.getElementById("dataFesta").value;
  if (!data) {
    exibirErro("Escolha a data do evento.");
    return false;
  }
  return true;
}

function validarDados() {
  const nome = document.getElementById("nomeCliente").value;
  if (!nome) {
    exibirErro("Digite seu nome.");
    return false;
  }
  return true;
}

function validarFormaPagamento() {
    const formaPagamento = document.getElementById("formaPagamento").value;
  if (!formaPagamento) {
    exibirErro("Escolha uma forma de pagamento");
    return false;
  }
  return true;
}

// ==========================================
// Navegação entre telas
// ==========================================
function proximaTela(n) {
  if (!validarTelaAtual()) return;

  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");

  limparErro();
  atualizarProgresso();

  if (telaAtual === 3) carregarTemas();
  if (n === 9) {
    gerarResumo();
    atualizarPagamentoResumo();
  }
}

function voltarTela(n) {
  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");

  limparErro();
  atualizarProgresso();
}

// ==========================================
// Tela 3 - Temas
// ==========================================
function carregarTemas() {
  const tipoSelecionado = document.querySelector('input[name="tipoFesta"]:checked');
  const listaDiv = document.getElementById("listaTemas");
  listaDiv.innerHTML = "";

  if (!tipoSelecionado) {
    listaDiv.innerHTML = "<p>Por favor, volte e selecione um tipo de festa.</p>";
    return;
  }

  (temasPorFesta[tipoSelecionado.value] || []).forEach(tema => {
    const label = document.createElement("label");
    label.textContent = tema;
    label.onclick = () => {
      document.getElementById("pesquisaTema").value = tema;
      listaDiv.style.display = "none";
    };
    listaDiv.appendChild(label);
  });
}

function mostrarTemas() {
  if (!document.getElementById("temaOutro").checked) {
    document.getElementById("listaTemas").style.display = "block";
  }
}

function filtrarTemas() {
  const termo = document.getElementById("pesquisaTema").value.toLowerCase();
  document.querySelectorAll("#listaTemas label").forEach(label => {
    label.style.display = label.textContent.toLowerCase().includes(termo) ? "block" : "none";
  });
}

document.addEventListener("click", e => {
  const container = document.querySelector(".select-busca");
  if (!container.contains(e.target)) {
    document.getElementById("listaTemas").style.display = "none";
  }
});

function ativarTemaOutro() {
  const checkbox = document.getElementById("temaOutro");
  const novoTema = document.getElementById("novoTema");
  const pesquisa = document.getElementById("pesquisaTema");

  if (checkbox.checked) {
    novoTema.style.display = "block";
    pesquisa.disabled = true;
    document.getElementById("listaTemas").style.display = "none";
  } else {
    novoTema.style.display = "none";
    pesquisa.disabled = false;
  }
}

// ==========================================
// Tela 4 - Combos e mesa
// ==========================================
function atualizarValorTotal() {
  let total = 0;
  if (comboSelecionado !== null) {
    const card = document.querySelectorAll('.card-combo')[comboSelecionado];
    const valor = parseFloat(card.querySelector('.valor').textContent.replace('R$', '').replace(',', '.'));
    total += valor;
  }
  if (mesaAtivada) total += 10;
  return total;
}

function selecionarCombo(index) {
  if (comboSelecionado === index) {
    comboSelecionado = null;
    document.querySelectorAll('.card-combo').forEach(card => card.classList.remove('selecionado'));
  } else {
    comboSelecionado = index;
    document.querySelectorAll('.card-combo').forEach((card, i) => card.classList.toggle('selecionado', i === index));
  }
}

function toggleMesa() {
  mesaAtivada = !mesaAtivada;
  const switchEl = document.getElementById('switch');
  const label = document.getElementById('mesa-label');
  switchEl.classList.toggle('active', mesaAtivada);
  label.textContent = mesaAtivada ? "Mesa adicionada (+R$10)" : "Adicionar mesa (+R$10)";
}

function inicializarMesa() {
  const switchEl = document.getElementById('switch');
  const label = document.getElementById('mesa-label');
  switchEl.classList.add('active');
  label.textContent = "Mesa adicionada (+R$10)";
}

window.addEventListener('DOMContentLoaded', inicializarMesa);

// ==========================================
// Tela 8 - Resumo
// ==========================================
function gerarResumo() {
  const nome = document.getElementById("nomeCliente")?.value || "";
  const tipo = document.querySelector('input[name="tipoFesta"]:checked')?.value || "";
  const temaOutro = document.getElementById("temaOutro")?.checked;
  const tema = temaOutro ? document.getElementById("novoTema").value : document.getElementById("pesquisaTema").value;
  const homenageado = document.getElementById("nomeHomenageado")?.value || "";
  const idade = document.getElementById("idadeHomenageado")?.value || "";
  const data = document.getElementById("dataFesta")?.value || "";
  const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked')?.value || "";

  const adicionais = Array.from(document.querySelectorAll('#tela6 input[type="checkbox"]:checked'))
    .map(a => a.value)
    .join(", ") || "Nenhum";

  let comboInfo = "Nenhum";
  if (comboSelecionado !== null) {
    const card = document.querySelectorAll('.card-combo')[comboSelecionado];
    const nomeCombo = card.querySelector('.combo-nome').textContent;
    const valorCombo = parseFloat(card.querySelector('.valor').textContent.replace('R$', '').replace(',', '.'));
    comboInfo = `${nomeCombo} (R$ ${valorCombo.toFixed(2)})`;
  }

  const valorTotal = atualizarValorTotal();

  document.getElementById("resumo").innerHTML = `
      <p><strong>Cliente:</strong> ${nome}</p>
      <p><strong>Ocasião:</strong> ${tipo}</p>
      <p><strong>Tema:</strong> ${tema}</p>
      <p><strong>Combo:</strong> ${comboInfo} - ${mesaAtivada ? "Com mesa (+R$10)" : "Sem mesa"}</p>
      <p><strong>Homenageado(s):</strong> ${homenageado} ${idade ? `(${idade} anos)` : ""}</p>
      <p><strong>Adicionais:</strong> ${adicionais}</p>
      <p><strong>Data de Retirada:</strong> ${data}</p>
      <p><strong>Pagamento:</strong> ${formaPagamento}</p>
      <p><strong>Valor Total:</strong> R$ ${valorTotal.toFixed(2)}</p>
  `;
}

function atualizarPagamentoResumo() {
  const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked')?.value;
  const pagamentoDiv = document.getElementById("pagamentoResumo");

  const valorTotal = atualizarValorTotal();

  if (formaPagamento === "Pix") {
    const valorPix = (valorTotal / 2).toFixed(2);
    pagamentoDiv.innerHTML = `
      <p>Escaneie o QR Code para pagar 50% do valor: <strong>R$ ${valorPix}</strong></p>
      <img src="qrcode.png" alt="QR Code de pagamento" width="200">
      <p><strong>Código PIX:</strong></p>
      <div class="pix-box">
        <span id="pixCode">00020126580014BR.GOV.BCB.PIX0136seu-pix-aqui5204000053039865802BR5920ENCANTIVA LTDA6009SAO PAULO62070503***6304ABCD</span>
        <button id="copyPixBtn">Copiar</button>
      </div>
      <span id="copyMsg" class="copy-msg">Copiado!</span>
    `;

    const copyBtn = document.getElementById("copyPixBtn");
    const pixCode = document.getElementById("pixCode");
    const copyMsg = document.getElementById("copyMsg");

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(pixCode.textContent)
        .then(() => {
          copyMsg.style.display = "inline";
          setTimeout(() => copyMsg.style.display = "none", 2000);
        })
        .catch(err => alert("Erro ao copiar código PIX: " + err));
    });

  } else if (formaPagamento) {
    pagamentoDiv.innerHTML = `<p><strong>O pagamento de 50% deve ser feito na retirada. Valor total: R$ ${valorTotal.toFixed(2)}</strong></p>`;
  } else {
    pagamentoDiv.innerHTML = "";
  }
}

function enviarWhatsApp() {
  const nome = document.getElementById("nomeCliente")?.value || "";
  const telefone = document.getElementById("telefoneCliente")?.value || "";
  const tipo = document.querySelector('input[name="tipoFesta"]:checked')?.value || "";
  const temaOutro = document.getElementById("temaOutro")?.checked;
  const tema = temaOutro ? document.getElementById("novoTema").value : document.getElementById("pesquisaTema").value;
  const homenageado = document.getElementById("nomeHomenageado")?.value || "";
  const idade = document.getElementById("idadeHomenageado")?.value || "";
  const data = document.getElementById("dataFesta")?.value || "";

  const adicionais = Array.from(document.querySelectorAll('#tela6 input[type="checkbox"]:checked'))
    .map(a => a.value)
    .join(", ") || "Nenhum";

  let comboInfo = "Nenhum";
  if (comboSelecionado !== null) {
    const card = document.querySelectorAll('.card-combo')[comboSelecionado];
    const nomeCombo = card.querySelector('.combo-nome').textContent;
    comboInfo = `${nomeCombo}`;
  }

  const mesaInfo = mesaAtivada ? "Com mesa" : "Sem mesa";
  const valorTotal = atualizarValorTotal();

  const mensagem = 
`*Olá, equipe Encantiva! Segue o resumo do meu pedido!*
=================== 
*Meus Dados*
-Cliente: ${nome}
-Contato: ${telefone}

*Detalhes do evento:*
-Ocasião: ${tipo}
-Data: ${data}
-Tema: ${tema}
-Homenageado(s): ${homenageado} ${idade ? `(${idade} anos)` : ""}

*Itens selecionados:*
-Combo: ${comboInfo} - ${mesaInfo}
-Adicionais: ${adicionais}
-Valor Total: R$ ${valorTotal.toFixed(2)}
`;

  const numero = "5521960147831";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}
