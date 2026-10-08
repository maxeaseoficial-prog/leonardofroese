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

        // Keep root-relative assets on the original RPM Summit origin.
        // This avoids loading the Summit bundle/images from leonardofroese.com.br.
        html = html
          .replaceAll('src="/', `src="${RPM_SOURCE_ORIGIN}/`)
          .replaceAll("src='/", `src='${RPM_SOURCE_ORIGIN}/`)
          .replaceAll('href="/', `href="${RPM_SOURCE_ORIGIN}/`)
          .replaceAll("href='/", `href='${RPM_SOURCE_ORIGIN}/`)
          .replaceAll('srcset="/', `srcset="${RPM_SOURCE_ORIGIN}/`)
          .replaceAll("srcset='/", `srcset='${RPM_SOURCE_ORIGIN}/`)

        // The original app reveals content through React after mount/scroll.
        // Inside the proxy hydration is not guaranteed, so only the exact
        // initial Reveal/Hero states are promoted to their original final state.
        // Hover overlays that also use opacity-0 are intentionally untouched.
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
