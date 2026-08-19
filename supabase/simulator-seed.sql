-- Seed data for simulator_questions table
-- Run this in Supabase SQL Editor

INSERT INTO public.simulator_questions (level, topic, question_type, question_text, options, explanation) VALUES
-- PSPO I - Events
('PSPO I', 'events', 'single_choice',
 'Qual é o propósito do Daily Scrum?',
 '{"options": [{"text": "Reportar status para o Product Owner", "value": "A"}, {"text": "Inspecionar o progresso rumo ao Sprint Goal e adaptar o Sprint Backlog", "value": "B"}, {"text": "Atualizar o burn-down chart", "value": "C"}, {"text": "Discutir impedimentos com stakeholders", "value": "D"}]}'::jsonb,
 'O Daily Scrum é para os Desenvolvedores inspecionarem o progresso rumo ao Sprint Goal e adaptarem o Sprint Backlog. Não é uma reunião de status para o PO.'),

('PSPO I', 'events', 'single_choice',
 'Quem pode cancelar um Sprint?',
 '{"options": [{"text": "Scrum Master", "value": "A"}, {"text": "Product Owner", "value": "B"}, {"text": "Developers", "value": "C"}, {"text": "Stakeholders", "value": "D"}]}'::jsonb,
 'Apenas o Product Owner tem autoridade para cancelar um Sprint, geralmente quando o Sprint Goal torna-se obsoleto.'),

('PSPO I', 'events', 'single_choice',
 'Qual é o timebox máximo do Sprint Review para um Sprint de um mês?',
 '{"options": [{"text": "2 horas", "value": "A"}, {"text": "4 horas", "value": "B"}, {"text": "6 horas", "value": "C"}, {"text": "8 horas", "value": "D"}]}'::jsonb,
 'O Sprint Review tem timebox de 4 horas para Sprint de um mês. Proporcionalmente menor para Sprints mais curtos.'),

-- PSPO I - Artifacts
('PSPO I', 'artifacts', 'single_choice',
 'Quem é responsável por garantir que o Product Backlog seja transparente e ordenado?',
 '{"options": [{"text": "Scrum Master", "value": "A"}, {"text": "Product Owner", "value": "B"}, {"text": "Developers", "value": "C"}, {"text": "Stakeholders", "value": "D"}]}'::jsonb,
 'O Product Owner é o único responsável por gerenciar o Product Backlog, incluindo sua transparência, ordenação e clareza.'),

('PSPO I', 'artifacts', 'single_choice',
 'O que é o Definition of Done?',
 '{"options": [{"text": "Uma lista de tarefas para o Sprint", "value": "A"}, {"text": "Um acordo sobre quando o trabalho está completo", "value": "B"}, {"text": "O plano do Sprint", "value": "C"}, {"text": "O Product Backlog ordenado", "value": "D"}]}'::jsonb,
 'O Definition of Done é um acordo compartilhado que define quando um Incremento está completo e pronto para entrega.'),

-- PSPO I - Roles
('PSPO I', 'roles', 'single_choice',
 'Quem é responsável por maximizar o valor do produto?',
 '{"options": [{"text": "Scrum Master", "value": "A"}, {"text": "Product Owner", "value": "B"}, {"text": "Developers", "value": "C"}, {"text": "Stakeholders", "value": "D"}]}'::jsonb,
 'O Product Owner é a única pessoa responsável por maximizar o valor do produto resultante do trabalho do Scrum Team.'),

('PSPO I', 'roles', 'multiple_choice',
 'Quais das seguintes são responsabilidades do Scrum Master? (Selecione todas que se aplicam)',
 '{"options": [{"text": "Remover impedimentos", "value": "A"}, {"text": "Gerenciar o Product Backlog", "value": "B"}, {"text": "Facilitar eventos Scrum", "value": "C"}, {"text": "Treinar a organização em Scrum", "value": "D"}]}'::jsonb,
 'O Scrum Master serve o Scrum Team removendo impedimentos, facilitando eventos e treinando a organização. Não gerencia o Product Backlog (responsabilidade do PO).'),

