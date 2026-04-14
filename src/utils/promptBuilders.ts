import type { TeacherProfile, TeacherClass } from '@/types/teacher.types'

interface PromptContext {
  teacher: TeacherProfile | null
  selectedClass: TeacherClass | null
  topic: string
  sourceContext?: string
}

function buildHeader({ teacher, selectedClass }: PromptContext): string {
  const teacherInfo = teacher
    ? `Professor(a): ${teacher.name} | Disciplina: ${teacher.subject} | Escola: ${teacher.school}`
    : 'Informações do professor não configuradas'

  const classInfo = selectedClass
    ? `Turma: ${selectedClass.name} (${selectedClass.level}) | Perfil: ${selectedClass.studentProfile || 'não especificado'}`
    : 'Nenhuma turma selecionada'

  return `${teacherInfo}\n${classInfo}`
}

export function buildLessonPlanPrompt(ctx: PromptContext): string {
  const header = buildHeader(ctx)
  const subject = ctx.selectedClass?.subjectOverride || ctx.teacher?.subject || 'a disciplina'

  return `Você é um especialista em educação brasileira. Crie um plano de aula detalhado e completo em Português do Brasil.

Contexto:
${header}
Tema/Conteúdo: ${ctx.topic}
${ctx.sourceContext ? `\nMaterial de referência fornecido pelo professor:\n${ctx.sourceContext}` : ''}

Crie um plano de aula estruturado com as seguintes seções (use Markdown com cabeçalhos ##):

## Informações Gerais
- Disciplina, turma, tema, duração estimada

## Objetivos de Aprendizagem
Liste 3 a 5 objetivos usando verbos da Taxonomia de Bloom (ex: identificar, analisar, comparar, criar)

## Materiais Necessários
Liste todos os recursos e materiais necessários

## Desenvolvimento da Aula
Descreva a aula em três momentos com tempo estimado para cada:
1. **Abertura/Sensibilização** (xx min)
2. **Desenvolvimento** (xx min)
3. **Fechamento/Síntese** (xx min)

## Metodologia e Estratégias
Descreva as metodologias ativas e estratégias pedagógicas utilizadas

## Avaliação
Como os alunos serão avaliados (formativa/somativa)

## Tarefa / Extensão
Atividade para casa ou para aprofundamento (opcional)

Adapte o conteúdo ao nível e perfil da turma. Seja prático e específico para ${subject}.`
}

export function buildActivitiesPrompt(ctx: PromptContext): string {
  const header = buildHeader(ctx)
  const level = ctx.selectedClass?.level || 'Ensino Fundamental'

  return `Você é um especialista em educação brasileira. Crie uma lista de atividades/exercícios em Português do Brasil.

Contexto:
${header}
Tema/Conteúdo: ${ctx.topic}
${ctx.sourceContext ? `\nMaterial de referência:\n${ctx.sourceContext}` : ''}

Crie uma lista diversificada de 10 questões/atividades adaptadas ao nível ${level}, estruturadas em Markdown:

## Atividades — ${ctx.topic}

### Questões Objetivas (Múltipla Escolha)
Crie 4 questões com 4 alternativas cada (A, B, C, D). Indique a resposta correta ao final de cada questão.

### Questões Dissertativas
Crie 3 questões abertas que estimulem a reflexão e síntese do conteúdo.

### Atividade Prática / Criativa
Crie 1 atividade prática, experimental ou criativa relacionada ao tema.

### Desafio (Nível Avançado)
Crie 1 questão desafiadora para alunos que concluírem mais rapidamente.

### Gabarito Comentado
Forneça as respostas das questões objetivas com breve justificativa.

Linguagem acessível para o nível da turma, com progressão gradual de dificuldade.`
}

export function buildSlidesPrompt(ctx: PromptContext): string {
  const header = buildHeader(ctx)

  return `Você é um especialista em educação brasileira e design instrucional. Crie uma apresentação completa de slides em Português do Brasil.

Contexto:
${header}
Tema/Conteúdo: ${ctx.topic}
${ctx.sourceContext ? `\nMaterial de referência:\n${ctx.sourceContext}` : ''}

Retorne APENAS um array JSON válido com 8 a 12 slides. Cada slide deve ter exatamente esta estrutura:
{
  "title": "Título do slide",
  "bullets": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "speakerNotes": "Notas para o professor sobre este slide",
  "imagePrompt": "Descrição em inglês de uma imagem educacional relevante para gerar por IA",
  "layout": "title|content|image_text|closing"
}

Layouts disponíveis:
- "title": slide de abertura (apenas para o 1º slide)
- "content": slide de conteúdo padrão com bullets
- "image_text": slide com texto e sugestão de imagem/diagrama
- "closing": slide de fechamento/conclusão (apenas para o último)

Conteúdo dos bullets: 3 a 5 pontos concisos e diretos por slide.
imagePrompt: descrição detalhada em inglês da imagem ideal para o slide.
Garanta progressão lógica do conteúdo, do geral ao específico.

Retorne APENAS o JSON, sem markdown, sem explicações.`
}
