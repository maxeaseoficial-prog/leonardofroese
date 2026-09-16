# Integrar Parceiros & Clientes

## Implementação
- Importar `ClientLogos` em `sections.tsx` e renderizá-lo logo abaixo da faixa dos quatro indicadores em `Results`.
- Importar `ClientLogos` em `live-experience.tsx` e renderizá-lo antes da primeira transição da experiência Live.
- Aplicar somente espaçamento vertical no segundo ponto, preservando todo o conteúdo, comportamento e estilos existentes.

## Validação
- Confirmar ausência de overflow horizontal e posicionamento correto em desktop e celular.
- Conferir a validação automática do projeto e corrigir apenas erros relacionados à integração.

## Detalhes técnicos
- Reutilizar o componente e a animação já existentes, sem duplicar logos ou alterar sua lógica.
- Não modificar Hero, diagnóstico, CTAs, FAQ, textos ou demais seções.