-- PSPO II - EBM
('PSPO II', 'ebm', 'single_choice',
 'Qual das seguintes métricas pertence à categoria "Current Value" no Evidence-Based Management?',
 '{"options": [{"text": "Time to Market", "value": "A"}, {"text": "Customer Satisfaction", "value": "B"}, {"text": "Innovation Rate", "value": "C"}, {"text": "Employee Satisfaction", "value": "D"}]}'::jsonb,
 'Customer Satisfaction mede o valor atual entregue aos clientes. Time to Market é "Ability to Innovate", Innovation Rate é "Unrealized Value", Employee Satisfaction não é uma métrica EBM direta.'),

('PSPO II', 'ebm', 'single_choice',
 'O que mede o "Unrealized Value"?',
 '{"options": [{"text": "Valor já entregue aos clientes", "value": "A"}, {"text": "Valor potencial que ainda pode ser capturado", "value": "B"}, {"text": "Velocidade do time", "value": "C"}, {"text": "Satisfação dos stakeholders", "value": "D"}]}'::jsonb,
 'Unrealized Value representa o valor futuro que poderia ser realizado ao atender necessidades não satisfeitas dos clientes ou mercados.'),

-- PSPO II - Stakeholders
('PSPO II', 'stakeholders', 'single_choice',
 'Como o Product Owner deve lidar com stakeholders que exigem funcionalidades contraditórias?',
 '{"options": [{"text": "Atender a todos para evitar conflitos", "value": "A"}, {"text": "Priorizar baseado no valor e comunicar trade-offs transparente", "value": "B"}, {"text": "Ignorar os menos importantes", "value": "C"}, {"text": "Delegar decisão ao Scrum Master", "value": "D"}]}'::jsonb,
 'O PO deve tomar decisões baseadas em valor, comunicar trade-offs claramente e dizer "não" quando necessário para maximizar o valor do produto.'),

-- PSPO II - Scaling
('PSPO II', 'scaling', 'single_choice',
 'No Nexus framework, quantos Scrum Teams no máximo formam um Nexus?',
 '{"options": [{"text": "3", "value": "A"}, {"text": "6", "value": "B"}, {"text": "9", "value": "C"}, {"text": "12", "value": "D"}]}'::jsonb,
 'Um Nexus consiste de 3 a 9 Scrum Teams trabalhando em um único Product Backlog para entregar um Incremento integrado.'),

-- Additional PSPO I questions
('PSPO I', 'events', 'single_choice',
 'Quando o Sprint Goal é criado?',
 '{"options": [{"text": "Durante o Sprint Planning", "value": "A"}, {"text": "Antes do Sprint Planning", "value": "B"}, {"text": "Durante o Sprint Review", "value": "C"}, {"text": "Durante o Daily Scrum", "value": "D"}]}'::jsonb,
 'O Sprint Goal é criado durante o Sprint Planning pelo Scrum Team.'),

('PSPO I', 'artifacts', 'single_choice',
 'O que acontece com itens do Product Backlog não concluídos ao final do Sprint?',
 '{"options": [{"text": "São descartados", "value": "A"}, {"text": "Voltam para o Product Backlog e são reordenados", "value": "B"}, {"text": "São movidos para o próximo Sprint automaticamente", "value": "C"}, {"text": "São dados ao Scrum Master", "value": "D"}]}'::jsonb,
 'Itens não concluídos retornam ao Product Backlog para reordenação pelo Product Owner.'),

('PSPO I', 'roles', 'single_choice',
 'Quem decide como o trabalho será realizado durante o Sprint?',
 '{"options": [{"text": "Product Owner", "value": "A"}, {"text": "Scrum Master", "value": "B"}, {"text": "Developers", "value": "C"}, {"text": "Stakeholders", "value": "D"}]}'::jsonb,
 'Os Developers são autônomos para decidir como transformar itens do Sprint Backlog em Incremento.'),

('PSPO I', 'events', 'single_choice',
 'Qual é o timebox do Sprint Planning para Sprint de um mês?',
 '{"options": [{"text": "4 horas", "value": "A"}, {"text": "8 horas", "value": "B"}, {"text": "6 horas", "value": "C"}, {"text": "10 horas", "value": "D"}]}'::jsonb,
 'Sprint Planning tem timebox de 8 horas para Sprint de um mês.'),

