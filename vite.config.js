import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `base: './'` keeps asset paths relative, so the built site works on
// GitHub Pages project sites (user.github.io/repo/), custom domains, and
// any static host without extra configuration.
const SITE_URL = 'https://radiancecoaching.co.ke';

// The privacy policy and terms get their own web addresses (/privacy/ and /terms/). Static hosts
// like GitHub Pages only serve a path if a file exists there, so the build writes a copy of the
// home page for each one, with its own title, description and canonical address. The site then
// shows the right policy page from the path.
const LEGAL_PAGES = {
  privacy: {
    title: 'Privacy policy | Radiance Coaching',
    description:
      'How Radiance Coaching collects, uses and protects your personal information, and the choices you have under the Kenya Data Protection Act, 2019.',
  },
  terms: {
    title: 'Terms of service | Radiance Coaching',
    description:
      'How booking, payment, changes and cancellations work at Radiance Coaching with Anne Kibet.',
  },
};

function legalPages() {
  return {
    name: 'legal-pages',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const home = bundle['index.html'];
      if (!home || home.type !== 'asset') return;
      const source = String(home.source);

      for (const [slug, page] of Object.entries(LEGAL_PAGES)) {
        const url = `${SITE_URL}/${slug}/`;
        const html = source
          // The copy sits one folder down, so files that were found at ./ are now at ../
          .replace(/(src|href)="\.\//g, '$1="../')
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*"/, `$1${page.description}"`)
          .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
          .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
          .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${page.title}"`)
          .replace(/(<meta\s+property="og:description"\s+content=")[^"]*"/, `$1${page.description}"`)
          .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${page.title}"`)
          .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*"/, `$1${page.description}"`);
        this.emitFile({ type: 'asset', fileName: `${slug}/index.html`, source: html });
      }
    },
  };
}

// `base: './'` keeps asset paths relative, so the built site works on
// GitHub Pages project sites (user.github.io/repo/), custom domains, and
// any static host without extra configuration.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  plugins: [react(), tailwindcss(), legalPages()],
});
