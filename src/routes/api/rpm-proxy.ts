import { createFileRoute } from '@tanstack/react-router'

const RPM_SOURCE_URL = 'https://caliber-summit-forge.lovable.app/'
const RPM_SOURCE_ORIGIN = 'https://caliber-summit-forge.lovable.app'

export const Route = createFileRoute('/api/rpm-proxy')({
  server: {
    handlers: {
      GET: async () => {
        const upstream = await fetch(RPM_SOURCE_URL, {
          headers: {
            'user-agent': 'Mozilla/5.0',
            accept: 'text/html,application/xhtml+xml',
          },
        })

        if (!upstream.ok) {
          return new Response('Não foi possível carregar o RPM Summit.', {
            status: 502,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }

        let html = await upstream.text()

        html = html
          .replaceAll('src="/', `src="${RPM_SOURCE_ORIGIN}/`)
          .replaceAll("src='/", `src='${RPM_SOURCE_ORIGIN}/`)
          .replaceAll('href="/', `href="${RPM_SOURCE_ORIGIN}/`)
          .replaceAll("href='/", `href='${RPM_SOURCE_ORIGIN}/`)
          .replaceAll('srcset="/', `srcset="${RPM_SOURCE_ORIGIN}/`)
          .replaceAll("srcset='/", `srcset='${RPM_SOURCE_ORIGIN}/`)

        // Copy-only adaptation for /rpm. Keep the original DOM, classes, media,
        // spacing and section order untouched; replace only existing text nodes.
        const copyReplacements: Array<[string, string]> = [
          ['Sua empresa cresceu.', 'Dobre o lucro da sua empresa'],
          ['Agora ela precisa ficar mais forte.', 'sem ter que ser o herói dela.'],
          [
            'Descubra onde Pessoas, Finanças e Vendas estão travando lucro, autonomia e crescimento, e qual prioridade precisa ganhar estrutura primeiro.',
            'Em 3 horas, enxergue onde Pessoas, Finanças e Vendas estão drenando resultado e saia com um plano prático para acionar as alavancas de lucro que vão transformar a performance da sua empresa.',
          ],
          ['Dores reais de quem está crescendo', 'Onde o lucro está vazando'],
          [
            'No Summit, vamos colocar na mesa as principais dores que travam crescimento, lucro e clareza de gestão!',
            'Sua empresa pode estar vendendo mais e ficando com menos.',
          ],
          ['“Minha empresa vende, mas o lucro não aparece”', '“Minha empresa vende, mas o lucro não acompanha”'],
          [
            'Você trabalha, vende, gira a operação, mas no fim do mês a sensação é a mesma: entrou dinheiro, mas sobrou menos do que deveria.',
            'Você fatura, gira a operação e trabalha cada vez mais. Mas quando o mês fecha, sobra menos dinheiro do que deveria.',
          ],
          [
            'A operação continua exigindo sua presença para decidir, cobrar, resolver e destravar. A empresa cresce, mas ainda depende demais de você.',
            'A empresa cresceu, mas decisões, cobranças e problemas ainda dependem da sua presença para acontecer.',
          ],
          ['“Tenho equipe, mas tudo ainda passa por mim”', '“Tenho equipe, mas tudo ainda volta para mim”'],
          [
            'Você contratou, delegou parte da rotina, mas as decisões importantes continuam voltando para a sua mesa.',
            'Você delegou tarefas, mas ainda não conseguiu delegar responsabilidade.',
          ],
          [
            'Existe muita urgência, muita demanda e pouco foco. Sem clareza de prioridade, a empresa gira, mas não avança com força.',
            'Quando tudo parece urgente, o empresário reage ao que grita mais alto — e não necessariamente ao que custa mais caro.',
          ],
          ['“Vendo mais, mas sinto a empresa mais pesada”', '“Quanto mais vendo, mais pesada a empresa fica”'],
          [
            'O faturamento cresce, mas junto vêm retrabalho, desorganização, mais custo e mais pressão sobre o dono.',
            'Sem estrutura, crescimento pode trazer mais custo, retrabalho, gente e complexidade antes de trazer mais lucro.',
          ],
          ['“Meu comercial gera movimento, mas perde dinheiro na execução”', '“Meu comercial se movimenta, mas deixa dinheiro na mesa”'],
          [
            'Entram oportunidades, saem propostas, mas falta acompanhamento, conversão e processo para transformar esforço em resultado.',
            'Oportunidade existe. O problema pode estar na conversão, no acompanhamento, na margem ou na falta de processo para transformar esforço em resultado.',
          ],
          ['Para quem é', 'Para quem é o RPM Summit'],
          ['Para quem não quer construir pequeno.', 'Para quem já construiu uma empresa e não quer continuar carregando tudo nas costas.'],
          [
            'O Cáliber Summit foi criado para empresários e líderes que entenderam que crescer exige mais do que trabalhar mais. É preciso pensar melhor, estruturar melhor e decidir melhor.',
            'O RPM Summit é para empresários que já têm empresa de verdade: equipe, clientes, folha, impostos, decisões difíceis e dinheiro em risco. Não é um encontro para ouvir teoria sobre a empresa ideal. É para quem precisa olhar para a empresa que existe hoje, identificar onde está perdendo resultado e decidir o que atacar primeiro.',
          ],
          [
            'Leonardo Froese é fundador da Cáliber e do Grupo Froese. Há 19 anos atua dentro de empresas, estruturando gestão ao lado do dono e transformando problemas de operação em decisões práticas.',
            'Leonardo Froese é fundador da Cáliber e do Grupo Froese. Começou na controladoria aos 18 anos e abriu a própria empresa aos 20. Sua autoridade vem de anos dentro da operação, ao lado da equipe e na mesa de decisão, fazendo a gestão funcionar com números reais na frente.',
          ],
          [
            'Ao longo dessa trajetória, já participou da estruturação de mais de 450 empresas em 10 estados, atendendo negócios de diferentes portes e acumulando mais de R$ 100 milhões em lucro gerado para clientes.',
            'Ao longo dessa trajetória, participou da estruturação prática de mais de 450 empresas em 10 estados, acompanhando negócios de diferentes portes e segmentos e acumulando mais de R$ 100 milhões de lucro gerado para clientes.',
          ],
          [
            'No RPM Summit, Leonardo vai colocar Pessoas, Finanças e Vendas sob uma visão construída dentro de operações reais, para ajudar você a identificar o que está travando resultado, qual prioridade precisa vir primeiro e onde sua empresa precisa ganhar estrutura para crescer com mais força e menos dependência do dono.',
            'No RPM Summit, Leonardo vai colocar Pessoas, Finanças e Vendas sob essa mesma ótica: identificar onde o lucro está escapando, qual causa está por trás do problema e qual decisão merece prioridade.',
          ],
          ['19 anos', '16 anos'],
          ['de atuação prática', 'de controladoria'],
          ['estruturadas', 'estruturadas na prática'],
          ['em lucro gerado', 'em lucro gerado para clientes'],
          ['Validado no caixa, não na teoria.', 'Se não funcionou em empresa real, não entra no método.'],
          [
            'Antes de acelerar, você precisa entender o que realmente está travando a empresa.',
            'Encontre o problema que está por trás do problema. Resolver o sintoma sem entender a causa costuma trocar um problema por outro.',
          ],
          [
            'Nem tudo precisa ser resolvido agora. Gestão é saber o que vem primeiro.',
            'Nem tudo precisa ser resolvido agora. Identifique qual alavanca tem maior impacto e qual decisão precisa vir primeiro.',
          ],
          [
            'O que não é medido vira opinião. Números claros transformam decisão em direção.',
            'O que não é medido vira opinião. Número precisa fechar, indicador precisa ter dono e decisão precisa ser acompanhada.',
          ],
          ['Um ambiente construído para gerar movimento.', '3 horas para transformar problema em decisão.'],
          ['Conteúdo de alto nível', 'Diagnóstico'],
          [
            'Discussões densas, aplicáveis e alinhadas à realidade de quem conduz uma empresa.',
            'Enxergue o que a rotina esconde e olhe para resultado, operação, pessoas e vendas de forma conectada.',
          ],
          ['Networking estratégico', 'Vazamentos'],
          [
            'Um ambiente desenhado para aproximar pessoas que constroem em escala.',
            'Descubra onde o dinheiro está escapando: margem, retrabalho, equipe, estoque, conversão ou decisões tomadas tarde demais.',
          ],
          ['Experiência premium', 'Alavancas'],
          [
            'Cada detalhe pensado para sustentar o nível da conversa que acontece ali.',
            'Identifique qual decisão pode mover mais resultado agora e transforme problema em prioridade.',
          ],
          ['Aplicação prática', 'Plano prático'],
          [
            'Sair com direção: o que decidir, o que estruturar e por onde começar.',
            'Saia com clareza sobre o que atacar, em qual ordem e qual número acompanhar para saber se funcionou.',
          ],
          ['Experiências que merecem ser ouvidas.', 'Quem vive empresa reconhece quando a conversa é de verdade.'],
          [
            '3 horas para olhar sua empresa pela raiz, definir a prioridade e decidir com base em métricas.',
            '3 horas para enxergar onde o lucro está vazando, descobrir o que atacar primeiro e sair com um plano de ação para os próximos passos da sua empresa.',
          ],
          ['O seu próximo nível', 'Você não precisa carregar'],
          ['não acontece por acaso.', 'a empresa nas costas para ela crescer.'],
          ['Ele começa com uma decisão.', 'Precisa construir uma empresa que responda por resultado.'],
          ['Quero Participar', 'Quero participar do RPM Summit'],
          ['Mentalidade • Estrutura • Prosperidade', 'Raiz • Prioridade • Métrica'],
        ]

        for (const [from, to] of copyReplacements) {
          html = html.replace(from, to)
        }

        const animationFallback = `
<style>
  [class~="opacity-0"][class~="blur-[2px]"],
  [class~="opacity-0"][class~="blur-[3px]"] {
    opacity: 1 !important;
    filter: none !important;
    transform: translateY(0) !important;
  }
</style>`

        const bridgeScript = `
<script>
(() => {
  const checkoutHost = 'pay.kiwify.com.br';
  const testimonialVideos = {
    'depoimento 01': 's5Xw05eyuOM',
    'depoimento 02': 'nGj5NN4XvyM',
    'depoimento 03': 'odkL-rQqsC8'
  };

  const openCheckout = (href) => {
    try {
      const url = new URL(href, document.baseURI);
      if (url.hostname !== checkoutHost) return false;
      window.top.location.href = url.href;
      return true;
    } catch {
      return false;
    }
  };

  const openTestimonial = (target) => {
    const button = target instanceof Element
      ? target.closest('button[aria-label^="Reproduzir"], button[aria-label^="reproduzir"]')
      : null;
    if (!(button instanceof HTMLElement)) return false;

    const label = (button.getAttribute('aria-label') || '').toLowerCase();
    const entry = Object.entries(testimonialVideos).find(([name]) => label.includes(name));
    if (!entry) return false;

    const mediaContainer = button.closest('div.relative.aspect-video');
    if (!(mediaContainer instanceof HTMLElement)) return false;

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + entry[1] + '?controls=1&playsinline=1&autoplay=1';
    iframe.title = label.replace(/^reproduzir\\s+/, '') + ' do RPM Summit';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.style.position = 'absolute';
    iframe.style.inset = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';

    mediaContainer.replaceChildren(iframe);
    return true;
  };

  const syncGuideMetricsSpacing = () => {
    const expected = ['16 anos', '+450 empresas', '10 estados', '+r$ 100 milhões'];
    const metricValues = Array.from(document.querySelectorAll('p')).filter((node) => {
      const text = (node.textContent || '').replace(/\\s+/g, ' ').trim().toLowerCase();
      return expected.includes(text);
    });

    if (metricValues.length !== 4) return;

    const metricWrappers = metricValues
      .map((node) => node.parentElement)
      .filter((node) => node instanceof HTMLElement);

    if (metricWrappers.length !== 4) return;

    const container = metricWrappers[0].parentElement;
    if (!(container instanceof HTMLElement)) return;
    if (!metricWrappers.every((wrapper) => wrapper.parentElement === container)) return;

    container.style.paddingBottom = '3.5rem';
  };

  const syncHeaderState = () => {
    const header = document.querySelector('header.fixed');
    if (!(header instanceof HTMLElement)) return;

    const scrolled = window.scrollY > 24;
    header.style.borderBottom = scrolled
      ? '1px solid var(--border)'
      : '1px solid transparent';
    header.style.backgroundColor = scrolled
      ? 'color-mix(in oklch, var(--background) 90%, transparent)'
      : 'transparent';
    header.style.backdropFilter = scrolled ? 'blur(12px)' : '';
    header.style.webkitBackdropFilter = scrolled ? 'blur(12px)' : '';
  };

  document.addEventListener('click', (event) => {
    const target = event.target;

    if (openTestimonial(target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const anchor = target instanceof Element ? target.closest('a[href]') : null;
    if (!anchor) return;

    if (openCheckout(anchor.getAttribute('href') || anchor.href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  const syncPage = () => {
    syncHeaderState();
    syncGuideMetricsSpacing();
  };

  window.addEventListener('scroll', syncHeaderState, { passive: true });
  window.addEventListener('load', syncPage, { once: true });
  requestAnimationFrame(syncPage);
  setTimeout(syncGuideMetricsSpacing, 250);
  setTimeout(syncGuideMetricsSpacing, 900);
})();
</script>`

        const headInjection = `<base href="${RPM_SOURCE_URL}">${animationFallback}${bridgeScript}`

        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${headInjection}`)
        } else {
          html = `${headInjection}${html}`
        }

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
      },
    },
  },
})
