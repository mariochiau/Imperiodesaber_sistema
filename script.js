const SENHA_CORRETA = "1234";
const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
let lista = JSON.parse(localStorage.getItem('bd_escola_final')) || [];
let alunoAbertoIdx = null;

// LOGIN
async function fazerLogin() {
    if(document.getElementById('senhaInput').value === SENHA_CORRETA) {
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('area-gestao').style.display = 'block';
        renderizar();
    } else { 
        document.getElementById('erro').style.display = 'block'; 
    }
}

// RENDERIZAR TABELA (FIREBASE)
async function renderizar() {
    const corpo = document.getElementById('tabela');
    const busca = document.getElementById('busca').value.toLowerCase();
    
    // AJUSTADO: Agora o JavaScript lê o ID "ordenarPor" que está no seu HTML
    const filtroElemento = document.getElementById('ordenarPor');
    const ordem = filtroElemento ? filtroElemento.value : 'nome';
    
    corpo.innerHTML = "<tr><td colspan='4'>Sincronizando...</td></tr>";

    try {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        const querySnapshot = await getDocs(collection(window.db, "alunos"));
        
        lista = []; 
        querySnapshot.forEach((doc) => {
            const aluno = doc.data();
            aluno.id = doc.id;
            lista.push(aluno);
        });
        // Dentro da função renderizar(), logo após o loop que cria a 'lista'
// Adiciona estas linhas para contar:

let t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0;
let meninos = 0, meninas = 0; // <--- NOVAS VARIÁVEIS

lista.forEach(aluno => {
    // Contagem por Turma
    const g = (aluno.grupo || "").toLowerCase();
    if (g.includes("1")) t1++;
    else if (g.includes("2")) t2++;
    else if (g.includes("3")) t3++;
    else if (g.includes("4")) t4++;
    else if (g.includes("5")) t5++;

    // Contagem por Sexo (NOVO)
    if (aluno.sexo === "Menino") meninos++;
    else if (aluno.sexo === "Menina") meninas++;
});

// Atualiza todos os números no ecrã (incluindo Sexo)
document.getElementById('totalGeral').innerText = lista.length;
document.getElementById('totalT1').innerText = t1;
document.getElementById('totalT2').innerText = t2;
document.getElementById('totalT3').innerText = t3;
document.getElementById('totalT4').innerText = t4;
document.getElementById('totalT5').innerText = t5;
document.getElementById('totalMeninos').innerText = meninos; // <--- NOVO
document.getElementById('totalMeninas').innerText = meninas; // <--- NOVO
        // LÓGICA DE ORDENAÇÃO CONFORME O SEU SELECT
        lista.sort((a, b) => {
            if (ordem === 'nome') return (a.nome || "").localeCompare(b.nome || "");
            if (ordem === 'grupo') return (a.grupo || "").localeCompare(b.grupo || "");
            if (ordem === 'ano') return (Number(a.ano) || 0) - (Number(b.ano) || 0);
            if (ordem === 'dataInscricao') return new Date(a.dataInscricao || 0) - new Date(b.dataInscricao || 0);
            if (ordem === 'data') return (a.data || "").localeCompare(b.data || "");
            return 0;
        });

        corpo.innerHTML = ""; 
        
        const listaFiltrada = lista.filter(a => (a.nome || "").toLowerCase().includes(busca));

        listaFiltrada.forEach((aluno, idx) => {
            const anoAtual = new Date().getFullYear();
            const idadeCalculada = aluno.ano ? anoAtual - Number(aluno.ano) : null;
            const idadeTexto = (idadeCalculada > 0 && idadeCalculada < 100) ? `${idadeCalculada} anos` : '--';

            corpo.innerHTML += `
                <tr onclick="abrirFicha(${idx})" style="cursor:pointer">
                    <td>${aluno.data || '--'}</td>
                    <td style="color:var(--primary); font-weight:bold;">${aluno.nome || 'Sem Nome'}</td>
                    <td>${aluno.grupo || 'Sem Turma'}</td>
                    <td>${idadeTexto}</td>
                </tr>`;
        });
    } catch (e) {
        console.error("Erro:", e);
        corpo.innerHTML = "<tr><td colspan='4'>Erro ao carregar dados.</td></tr>";
    }
}



