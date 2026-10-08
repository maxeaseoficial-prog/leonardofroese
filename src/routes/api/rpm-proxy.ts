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

    const videoUrl = 'https://www.youtube.com/watch?v=' + entry[1];
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
    return true;
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

  window.addEventListener('scroll', syncHeaderState, { passive: true });
  window.addEventListener('load', syncHeaderState, { once: true });
  requestAnimationFrame(syncHeaderState);
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
