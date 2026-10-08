import { createFileRoute } from '@tanstack/react-router'

const RPM_SOURCE_URL = 'https://caliber-summit-forge.lovable.app/'

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

  document.addEventListener('click', (event) => {
    const target = event.target;
    const anchor = target instanceof Element ? target.closest('a[href]') : null;
    if (!anchor) return;

    if (openCheckout(anchor.getAttribute('href') || anchor.href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();
</script>`

        const headInjection = `<base href="${RPM_SOURCE_URL}">${bridgeScript}`

        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${headInjection}`)
        } else {
          html = `${headInjection}${html}`
        }

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300',
          },
        })
      },
    },
  },
})
