// Eleventy genera SOLO il blog. Tutto il resto del sito resta HTML statico
// scritto a mano nella radice del repository e non passa da qui.
//
//   _blog/          sorgenti (Markdown + template)  ← si modifica questo
//   blog/           output generato                 ← non si tocca, è in .gitignore
//
// Netlify esegue `npm run build` prima di pubblicare. Se la build fallisce,
// Netlify NON pubblica e lascia online la versione precedente: un errore nel
// blog non può quindi mandare giù il sito.

module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection('posts', (collection) =>
    collection
      .getFilteredByGlob('_blog/posts/*.md')
      .filter((post) => !post.data.bozza)
      .sort((a, b) => b.date - a.date)
  );

  // Tutti i post, bozze incluse: l'indice le mostra marcate, così sono
  // revisionabili sul sito senza essere pubblicate come articoli veri.
  eleventyConfig.addCollection('postsConBozze', (collection) =>
    collection.getFilteredByGlob('_blog/posts/*.md').sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter('dataItaliana', (value) =>
    new Intl.DateTimeFormat('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(value)
  );

  eleventyConfig.addFilter('dataISO', (value) => value.toISOString().slice(0, 10));

  return {
    dir: {
      input: '_blog',
      output: 'blog',
      includes: '_includes',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
};