('PSPO I', 'artifacts', 'single_choice',
 'O Incremento deve ser:',
 '{"options": [{"text": "Entregue ao cliente ao final do Sprint", "value": "A"}, {"text": "Em condição de uso e atender ao Definition of Done", "value": "B"}, {"text": "Aprovado pelo Product Owner antes do Sprint Review", "value": "C"}, {"text": "Testado apenas por QA", "value": "D"}]}'::jsonb,
 'O Incremento deve estar em condição de uso e atender ao Definition of Done, independentemente de ser liberado.'),

-- PSPO II additional
('PSPO II', 'stakeholders', 'single_choice',
 'Qual técnica é útil para descobrir necessidades não expressas dos stakeholders?',
 '{"options": [{"text": "Entrevistas estruturadas", "value": "A"}, {"text": "Observação contextual / Gemba walks", "value": "B"}, {"text": "Questionários online", "value": "C"}, {"text": "Reuniões de status semanais", "value": "D"}]}'::jsonb,
 'Observar stakeholders em seu ambiente real (Gemba walks) revela necessidades latentes que eles não articulam em entrevistas.'),

('PSPO II', 'scaling', 'single_choice',
 'Qual é o papel do Nexus Integration Team?',
 '{"options": [{"text": "Gerenciar o Product Backlog global", "value": "A"}, {"text": "Coordenar dependências e integração entre times", "value": "B"}, {"text": "Substituir os Scrum Masters dos times", "value": "C"}, {"text": "Definir a arquitetura técnica", "value": "D"}]}'::jsonb,
 'O NIT ajuda a coordenar dependências cross-team e garantir integração contínua do Incremento integrado.'),

('PSPO II', 'ebm', 'single_choice',
 'Qual métrica indica a capacidade da organização de entregar novo valor rapidamente?',
 '{"options": [{"text": "Lead Time", "value": "A"}, {"text": "Cycle Time", "value": "B"}, {"text": "Time to Market", "value": "C"}, {"text": "Release Frequency", "value": "D"}]}'::jsonb,
 'Time to Market mede quão rápido uma ideia chega ao cliente, refletindo a capacidade de inovação (Ability to Innovate).'),

('PSPO II', 'ebm', 'single_choice',
 'O que significa "Current Value" no EBM?',
 '{"options": [{"text": "Valor que será entregue no futuro", "value": "A"}, {"text": "Valor já realizado para clientes hoje", "value": "B"}, {"text": "Valor de mercado da empresa", "value": "C"}, {"text": "ROI do último release", "value": "D"}]}'::jsonb,
 'Current Value mede o valor que o produto já entrega aos clientes atualmente (ex: satisfação, receita, uso).'),

-- More PSPO I
('PSPO I', 'events', 'single_choice',
 'Quem participa do Sprint Review?',
 '{"options": [{"text": "Apenas Scrum Team", "value": "A"}, {"text": "Scrum Team e Stakeholders convidados pelo PO", "value": "B"}, {"text": "Apenas Product Owner e Stakeholders", "value": "C"}, {"text": "Toda a organização", "value": "D"}]}'::jsonb,
 'O Sprint Review inclui o Scrum Team e stakeholders convidados pelo Product Owner para inspecionar o Incremento.'),

('PSPO I', 'artifacts', 'single_choice',
 'O Sprint Backlog pertence a:',
 '{"options": [{"text": "Product Owner", "value": "A"}, {"text": "Scrum Master", "value": "B"}, {"text": "Developers", "value": "C"}, {"text": "Scrum Team", "value": "D"}]}'::jsonb,
 'O Sprint Backlog é propriedade dos Developers, que o gerenciam durante o Sprint.'),

('PSPO I', 'roles', 'single_choice',
 'O Product Owner pode ser uma comissão?',
 '{"options": [{"text": "Sim, se forem da mesma área", "value": "A"}, {"text": "Não, deve ser uma única pessoa", "value": "B"}, {"text": "Sim, se houver consenso", "value": "C"}, {"text": "Depende do tamanho do produto", "value": "D"}]}'::jsonb,
 'O Product Owner é uma única pessoa, não um comitê. Pode delegar trabalho, mas a accountability é individual.'),

('PSPO I', 'events', 'single_choice',
 'O que NÃO é um evento formal do Scrum?',
 '{"options": [{"text": "Sprint Planning", "value": "A"}, {"text": "Daily Scrum", "value": "B"}, {"text": "Backlog Refinement", "value": "C"}, {"text": "Sprint Retrospective", "value": "D"}]}'::jsonb,
 'Backlog Refinement é uma atividade contínua, não um evento formal time-boxed do Scrum.'),