// ADICIONAR NOVO ALUNO
// ADICIONAR NOVO ALUNO (VERSÃO ATUALIZADA)
async function adicionar() {
    // Captura o valor do sexo selecionado no dropdown
    const sexoSelecionado = document.getElementById('cadSexo').value;

    const dados = {
        nome: document.getElementById('nome').value,
        data: document.getElementById('data').value,
        ano: document.getElementById('anoNasc').value,
        dataInscricao: document.getElementById('dataInscricao').value,
        grupo: document.getElementById('grupo').value,
        sexo: sexoSelecionado, // <--- ADICIONADO PARA O FIREBASE
        saude: document.getElementById('saude').value,
        nomeMae: document.getElementById('nomeMae').value,
        nomePai: document.getElementById('nomePai').value,
        celularPais: document.getElementById('celularPais').value,
        bairro: document.getElementById('bairro').value,
        foto: '', 
        docsInscricao: {}, 
        docsMensal: {},
        pagamentos: Array(12).fill(0),
        dataCriacao: new Date().toISOString()
    };

    if(dados.nome) {
        try {
            const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
            await addDoc(collection(window.db, "alunos"), dados);
            alert("Sucesso! Aluno guardado na nuvem.");
            renderizar();
        } catch (e) {
            alert("Erro ao salvar.");
        }
    }
}


// ABRIR PERFIL DO ALUNO
function abrirFicha(index) {
    alunoAbertoIdx = index; 
    toggleEdit(false);
    const a = lista[index];
    
    document.getElementById('mFotoPreview').src = a.foto || 'https://via.placeholder.com/120?text=FOTO';
    document.getElementById('mNome').innerText = a.nome;
    document.getElementById('mData').innerText = a.data;
    document.getElementById('mInsc').innerText = a.dataInscricao || "---";
    document.getElementById('mSaude').innerText = a.saude || "---";
    document.getElementById('mAnoEscolar').innerText = a.grupo;
    document.getElementById('mMae').innerText = a.nomeMae || "---";
    document.getElementById('mPai').innerText = a.nomePai || "---";
    document.getElementById('mCel').innerText = a.celularPais || "---";
    document.getElementById('mBairro').innerText = a.bairro || "---";
    document.getElementById('mObservacao').innerText = a.observacaoAdmin || "Nenhuma observação registada.";
document.getElementById('inputObs').value = a.observacaoAdmin || "";

    
    // Mostra os documentos nos dois blocos
    atualizarVisualDocs(); 
    
    // Renderiza grid de pagamentos
    const grid = document.getElementById('mMensalidades'); 
    grid.innerHTML = "";
    mesesNomes.forEach((mes, i) => {
        const status = a.pagamentos[i] === 1 ? 'pago' : 'pendente';
        grid.innerHTML += `<div class="mes-item ${status}" onclick="alternarPg(${index}, ${i})">${mes}<br>${a.pagamentos[i] === 1 ? 'PAGO' : 'NÃO PAGO'}</div>`;
    });
    
    document.getElementById('modalAluno').style.display = "block";
}

// --- GESTÃO DE DOCUMENTOS (OS DOIS BLOCOS) ---

function uploadDocInscricao(el) {
    if (!el.files[0]) return;
    const tipo = document.getElementById('tipoDocInsc').value;
    const reader = new FileReader();
    reader.onload = (e) => {
        if (!lista[alunoAbertoIdx].docsInscricao) lista[alunoAbertoIdx].docsInscricao = {};
        lista[alunoAbertoIdx].docsInscricao[tipo] = e.target.result;
        salvar();
        atualizarVisualDocs();
    };
    reader.readAsDataURL(el.files[0]);
}

function uploadDocMensalidade(el) {
    if (!el.files[0]) return;
    const mes = document.getElementById('mesDoc').value;
    const dataPag = document.getElementById('dataPagDoc').value;
    if (!dataPag) { alert("Selecione a data do pagamento!"); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
        if (!lista[alunoAbertoIdx].docsMensal) lista[alunoAbertoIdx].docsMensal = {};
        lista[alunoAbertoIdx].docsMensal[mes] = { arquivo: e.target.result, data: dataPag };
        salvar();
        atualizarVisualDocs();
    };
    reader.readAsDataURL(el.files[0]);
}

