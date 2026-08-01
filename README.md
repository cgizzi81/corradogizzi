# Sito web — Dott. Corrado Gizzi
## Versione: Solo italiano · Palette Navy & Gold

---

## Struttura dei file

```
corradogizzi/
├── index.html          ← Homepage
├── ambulatori.html     ← Sedi Bologna e Faenza
├── biografia.html      ← CV, pubblicazioni, formazione
├── pazienti.html       ← Info glaucoma, FAQ, brochure
├── prenota.html        ← Calendario prenotazioni + form contatto
├── privacy.html        ← Privacy Policy GDPR
├── grazie.html         ← Conferma invio form (non indicizzata)
├── chirurgia/          ← Sezione chirurgia: indice + una pagina per procedura
├── laser/              ← Sezione laser: indice + una pagina per trattamento
├── _blog/              ← SORGENTI del blog (Markdown) — si modifica questo
├── blog/               ← Blog generato dalla build — non si tocca
├── package.json        ← Dipendenze della build del blog
├── eleventy.config.js  ← Configurazione del generatore del blog
├── netlify.toml        ← Configurazione hosting Netlify
├── robots.txt          ← Istruzioni per i motori di ricerca
├── sitemap.xml         ← Elenco pagine indicizzabili — aggiornare a ogni pagina nuova
├── CLAUDE.md           ← Convenzioni di progetto (SEO, accessibilità, schema)
├── css/
│   └── style.css       ← Tutto il CSS (colori, font, layout)
├── js/
│   ├── main.js         ← Navbar, scroll, accordion, form
│   └── layout.js       ← Nav e footer (condivisi tra pagine)
└── assets/
    ├── logo-symbol.svg ← Logo grafico (senza testo)
    ├── logo.svg        ← Logo completo
    ├── foto.jpg        ← Foto professionale (JPEG 1000×750, 53 KB)
    └── foto.webp       ← Stessa foto in WebP (35 KB), servita via <picture>
```

---

## Come modificare i contenuti

### Regola fondamentale

| Cosa vuoi cambiare | File da aprire |
|---|---|
| Testi, titoli, paragrafi, bottoni | Il file `.html` della pagina corrispondente |
| Colori, font, spaziature, layout | `css/style.css` |
| Voci di menu e footer | `js/layout.js` |

### Esempi pratici

**Cambiare un testo nella homepage:**
Apri `index.html`, cerca il testo con Ctrl+F, modificalo, salva con Ctrl+S.

**Cambiare gli orari di un ambulatorio:**
Apri `ambulatori.html`, cerca "Su appuntamento", modifica la riga corrispondente.

**Cambiare un colore:**
Apri `css/style.css`. Tutti i colori principali sono in cima al file nella sezione `:root`:
- `--gold: #b8962e` → oro del brand: linee, bordi, sfondi, testo su navy
- `--gold-deep: #7f6720` → oro scuro, **solo per testo su sfondo chiaro** (l'oro
  normale su crema è troppo poco contrastato per essere letto senza fatica)
- `--navy: #0d1f3c` → colore blu scuro (sfondi, navbar)
- `--cream: #faf8f3` → colore sfondo chiaro

**Aggiungere una voce al menu:**
Apri `js/layout.js`, trova l'array `NAV_PAGES` e aggiungi una riga seguendo il formato
esistente. Se la voce ha un `children`, diventa automaticamente un menu a tendina.

**Aggiungere una pagina in una sottocartella:**
Copia l'intestazione di `chirurgia/trabeculectomia.html` e ricordati che tutti i
percorsi vogliono il prefisso `../`, incluso l'ultimo script:
`injectLayout('chiave-pagina', '../')`.

---

## Cambiare la foto

La foto viene servita in due formati tramite `<picture>`: WebP per i browser che lo
supportano, JPEG come riserva. Non basta più sovrascrivere un file solo.