('PSPO I', 'artifacts', 'single_choice',
 'Quando um item do Product Backlog está "Ready" para Sprint Planning?',
 '{"options": [{"text": "Quando o PO diz que está pronto", "value": "A"}, {"text": "Quando está refinado, estimado e claro o suficiente para ser selecionado", "value": "B"}, {"text": "Quando está no topo do backlog", "value": "C"}, {"text": "Quando os stakeholders aprovam", "value": "D"}]}'::jsonb,
 '"Ready" significa que o item está suficientemente refinado, compreendido e estimado para ser puxado no Sprint Planning.'),

('PSPO I', 'roles', 'single_choice',
 'Qual é a accountability do Scrum Master em relação à eficácia do Scrum Team?',
 '{"options": [{"text": "Garantir que o time cumpra prazos", "value": "A"}, {"text": "Coaching, facilitar, remover impedimentos, promover melhoria contínua", "value": "B"}, {"text": "Atribuir tarefas aos Developers", "value": "C"}, {"text": "Reportar progresso para gerência", "value": "D"}]}'::jsonb,
 'O Scrum Master serve o time através de coaching, facilitação, remoção de impedimentos e promoção de melhoria contínua.'),

-- PSPO II additional
('PSPO II', 'stakeholders', 'single_choice',
 'Ao dizer "não" a um pedido de stakeholder, o PO deve:',
 '{"options": [{"text": "Apenas recusar educadamente", "value": "A"}, {"text": "Explicar o reasoning baseado em valor e oferecer alternativas", "value": "B"}, {"text": "Delegar ao Scrum Master", "value": "C"}, {"text": "Adiar a decisão indefinidamente", "value": "D"}]}'::jsonb,
 'Dizer "não" profissionalmente envolve explicar o raciocínio baseado em valor, trade-offs e sugerir alternativas quando possível.'),

('PSPO II', 'scaling', 'single_choice',
 'Qual framework de scaling usa o conceito de "Release Train"?',
 '{"options": [{"text": "Nexus", "value": "A"}, {"text": "SAFe", "value": "B"}, {"text": "LeSS", "value": "C"}, {"text": "Scrum@Scale", "value": "D"}]}'::jsonb,
 'SAFe (Scaled Agile Framework) organiza times em Agile Release Trains (ARTs) com planejamento sincronizado (PI Planning).'),

('PSPO II', 'ebm', 'single_choice',
 'Qual das quatro áreas-chave do EBM foca na capacidade de aprender e melhorar?',
 '{"options": [{"text": "Current Value", "value": "A"}, {"text": "Unrealized Value", "value": "B"}, {"text": "Ability to Innovate", "value": "C"}, {"text": "Time to Market", "value": "D"}]}'::jsonb,
 'Ability to Innovate mede a capacidade da organização de entregar novas capacidades e aprender rapidamente.'),

('PSPO II', 'ebm', 'single_choice',
 'Se "Unrealized Value" é alto e "Current Value" é baixo, qual estratégia o PO deve priorizar?',
 '{"options": [{"text": "Otimizar entrega do que já existe", "value": "A"}, {"text": "Explorar novas oportunidades de mercado e necessidades não atendidas", "value": "B"}, {"text": "Reduzir escopo para acelerar entrega", "value": "C"}, {"text": "Focar em eficiência operacional", "value": "D"}]}'::jsonb,
 'Unrealized Value alto indica grandes oportunidades não exploradas. O foco deve ser descoberta e inovação (Ability to Innovate).'),

('PSPO II', 'scaling', 'single_choice',
 'No LeSS, quantos Product Owners existem para um Product Backlog?',
 '{"options": [{"text": "Um por time", "value": "A"}, {"text": "Um para todo o produto", "value": "B"}, {"text": "Um por área funcional", "value": "C"}, {"text": "Compartilhado entre stakeholders", "value": "D"}]}'::jsonb,
 'LeSS mantém um único Product Owner para todo o produto, independentemente do número de times.');

-- Note: correct_answer values correspond to option values (A, B, C, D).
-- For multiple_choice, correct_answer can be comma-separated like "A,C".