function atualizarVisualDocs() {
    const aluno = lista[alunoAbertoIdx];
    
    // Bloco Inscrição
    const divInsc = document.getElementById('listaDocsInsc');
    if(divInsc) {
        divInsc.innerHTML = "";
        for (let t in (aluno.docsInscricao || {})) {
            divInsc.innerHTML += `<div class="doc-item">
                <span>📄 ${t}</span>
                <div class="doc-actions no-print">
                    <button class="btn-icon" style="background:#007bff" onclick="baixarDocGeral('${aluno.docsInscricao[t]}','${t}')">👁️</button>
                    <button class="btn-icon" style="background:var(--danger)" onclick="apagarDocNovo('insc','${t}')">🗑️</button>
                </div>
            </div>`;
        }
    }

    // Bloco Mensalidades
    const divMensal = document.getElementById('listaDocsMensal');
    if(divMensal) {
        divMensal.innerHTML = "";
        for (let m in (aluno.docsMensal || {})) {
            divMensal.innerHTML += `<div class="doc-item">
                <span>💰 ${m} (${aluno.docsMensal[m].data})</span>
                <div class="doc-actions no-print">
                    <button class="btn-icon" style="background:#007bff" onclick="baixarDocGeral('${aluno.docsMensal[m].arquivo}','${m}')">👁️</button>
                    <button class="btn-icon" style="background:var(--danger)" onclick="apagarDocNovo('mensal','${m}')">🗑️</button>
                </div>
            </div>`;
        }
    }
}

// FUNÇÕES AUXILIARES
function apagarDocNovo(tipo, chave) {
    if(confirm("Apagar documento?")) {
        if(tipo === 'insc') delete lista[alunoAbertoIdx].docsInscricao[chave];
        else delete lista[alunoAbertoIdx].docsMensal[chave];
        salvar();
        atualizarVisualDocs();
    }
}

function baixarDocGeral(base64, nome) {
    const link = document.createElement("a");
    link.href = base64;
    link.download = `Doc_${nome}`;
    link.click();
}

function uploadFoto(el) {
    const reader = new FileReader();
    reader.onload = (e) => { 
        lista[alunoAbertoIdx].foto = e.target.result; 
        document.getElementById('mFotoPreview').src = e.target.result; 
        salvar(); 
    };
    reader.readAsDataURL(el.files[0]);
}

function alternarPg(aIdx, mIdx) { 
    lista[aIdx].pagamentos[mIdx] = lista[aIdx].pagamentos[mIdx] === 1 ? 0 : 1; 
    salvar(); 
    abrirFicha(aIdx); 
}

function salvar() { localStorage.setItem('bd_escola_final', JSON.stringify(lista)); }

function fecharModal() { document.getElementById('modalAluno').style.display = "none"; }

function toggleEdit(edit) {
    const view = document.getElementById('viewPerfil');
    const form = document.getElementById('editPerfil');
    
    if (edit) {
        const a = lista[alunoAbertoIdx];
        // Preenche os inputs com os dados atuais
        document.getElementById('eNome').value = a.nome || "";
        document.getElementById('eData').value = a.data || "";
        document.getElementById('eInsc').value = a.dataInscricao || "";
        document.getElementById('eAnoNasc').value = a.ano || "";
        document.getElementById('eMae').value = a.nomeMae || "";
        document.getElementById('ePai').value = a.nomePai || "";
        document.getElementById('eCel').value = a.celularPais || "";
        document.getElementById('eBairro').value = a.bairro || "";
        document.getElementById('eSaude').value = a.saude || "";
        
        view.style.display = 'none';
        form.style.display = 'block';
    } else {
        view.style.display = 'block';
        form.style.display = 'none';
    }
}


async function salvarEdicao() {
    const a = lista[alunoAbertoIdx];
    
    // 1. Captura os novos valores dos campos de edição
    const novosDados = {
        nome: document.getElementById('eNome').value,
        data: document.getElementById('eData').value,
        dataInscricao: document.getElementById('eInsc').value,
        ano: document.getElementById('eAnoNasc').value,
        nomeMae: document.getElementById('eMae').value,
        nomePai: document.getElementById('ePai').value,
        celularPais: document.getElementById('eCel').value,
        bairro: document.getElementById('eBairro').value,
        saude: document.getElementById('eSaude').value
    };

    try {
        // 2. Tenta atualizar no Firebase (Nuvem) se o aluno tiver um ID
        if (a.id) {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
            const alunoRef = doc(window.db, "alunos", a.id);
            await updateDoc(alunoRef, novosDados);
        }

        // 3. Atualiza a lista local para refletir a mudança imediatamente
        Object.assign(a, novosDados);
        
        salvar(); // Salva no localStorage
        renderizar(); // Atualiza a tabela principal
        abrirFicha(alunoAbertoIdx); // Atualiza a ficha visual
        toggleEdit(false); // Volta para o modo de visualização
        
        alert("Alterações salvas com sucesso!");
    } catch (e) {
        console.error("Erro ao atualizar:", e);
        alert("Erro ao salvar na nuvem, mas os dados foram guardados localmente.");
        
        // Backup: Salva localmente mesmo se o Firebase falhar
        Object.assign(a, novosDados);
        salvar();
        renderizar();
        toggleEdit(false);
    }
}


