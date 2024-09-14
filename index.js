const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require('fs').promises

let mensagem = 'Bem vindo ao App de Metas!'

let metas

const carregarMetas = async () => {
  try {
    const dados = await fs.readFile('metas.json', 'utf-8')
    metas = JSON.parse(dados)
  } catch (error) {
    metas = []
  }
}

const salvarMetas = async () => {
  await fs.writeFile('metas.json', JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async () => {
  const meta = await input({ message: 'Digite a meta:' })

  if (meta.length == 0) {
    mensagem = 'A meta não pode ser vazia.'
    return
  }

  metas.push({ value: meta, checked: false })

  mensagem = 'Meta cadastrada com sucesso!'
}

const listarMetas = async () => {
  if (metas.length == 0) {
    mensagem = 'Não existem metas cadastradas!'
    return
  }

  const respostas = await checkbox({
    message:
      'Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o enter para finalizar esta etapa.',
    choices: [...metas],
    instructions: false
  })

  metas.forEach(m => {
    m.checked = false
  })

  if (respostas.length == 0) {
    mensagem = 'Nenhuma meta selecionada!'
    return
  }

  respostas.forEach(resposta => {
    const meta = metas.find(m => {
      return m.value == resposta
    })

    meta.checked = true
  })

  mensagem = 'Meta/s marcadas como concluída/s'
}

const metasRealizadas = async () => {
  if (metas.length == 0) {
    mensagem = 'Não existem metas cadastradas!'
    return
  }

  const realizadas = metas.filter(meta => {
    return meta.checked
  })

  if (realizadas.length == 0) {
    mensagem = 'Não existem metas realizadas!'
    return
  }

  await select({
    message: 'Metas realizadas: ' + realizadas.length,
    choices: [...realizadas]
  })

  // console.log(realizadas)
}

const metasAbertas = async () => {
  if (metas.length == 0) {
    mensagem = 'Não existem metas cadastradas!'
    return
  }

  const abertas = metas.filter(meta => {
    return meta.checked != true
  })

  if (abertas.length == 0) {
    mensagem = 'Não existem metas abertas!'
    return
  }

  await select({
    message: 'Metas abertas: ' + abertas.length,
    choices: [...abertas]
  })
}

const deletarMeta = async () => {
  if (metas.length == 0) {
    mensagem = 'Não existem metas cadastradas!'
    return
  }

  const metasDesmarcadas = metas.map(meta => {
    return { value: meta.value, checked: false }
  })

  const metasADeletar = await checkbox({
    message: 'Selecione item para deletar',
    choices: [...metasDesmarcadas],
    instructions: false
  })

  if (metasADeletar.length == 0) {
    mensagem = 'Não existem metas para serem deletadas!'
    return
  }

  metasADeletar.forEach(m => {
    metas = metas.filter(meta => {
      return meta.value != m
    })
  })

  mensagem = 'Meta/s deletada/s com sucesso!'
}

const mostrarMensagem = () => {
  console.clear()

  if (mensagem != '') {
    console.log(mensagem)
    console.log('')
    mensagem = ''
  }
}

const start = async () => {
  await carregarMetas()

  while (true) {
    mostrarMensagem()
    await salvarMetas()

    const opcao = await select({
      message: 'Menu >',
      choices: [
        {
          name: 'Cadastrar meta',
          value: 'cadastrar'
        },
        {
          name: 'Listar meta',
          value: 'listar'
        },
        {
          name: 'Metas realizadas',
          value: 'realizadas'
        },
        {
          name: 'Metas abertas',
          value: 'abertas'
        },
        {
          name: 'Deletar meta',
          value: 'deletar'
        },
        {
          name: 'Sair',
          value: 'sair'
        }
      ]
    })

    switch (opcao) {
      case 'cadastrar':
        await cadastrarMeta()
        // console.log(metas)
        break
      case 'listar':
        await listarMetas()
        // console.log(metas)
        break
      case 'realizadas':
        await metasRealizadas()
        // console.log(metasRealizadas)
        break
      case 'abertas':
        await metasAbertas()
        // console.log(metasAbertas)
        break
      case 'deletar':
        await deletarMeta()
        // console.log(metas)
        break
      case 'sair':
        console.log('Até a próxima!')
        return
    }
  }
}

start()
