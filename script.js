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
  if (telaAtual === 8) gerarResumo();
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
  document.getElementById('valorTotal').textContent = ` R$ ${total.toFixed(2)}`;
}


function selecionarCombo(index) {
  if (comboSelecionado === index) {
    // Se clicar de novo no mesmo card → desseleciona
    comboSelecionado = null;
    document.querySelectorAll('.card-combo').forEach(card =>
      card.classList.remove('selecionado')
    );
  } else {
    // Seleciona o card clicado
    comboSelecionado = index;
    document.querySelectorAll('.card-combo').forEach((card, i) =>
      card.classList.toggle('selecionado', i === index)
    );
  }

  atualizarValorTotal();
}


// Função para alternar o switch
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

function scrollCards(direction) {
  const container = document.getElementById("cardsCombos");
  const scrollAmount = 250; // quantos px rola por clique
  container.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

let mensagemWhatsAppGlobal = "";

function gerarResumo() {
  const nome = document.getElementById("nomeCliente")?.value || "";
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
    const valorCombo = card.querySelector('.valor').textContent;
    comboInfo = `${nomeCombo} (${valorCombo})`;
  }

  const mesaInfo = mesaAtivada ? "Com mesa (+R$10)" : "Sem mesa";

  // Resumo na tela
  document.getElementById("resumo").innerHTML = `
    <p><b>Cliente:</b> ${nome}</p>
    <p><b>Tipo:</b> ${tipo}</p>
    <p><b>Tema:</b> ${tema}</p>
    <p><b>Combo:</b> ${comboInfo} - ${mesaInfo}</p>
    <p><b>Homenageado:</b> ${homenageado} ${idade ? `(${idade} anos)` : ""}</p>
    <p><b>Adicionais:</b> ${adicionais}</p>
    <p><b>Data:</b> ${data}</p>
  `;

  // Mensagem global para WhatsApp (mantém UTF-8 e emojis)
  mensagemWhatsAppGlobal =
`✨ Aqui está o resumo do meu pedido ✨

👤 Cliente: ${nome}
🎉 Ocasião: ${tipo}
🎨 Tema: ${tema}
🎁 Pacote: ${comboInfo} - ${mesaInfo}
🙌 Homenageado(s): ${homenageado} ${idade ? `(${idade} anos)` : ""}
🪄 Adicionais: ${adicionais}
📅 Data de Retirada: ${data}

Por favor, confirme o recebimento e me avise sobre os próximos passos.`;
}

function enviarWhatsApp() {
  if (!mensagemWhatsAppGlobal) return;

  const numero = "5521960147831"; // número de destino
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagemWhatsAppGlobal)}`;
  window.open(url, "_blank"); // abre em nova aba
}