function baixarExcel() {
    let csv = '\uFEFFNiver;Inscricao;Nome;Mae;Pai;Bairro;Celular\n';
    lista.forEach(a => csv += `${a.data};${a.dataInscricao};${a.nome};${a.nomeMae};${a.nomePai};${a.bairro};${a.celularPais}\n`);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Lista_Alunos.csv"; 
    link.click();
}
// 1. Função que serve para SALVAR e também para EDITAR
async function salvarObservacao() {
    const a = lista[alunoAbertoIdx];
    const textoObs = document.getElementById('inputObs').value;

    try {
        if (a.id) {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
            const alunoRef = doc(window.db, "alunos", a.id);
            await updateDoc(alunoRef, { observacaoAdmin: textoObs });
        }
        a.observacaoAdmin = textoObs;
        document.getElementById('mObservacao').innerText = textoObs || "Nenhuma observação registada.";
        salvar(); 
        alert("Observação atualizada!");
    } catch (e) {
        alert("Erro ao guardar na nuvem.");
    }
}

// 2. Função para REMOVER (limpar tudo)
async function removerObservacao() {
    if (!confirm("Deseja apagar esta observação?")) return;
    const a = lista[alunoAbertoIdx];
    try {
        if (a.id) {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
            const alunoRef = doc(window.db, "alunos", a.id);
            await updateDoc(alunoRef, { observacaoAdmin: "" });
        }
        a.observacaoAdmin = "";
        document.getElementById('mObservacao').innerText = "Nenhuma observação registada.";
        document.getElementById('inputObs').value = "";
        salvar();
        alert("Observação removida!");
    } catch (e) {
        alert("Erro ao remover.");
    }
}
async function excluirAluno() {
    const aluno = lista[alunoAbertoIdx];

    // Pergunta de segurança para o Admin
    if (confirm(`TEM CERTEZA QUE DESEJA EXCLUIR O ALUNO: ${aluno.nome.toUpperCase()}? Esta ação não pode ser desfeita.`)) {
        
        try {
            // 1. Tenta apagar no Firebase (Nuvem)
            if (aluno.id) {
                const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
                const alunoRef = doc(window.db, "alunos", aluno.id);
                await deleteDoc(alunoRef);
            }

            // 2. Remove da lista local e salva
            lista.splice(alunoAbertoIdx, 1);
            salvar(); // Atualiza o localStorage
            
            // 3. Fecha o perfil e atualiza a tabela principal
            fecharModal(); //
            renderizar(); //
            
            alert("Aluno excluído com sucesso!");
        } catch (e) {
            console.error("Erro ao excluir:", e);
            alert("Erro ao excluir da nuvem. Verifique sua conexão.");
        }
    }
}
let gatilhoInstalacao;
const botaoInstalar = document.getElementById('btnInstalar');

window.addEventListener('beforeinstallprompt', (e) => {
    // Impede que o Chrome mostre o aviso automático chato
    e.preventDefault();
    // Guarda o evento para usar quando o utilizador clicar no botão
    gatilhoInstalacao = e;
    // Mostra o seu botão verde de instalação
    botaoInstalar.style.display = 'block';
});

botaoInstalar.addEventListener('click', async () => {
    if (gatilhoInstalacao) {
        // Mostra a janela nativa de instalação do Android
        gatilhoInstalacao.prompt();
        const { outcome } = await gatilhoInstalacao.userChoice;
        if (outcome === 'accepted') {
            console.log('Utilizador instalou o app');
            botaoInstalar.style.display = 'none';
        }
        gatilhoInstalacao = null;
    }
});
