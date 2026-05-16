# 📱 App ToDo List - Trabalho Dev Mobile

Aplicativo de lista de tarefas (To-Do) desenvolvido trabalho do 2º bimestre da disciplina de Desenvolvimento Mobile (Professor Sandro Ramos). 

## ✨ Funcionalidades
- **Criar tarefas:** Inclusão de nome, categoria e seleção de emoji personalizado.
- **Listar tarefas:** Separação automática entre tarefas "Incompletas" e "Realizadas".
- **Atualizar tarefas:** Edição completa dos dados da tarefa e marcação de status (concluído/pendente).
- **Excluir tarefas:** Exclusão com alerta de confirmação.
- **Armazenamento:** Persistência de dados utilizando o `AsyncStorage`.

---

## 🛠️ Decisões Técnicas e Ambiente

Durante o desenvolvimento, foram necessários alguns ajustes finos no ambiente para garantir que a biblioteca legada exigida para os emojis funcionasse perfeitamente. Não sei como os colegas executaram, mas após muitos testes, precisei fazer o projeto em cima da versão 51 do Expo.

### 1. O porquê das versões e do `--legacy-peer-deps`
A biblioteca `react-native-emoji-chooser` possui dependências mais antigas que entram em conflito com o `async-storage` moderno. Para que o projeto funcione sem falhas no motor do Hermes e no Expo, a instalação dos pacotes deve ser feita ignorando os conflitos de dependências pares.

- **Se for instalar os pacotes do zero, utilize:**

npm install --legacy-peer-deps

- **Precisei rodar esse comando no CMD de inicialização do expo, por que as placas virtuais de meu computador estavam conflitando.**

set REACT_NATIVE_PACKAGER_HOSTNAME=#MEU_IP && set EXPO_PACKAGER_HOSTNAME=#MEU_IP && npx expo start --lan -c

- **Link da versão 51 do expo go do projeto:**

https://expo.dev/go?sdkVersion=51&platform=android&device=true
