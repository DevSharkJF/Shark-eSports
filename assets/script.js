const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponde = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHtml = text => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const pergunta = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder a pergunta ${question} do usuário com base no conhecimento do jogo e fornecer dicas, estratégias e builds relevantes

        ## Regras
        - Se você não souber a resposta, responda com "Desculpe, não sei a resposta para isso!", não tente inventar uma resposta
        - Se a pergunta não for relacionada ao jogo, responda com "Desculpe, essa pergunta não é relacionada ao jogo ${game}!"
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faças pesquisas atualizadas baseado na data atual
        - Nunca responda itens que você não tenha certeza que existe no jogo atual

        ## Respostas
        - Responda com frases lógicas e coerentes
        - Use linguagem amigável e se necessário, use termos e gírias do jogo
        - Responda em markdown quando a resposta for muito longa
        - Não faça saudação ou despedida, apenas responda a pergunta do usuário

    `

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search:{}
    }]

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == ''){
        alert('Por favor, preencha todos os campos.')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try{
        const text = await perguntarAI(question,game,apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHtml(text)
        aiResponse.removeAttribute('hidden');
    }catch(error){
        alert('Ocorreu um erro ao enviar a pergunta. Por favor, tente novamente.')
    }finally{
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}
form.addEventListener('submit', enviarFormulario)