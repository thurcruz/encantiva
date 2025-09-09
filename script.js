let telaAtual = 1;
const totalTelas = 8;
let temasPorFesta = {};

// Carrega temas do JSON
fetch('temas.json')
  .then(res => res.json())
  .then(data => {
    temasPorFesta = data;
  });

// Atualiza barra de progresso e número de etapa
function atualizarProgresso() {
  document.getElementById("progress").style.width = ((telaAtual - 1) / (totalTelas - 1)) * 100 + "%";
  const etapa = document.getElementById("etapaAtual");
  if (etapa) etapa.textContent = `Tela ${telaAtual} de ${totalTelas}`;
}

// Mostra mensagem de erro na tela
function exibirErro(mensagem) {
  const erroElemento = document.getElementById(`erroTela${telaAtual}`);
  if (erroElemento) {
    erroElemento.textContent = mensagem;
    erroElemento.style.display = "block";
  }
}

// Limpa a mensagem de erro
function limparErro() {
  const erroElemento = document.getElementById(`erroTela${telaAtual}`);
  if (erroElemento) {
    erroElemento.textContent = "";
    erroElemento.style.display = "none";
  }
}

// Validação de cada tela
function validarTelaAtual() {
  // Limpa mensagem apenas se não for tela 1 ou 8
  if (telaAtual !== 1 && telaAtual !== 8) limparErro();

  switch (telaAtual) {
    case 1:
      return true; // Tela 1 não precisa validar
    case 2:
      const tipo = document.querySelector('input[name="tipoFesta"]:checked');
      if (!tipo) {
        if (telaAtual !== 1 && telaAtual !== 8) exibirErro("Selecione o tipo de festa para continuar.");
        return false;
      }
      return true;
    case 3:
      const inputTema = document.getElementById("pesquisaTema");
      const temaOutro = document.getElementById("temaOutro").checked;
      const novoTema = document.getElementById("novoTema").value.trim();
      const tipoSelecionado = document.querySelector('input[name="tipoFesta"]:checked')?.value;
      const temasDisponiveis = temasPorFesta[tipoSelecionado] || [];

      if (temaOutro) {
        if (!novoTema) {
          if (telaAtual !== 1 && telaAtual !== 8) exibirErro("Digite o tema personalizado.");
          return false;
        }
      } else {
        if (!inputTema.value || !temasDisponiveis.includes(inputTema.value)) {
          if (telaAtual !== 1 && telaAtual !== 8) exibirErro("Selecione um tema válido da lista ou marque 'Outro'.");
          return false;
        }
      }
      return true;
    case 4:
      const combo = document.querySelector('input[name="combo"]:checked');
      if (!combo) {
        if (telaAtual !== 1 && telaAtual !== 8) exibirErro("Escolha um combo para continuar.");
        return false;
      }
      return true;
    case 5:
      const homenageado = document.getElementById("nomeHomenageado").value.trim();
      if (!homenageado) {
        if (telaAtual !== 1 && telaAtual !== 8) exibirErro("Informe o nome do homenageado.");
        return false;
      }
      return true;
    case 6:
      return true; // Adicionais são opcionais
    case 7:
      const data = document.getElementById("dataFesta").value;
      if (!data) {
        if (telaAtual !== 1 && telaAtual !== 8) exibirErro("Escolha a data do evento.");
        return false;
      }
      return true;
    case 8:
      return true; // Tela 8 não precisa validar
    default:
      return true;
  }
}

// Avança para a próxima tela
function proximaTela(n) {
  if (!validarTelaAtual()) return; // impede avanço se não passar na validação

  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");
  limparErro();
  atualizarProgresso();

  if (telaAtual === 3) carregarTemas();
  if (telaAtual === 8) gerarResumo();
}

// Volta para a tela anterior
function voltarTela(n) {
  document.getElementById(`tela${telaAtual}`).classList.remove("ativa");
  telaAtual = n;
  document.getElementById(`tela${telaAtual}`).classList.add("ativa");
  limparErro();
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
  if (!document.getElementById("temaOutro").checked) {
    document.getElementById("listaTemas").style.display = "block";
  }
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

// Ativa/desativa campo "Outro" na tela 3
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

// Gera resumo do pedido na Tela 8
function gerarResumo() {
  const nome = document.getElementById("nomeCliente")?.value || "";
  const tipo = document.querySelector('input[name="tipoFesta"]:checked')?.value || "";
  const temaOutro = document.getElementById("temaOutro").checked;
  const tema = temaOutro ? document.getElementById("novoTema").value : document.getElementById("pesquisaTema").value;
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
    // Mensagem de erro na tela 8 não aparece
    return;
  }

  const numero = "5521977153453"; // seu número
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(resumo)}`;
  window.location.href = url;
}
