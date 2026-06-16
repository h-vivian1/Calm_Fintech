# Calm Fintech 🏦✨

Uma plataforma de gerenciamento financeiro de alto padrão projetada para reduzir a carga cognitiva, fornecer insights preditivos usando Inteligência Artificial e focar na estabilidade do seu patrimônio.

![Calm Fintech Dashboard](./public/calm_fintech_preview.png)

## Funcionalidades Principais 🌟
- **Motor Preditivo com IA (Groq + Llama 3.1)**: Analisa seu histórico de ganhos e gastos variáveis para traçar uma média conservadora na sua projeção estocástica futura. Em momentos de déficit orçamentário (saldo negativo), a IA assume o controle para emitir alertas concisos e empáticos de contenção de liquidez.
- **Glassmorphism Design**: Uma interface premium, limpa e com animações suaves. A cor vermelha é estritamente evitada no fluxo normal, sendo acionada exclusivamente para alertas críticos.
- **Projeção Estocástica de Patrimônio**: Visualize o futuro das suas finanças através de um gráfico de 12 meses que compara o seu cenário atual com um cenário otimizado (+5% renda, -10% gastos).
- **Livro-Razão Persistente (SQLite + Prisma)**: Seus dados estão seguros e persistidos localmente. O registro mantém o histórico e suporta transações de "Renda Fixa" ou "Renda Variável" automaticamente detectadas para a IA.

## Stack de Tecnologia 🛠️
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Banco de Dados**: [SQLite](https://www.sqlite.org/) via [Prisma ORM](https://www.prisma.io/)
- **Inteligência Artificial**: [Groq SDK](https://console.groq.com/) (Llama 3.1 8B Instant)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/), com foco em tokens de design `glass-panel`
- **Gráficos**: [Recharts](https://recharts.org/)

## Como Executar Localmente 🚀

### 1. Clonar o Repositório
\`\`\`bash
git clone https://github.com/SeuUsuario/Calm_Fintech.git
cd Calm_Fintech
\`\`\`

### 2. Instalar Dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configurar Variáveis de Ambiente
Você precisará de uma chave de API da Groq para alimentar o motor preditivo. É **100% gratuito e ultrarrápido**.
1. Acesse o [Console da Groq](https://console.groq.com/keys).
2. Crie uma conta ou faça login.
3. Clique em **Create API Key** e copie a chave gerada.

No diretório raiz do projeto, crie um arquivo chamado `.env.local` e insira a sua chave:
\`\`\`env
GROQ_API_KEY=gsk_sua_chave_secreta_aqui
\`\`\`

*(Nota: O banco de dados SQLite será criado automaticamente e seu caminho não precisa ser declarado no `.env.local`, pois já é gerenciado pelo Prisma via `file:./dev.db`)*

### 4. Sincronizar o Banco de Dados
\`\`\`bash
npx prisma db push
\`\`\`

### 5. Iniciar o Servidor de Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador. O Turbopack iniciará a aplicação quase instantaneamente.

## Design System & Filosofia 🎨
O design da Calm Fintech foca na redução de estresse. Usamos tons escuros, fundos de *glassmorphism* e microinterações (como gradientes que acompanham o scroll). Apenas quando o seu *SafeToSpend* (Livre para Gastar) fica negativo, o aplicativo transita de um tom verde calmante para tons de vermelho, acionando a atenção de "Sobrevivência Financeira".

## Contribuição 🤝
Pull requests são muito bem-vindos. Para mudanças maiores, por favor abra uma *Issue* primeiro para discutir o que você gostaria de mudar.

## Licença 📝
MIT License.
