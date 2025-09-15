flatpickr("#dataFesta", {
    dateFormat: "d/m/Y",  // formato dia/mês/ano
   minDate: new Date().fp_incr(7),      // só datas a partir de hoje
    allowInput: true       // permite digitar manualmente
});

// ==========================================
// Variáveis globais
// ==========================================
let telaAtual = 1;
const totalTelas = 10;
let temasPorFesta = {};
let mesaAtivada = true;
let comboSelecionado = null;
let tamanhoSelecionado = null;
let quantidadesAdicionais = [];

// ==========================================
// Carregamento inicial
// ==========================================
fetch('temas.json')
  .then(res => res.json())
  .then(data => {
    temasPorFesta = data;
  });

window.addEventListener('DOMContentLoaded', () => {
  inicializarCardsTamanho();
  inicializarCardsCombo();
  renderizarAdicionais();
  atualizarProgresso();
  quantidadesAdicionais = Array(adicionais.length).fill(0);
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
  if (![1, 8, 9, 10].includes(telaAtual)) limparErro();

  switch (telaAtual) {
    case 1: return true;
    case 2: return !!document.querySelector('input[name="tipoFesta"]:checked') || (exibirErro("Selecione o tipo de festa para continuar."), false);
    case 3: return validarTema();
    case 4: return validarHomenageado();
    case 5: return validarData();
    case 6: return tamanhoSelecionado !== null || (exibirErro("Escolha entre Festa na Mesa ou Festão."), false);
    case 7: return comboSelecionado !== null || (exibirErro("Escolha um combo para continuar."), false);
    case 8: return true;
    case 9: return validarDados();
    case 10: return validarFormaPagamento();
    default: return true;
  }
}

// ==========================================
// Validações específicas
// ==========================================
function validarTema() {
  const inputTema = document.getElementById("pesquisaTema");
  const temaOutro = document.getElementById("temaOutro").checked;
  const novoTema = document.getElementById("novoTema").value.trim();
  const tipoSelecionado = document.querySelector('input[name="tipoFesta"]:checked')?.value;
  const temasDisponiveis = temasPorFesta[tipoSelecionado] || [];

  if (temaOutro) {
    if (!novoTema) { exibirErro("Digite o tema personalizado."); return false; }
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
  if (!homenageado) { exibirErro("Informe o nome do homenageado."); return false; }
  return true;
}

function validarData() {
  const data = document.getElementById("dataFesta").value;
  if (!data) { exibirErro("Escolha a data do evento."); return false; }
  return true;
}

function validarDados() {
  const nome = document.getElementById("nomeCliente").value.trim();
  if (!nome) { exibirErro("Digite seu nome."); return false; }
  return true;
}

function validarFormaPagamento() {
  const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked')?.value;
  if (!formaPagamento) { exibirErro("Escolha uma forma de pagamento"); return false; }
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
  if (telaAtual === 8) renderizarAdicionais();
  if (telaAtual === 10) {
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
// Tela 6 - Tamanho da festa
// ==========================================
function selecionarTamanho(index) {
  tamanhoSelecionado = index;

  document.querySelectorAll('#tela6 .card-tamanho').forEach((card, i) => {
    card.classList.toggle('selecionado', i === index);
  });

  comboSelecionado = null; // reset combo ao mudar tamanho
  atualizarValorTotal();
}

function inicializarCardsTamanho() {
  const cards = document.querySelectorAll('#tela6 .card-combo');
  cards.forEach((card, i) => card.addEventListener('click', () => selecionarTamanho(i)));
}

// ==========================================
// Tela 7 - Combos e mesa
// ==========================================
const adicionais = [
  { nome: "Bolo (2 Recheios)", descricao: "Adicione 10 fatias", valor: 60 },
  { nome: "Docinhos simples", descricao: "5 uni.", valor: 4.50 },
  { nome: "Docinhos gourmet", descricao: "5 uni.", valor: 8 },
  { nome: "Cupcakes", descricao: "5 uni.", valor: 20 },
  { nome: "Mini Donuts", descricao: "5 uni.", valor: 10 },
];

function inicializarCardsCombo() {
  const cards = document.querySelectorAll('#tela6 .card-combo');
  cards.forEach((card, i) => card.addEventListener('click', () => selecionarCombo(i)));
}

function renderizarAdicionais() {
  const container = document.getElementById("adicionaisContainer");
  if (!container) return;
  container.innerHTML = "";

adicionais.forEach((item, index) => {
  const card = document.createElement("div");
  card.className = "adicional-card";
  card.innerHTML = `
    <div class="info">
      <h4>${item.nome}</h4>
      <p>${item.descricao}</p>
      <span class="preco">R$ ${item.valor.toFixed(2)}</span>
    </div>
    <div class="quantidade">
      <button onclick="alterarQuantidade(${index}, -1)">-</button>
      <span id="qtd-${index}">${quantidadesAdicionais[index] || 0}</span>
      <button onclick="alterarQuantidade(${index}, 1)">+</button>
    </div>
  `;
  container.appendChild(card);
});

  // Mostrar valor total do combo + mesa + adicionais na tela de adicionais
  const totalContainer = document.getElementById("totalAdicionais");
  if (totalContainer) {
    totalContainer.textContent = `R$ ${atualizarValorTotal().toFixed(2)}`;
  }
}

// Atualizar o total também ao alterar quantidade
function alterarQuantidade(index, delta) {
  const maximo = 10; // aqui você pode definir individualmente por adicional
  quantidadesAdicionais[index] = Math.min(
    maximo,
    Math.max(0, (quantidadesAdicionais[index] || 0) + delta)
  );
  document.getElementById(`qtd-${index}`).textContent = quantidadesAdicionais[index];

  // Atualiza valor total
  const totalContainer = document.getElementById("totalAdicionais");
  if (totalContainer) {
    totalContainer.textContent = `R$ ${atualizarValorTotal().toFixed(2)}`;
  }
}


function selecionarCombo(index) {
  if (comboSelecionado === index) {
    comboSelecionado = null;
    document.querySelectorAll('.card-combo').forEach(card => card.classList.remove('selecionado'));
  } else {
    comboSelecionado = index;
    document.querySelectorAll('.card-combo').forEach((card, i) => card.classList.toggle('selecionado', i === index));
  }

  atualizarValorTotal();
}

function toggleMesa() {
  mesaAtivada = !mesaAtivada;
  const switchEl = document.getElementById('switch');
  const label = document.getElementById('mesa-label');

  switchEl.classList.toggle('active', mesaAtivada);
  label.textContent = mesaAtivada ? "Mesa adicionada (+R$10)" : "Adicionar mesa (+R$10)";

  atualizarValorTotal();
}

// Função para ativar a mesa por padrão ao carregar a tela
function inicializarMesa() {
    const switchEl = document.getElementById('switch');
    const label = document.getElementById('mesa-label');

    switchEl.classList.add('active');
    label.textContent = "Mesa adicionada (+R$10)";

    atualizarValorTotal();
}

// Chama a inicialização quando a tela carregar
window.addEventListener('DOMContentLoaded', inicializarMesa);

function atualizarValorTotal() {
  let total = 0;

  if (comboSelecionado !== null) {
    const card = document.querySelectorAll('#tela7 .card-combo')[comboSelecionado];
    const valor = parseFloat(card.querySelector('.valor').textContent.replace('R$', '').replace(',', '.'));
    total += valor;
  }

  if (mesaAtivada) total += 10;

  adicionais.forEach((item, i) => {
    total += (quantidadesAdicionais[i] || 0) * item.valor;
  });

  const totalEl = document.getElementById("valorTotal");
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2)}`;
  return total;
}

// ==========================================
// Função unificada para resumo e WhatsApp
// ==========================================
function getResumoPedido() {
  const nome = document.getElementById("nomeCliente")?.value || "";
  const telefone = document.getElementById("telefoneCliente")?.value || "";
  const tipo = document.querySelector('input[name="tipoFesta"]:checked')?.value || "";
  const temaOutro = document.getElementById("temaOutro")?.checked;
  const tema = temaOutro ? document.getElementById("novoTema").value : document.getElementById("pesquisaTema").value;
  const homenageado = document.getElementById("nomeHomenageado")?.value || "";
  const idade = document.getElementById("idadeHomenageado")?.value || "";
  const data = document.getElementById("dataFesta")?.value || "";
  const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked')?.value || "";

  const adicionaisSelecionados = adicionais
    .filter((_, i) => (quantidadesAdicionais[i] || 0) > 0)
    .map((item, i) => `${item.nome} x${quantidadesAdicionais[i]}`)
    .join(", ") || "Nenhum";

  let comboInfo = "Nenhum";
  if (comboSelecionado !== null) {
    const card = document.querySelectorAll('#tela7 .card-combo')[comboSelecionado];
    const nomeCombo = card.querySelector('.combo-nome').textContent;
    comboInfo = nomeCombo;
  }

  const mesaInfo = mesaAtivada ? "Com mesa (+R$10)" : "Sem mesa";
  const tamanho = tamanhoSelecionado === 0 ? "Festa na Mesa" : tamanhoSelecionado === 1 ? "Festão" : "Não selecionado";
  const valorTotal = atualizarValorTotal();

  return {
    nome, telefone, tipo, tema, homenageado, idade, data,
    formaPagamento, comboInfo, mesaInfo, tamanho, adicionaisSelecionados, valorTotal
  };
}

function gerarResumo() {
  const resumo = getResumoPedido();
  document.getElementById("resumo").innerHTML = `
    <p class="descricaoResumo"><strong>Cliente:</strong> ${resumo.nome}</p>
    <p class="descricaoResumo"><strong>Ocasião:</strong> ${resumo.tipo}</p>
    <p class="descricaoResumo"><strong>Tema:</strong> ${resumo.tema}</p>
    <p class="descricaoResumo"><strong>Tamanho:</strong> ${resumo.tamanho}</p>
    <p class="descricaoResumo"><strong>Combo:</strong> ${resumo.comboInfo} - ${resumo.mesaInfo}</p>
    <p class="descricaoResumo"><strong>Homenageado(s):</strong> ${resumo.homenageado} ${resumo.idade ? `(${resumo.idade} anos)` : ""}</p>
    <p class="descricaoResumo"><strong>Adicionais:</strong> ${resumo.adicionaisSelecionados}</p>
    <p class="descricaoResumo"><strong>Data de Retirada:</strong> ${resumo.data}</p>
    <p class="descricaoResumo"><strong>Pagamento:</strong> ${resumo.formaPagamento}</p>
    <p class="descricaoResumo"><strong>Valor Total:</strong> R$ ${resumo.valorTotal.toFixed(2)}</p>
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
      <img src="assets/qrcode-pix.png" alt="QR Code de pagamento" width="200">
      <p><strong>Código PIX:</strong></p>
      <div class="pix-box">
        <span id="pixCode">00020126360014BR.GOV.BCB.PIX0114+55219601478315204000053039865802BR5901N6001C62070503***63048243</span>
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
  const resumo = getResumoPedido();
  const mensagem = `
*Olá, equipe Encantiva! Segue o resumo do meu pedido!*
===================
*Meus Dados*
- Cliente: ${resumo.nome}
- Contato: ${resumo.telefone}

*Detalhes do evento:*
- Ocasião: ${resumo.tipo}
- Data: ${resumo.data}
- Tema: ${resumo.tema}
- Homenageado(s): ${resumo.homenageado} ${resumo.idade ? `(${resumo.idade} anos)` : ""}

*Itens selecionados:*
- Combo: ${resumo.comboInfo} - ${resumo.mesaInfo}
- Adicionais: ${resumo.adicionaisSelecionados}
- Valor Total: R$ ${resumo.valorTotal.toFixed(2)}
  `;
  const numero = "5521960147831";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}
