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
    iframe.title = label.replace(/^reproduzir\s+/, '') + ' do RPM Summit';
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
    const expected = ['19 anos', '+450 empresas', '10 estados', '+r$ 100 milhões'];
    const metricValues = Array.from(document.querySelectorAll('p')).filter((node) => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
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