L'originale era un PNG da 1,8 MB rinominato `.jpg` e mostrato a 400 px di larghezza:
pesava 34 volte il necessario. Se cambi la foto, falla ridimensionare e convertire
prima di caricarla — a 1000 px di lato lungo, qualità 82.

Vanno aggiornati insieme `assets/foto.jpg`, `assets/foto.webp` e gli attributi
`width`/`height` degli `<img>` in `index.html` e `biografia.html`.

---

## Aggiungere le brochure PDF

In `pazienti.html` le tre guide sono attualmente elementi `<span class="brochure-btn
brochure-btn--soon">`, cioè non cliccabili: i PDF non esistono ancora e lasciarli
come link produceva tre errori 404 su una pagina indicizzata.

Per pubblicarne una:

1. Metti il PDF in `assets/`
2. In `pazienti.html`, trasforma lo `<span>` corrispondente in
   `<a href="assets/nome-file.pdf" class="brochure-btn" target="_blank" rel="noopener">`
   (togliendo `brochure-btn--soon` e `aria-disabled`)
3. Togli "· in preparazione" dall'etichetta

---

## Prenotazioni online (Calendly)

Già configurato e attivo su `prenota.html`, con due widget distinti:

- Bologna → `corradogizzi-info/30min`
- Faenza → `corradogizzi/30min`

---

## Scrivere un articolo del blog

Il blog è l'unica parte del sito che passa da una build: tu scrivi in Markdown,
Netlify lo trasforma in HTML. Il resto del sito resta HTML scritto a mano.

1. Crea un file in `_blog/posts/`, per esempio `nome-articolo.md`
2. In cima mettici questo blocco:

```yaml
---
title: "Il titolo dell'articolo"
descrizione: "Il sommario, 140-160 caratteri: finisce su Google e nell'indice"
date: 2026-08-15
bozza: true
---
```

3. Sotto, scrivi il testo normalmente. `## Titolo` fa un sottotitolo,
   `**parola**` mette in grassetto, una riga vuota separa i paragrafi
4. `git add -A`, `git commit`, `git push` — l'articolo è online

L'indirizzo dell'articolo viene dal nome del file: `nome-articolo.md`
diventa `corradogizzi.it/blog/nome-articolo/`.

### Le bozze

**Finché c'è `bozza: true`, l'articolo non è indicizzato da Google** e mostra un
banner che lo segnala. È comunque visibile al suo indirizzo, così puoi rileggerlo
sul sito vero prima di pubblicarlo. Quando è pronto, togli quella riga e ripusha.

### Per vedere l'anteprima sul tuo computer

Serve una volta sola `npm install`, poi `npm run serve`. Non è indispensabile:
puoi lavorare a bozze e rileggerle direttamente sul sito.

---

## Come va online il sito

Il sito è già pubblicato: `corradogizzi.it` gira su **Netlify**, collegato al
repository GitHub `cgizzi81/corradogizzi`.

**Ogni push su `main` manda il sito in produzione in circa un minuto.** Non serve
trascinare cartelle né fare deploy manuali.

```
git add -A
git commit -m "descrizione della modifica"
git push
```

### DNS — non toccare senza motivo

I nameserver restano su **Aruba** (non sono stati trasferiti a Netlify): il dominio
punta a Netlify con un record A e un CNAME `www`. Questa scelta è deliberata, perché
spostare i nameserver interromperebbe le email `@corradogizzi.it`.

Le vecchie istruzioni che dicevano di sostituire i nameserver con quelli di Netlify
non sono più valide.

### Email del form di contatto

In Netlify: **Site → Forms → contatto → Form notifications → Add notification →
Email notification**, destinatario `info@corradogizzi.it`.

---

## Regole da rispettare quando si aggiunge una pagina

Sono descritte in `CLAUDE.md`, insieme alle convenzioni SEO e di accessibilità.
In sintesi: dominio canonico senza `www`, meta tag completi, JSON-LD, una riga
nella `sitemap.xml`, e i tre `<link>` dei font copiati nell'`<head>`.

---
