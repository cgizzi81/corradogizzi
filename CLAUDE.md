# corradogizzi.it — convenzioni di progetto

Sito del Dott. Corrado Gizzi, oculista specializzato in glaucoma. Obiettivo dichiarato:
diventare il riferimento regionale per il glaucoma in Emilia-Romagna, superando in
ranking i profili di terze parti (ilmiodottore.it e simili) sul nome del dottore e
su "glaucoma" + area geografica.

## Stack

Sito statico multi-pagina in HTML/CSS/JS vanilla. Nessuna build, nessuna dipendenza.

- Hosting **Netlify**, deploy automatico a ogni push su `main`
- Form contatti: **Netlify Forms**
- Prenotazioni: doppio widget **Calendly** (Bologna `corradogizzi-info/30min`, Faenza `corradogizzi/30min`)
- DNS su nameserver **Aruba** (non trasferiti a Netlify): record A + CNAME `www`.
  Non toccare il DNS senza verificare l'impatto sulle email del dominio.

## Dove sta cosa

| Cosa cambiare | File |
|---|---|
| Testi, titoli, contenuti di una pagina | il relativo `.html` |
| Colori, font, spaziature, layout | `css/style.css` |
| Voci di menu e footer | `js/layout.js` |
| Comportamenti (menu mobile, FAQ, form, reveal) | `js/main.js` |

Nav e footer sono iniettati da `js/layout.js` via `injectLayout('<chiave-pagina>')`,
chiamato in fondo al `<body>` di ogni pagina. Le voci stanno nell'array `NAV_PAGES`;
una voce con `children` diventa un menu a tendina.

Il secondo argomento (`'../'`) non serve più ed è ignorato: resta accettato solo per
non dover toccare le chiamate già scritte in fondo alle pagine.

Nelle pagine in sottocartella ricordarsi il `../` su CSS, JS e immagini della pagina —
nav e footer invece usano percorsi assoluti.

### I link interni vanno alla forma canonica

Un link a `/chirurgia/index.html` fa scansionare a Google un duplicato di
`/chirurgia/`, che poi scarta: è ciò che Search Console segnala come
**«Pagina alternativa con tag canonical appropriato»**. Non è un errore grave — il
canonical sta facendo il suo lavoro — ma è budget di scansione buttato.

Quindi: **mai linkare `index.html`**. La home è `/`, le sezioni sono `/chirurgia/`,
`/laser/`, `/blog/`, le landing sono `/glaucoma-bologna/` e così via. `netlify.toml`
tiene comunque dei 301 da `/…/index.html` alla forma canonica, per gli URL che Google
avesse già scoperto.

## Il blog (Eleventy)

Il blog è **l'unica parte del sito generata da una build**. Tutto il resto resta HTML
scritto a mano.

```
_blog/                  sorgenti — si modifica questo
  index.njk             indice del blog
  _includes/base.njk    template dell'articolo (head, schema, avvertenza, CTA)
  posts/*.md            un file Markdown per articolo
  posts/posts.json      impostazioni comuni a tutti i post
blog/                   output generato — in .gitignore, non si modifica
```

`npm run build` (cioè `eleventy`) rigenera `blog/`. Netlify lo esegue a ogni deploy:
i sorgenti sono versionati, l'output no. Se la build fallisce Netlify **non pubblica**
e lascia online il deploy precedente, quindi un errore nel blog non può mandare giù
il sito.

Front matter di un articolo:

```yaml
---
title: "Titolo mostrato come H1 e usato come <title>"
descrizione: "140-160 caratteri, diventa meta description, sommario e og:description"
date: 2026-08-01
bozza: true      # finché è true: noindex + banner "bozza", fuori da collections.posts
---
```

Il `<title>` non porta il suffisso col nome del dottore: i titoli degli articoli sono
già lunghi e lo sfonderebbero. Se serve un titolo diverso da quello in pagina, si usa
`titoloSeo` nel front matter.

**`bozza: true` è il default** (impostato in `posts/posts.json`): un articolo nasce non
indicizzato e viene aperto a Google solo quando Corrado lo approva, togliendo il campo.

## Sezioni di contenuto clinico

```
chirurgia/   → index (indice) + una pagina per procedura
laser/       → index (indice) + una pagina per trattamento
```

Procedure previste: trabeculectomia, impianti drenanti, MIGS, MIBS.
Laser previsti: SLT, iridotomia YAG, ciclofotocoagulazione a diodo.

**Le pagine cliniche nascono con `<meta name="robots" content="noindex, follow">`
e restano fuori dalla `sitemap.xml` finché Corrado non le ha revisionate.** Il
contenuto medico non validato non deve essere indicizzato: la pagina è comunque
raggiungibile al suo URL reale, così la revisione avviene sul sito vero.
Alla validazione: togliere il `noindex`, togliere il commento «BOZZA DA REVISIONARE»
e aggiungere la riga in `sitemap.xml`.

## Regole SEO — da rispettare su ogni pagina nuova

Il dominio canonico è **`https://corradogizzi.it`** senza `www`: `netlify.toml`
redirige `www` → apex con un 301. Ogni URL scritto a mano (canonical, og:url,
sitemap, `@id` dello schema) deve usare la forma senza `www`, altrimenti si crea
una catena di redirect che diluisce il ranking.

Ogni nuova pagina indicizzabile richiede:

1. `<title>` sotto i ~60 caratteri, con la keyword prima del nome del dottore
2. `<meta name="description">` di 140-160 caratteri, scritta per il click non per il crawler
3. `<link rel="canonical">` assoluto
4. blocco Open Graph completo (`og:site_name`, `og:locale`, `og:title`, `og:description`, `og:type`, `og:url`, `og:image`) + `twitter:card`
5. i tre `<link>` dei font Google (preconnect ×2 + stylesheet) — **non** usare `@import` nel CSS: si scaricherebbe in serie dopo il CSS, ritardando il rendering
6. JSON-LD in `@graph` con almeno un `BreadcrumbList`
7. una riga in `sitemap.xml`

Le pagine non indicizzabili (es. `grazie.html`) vanno con
`<meta name="robots" content="noindex, follow">`, fuori dalla sitemap e in `Disallow` nel `robots.txt`.

### Blocco autore (E-E-A-T)

Ogni pagina di contenuto clinico porta in fondo, **prima della CTA finale**, un blocco
`.autore` con foto, nome, credenziali e data di ultima revisione. Va scritto in **HTML
statico**, non iniettato da JavaScript: è il segnale con cui Google distingue un
contenuto medico firmato da uno anonimo, e deve esserci anche senza rendering.

Nei dati strutturati gli corrispondono `reviewedBy` (già presente) e `lastReviewed`
sul nodo `MedicalWebPage`. **Le due cose vanno aggiornate insieme**: se si rivede il
testo di una pagina, si aggiorna la data sia nel blocco visibile sia in `lastReviewed`,
altrimenti Google legge una data e il paziente ne vede un'altra.

Il blocco usa lo stesso sfondo della sezione che lo precede, con `padding-top:0`, così
si legge come continuazione del contenuto e non come una fascia a sé.

Pagine che lo portano: `pazienti.html`, tutte quelle in `chirurgia/` e `laser/`, e ogni
articolo del blog tramite `_blog/_includes/base.njk`.

### Favicon

Il logo è un occhio composto da linee sottilissime: rasterizzato a 16 px diventa una
macchia grigia, a 32 px produce moiré. Le icone piccole usano quindi un **mark
semplificato** (`assets/favicon.svg`: disco oro con l'apertura a mandorla in navy), che
ne conserva la geometria ma sopravvive alle dimensioni minime; le icone grandi
(apple-touch, 192, 512) usano invece il **logo reale** in oro su fondo navy, perché a
quelle misure le linee si leggono.

I `<link>` della favicon usano percorsi **assoluti dalla radice** (`/favicon.ico`), a
differenza del resto del sito: così l'unico blocco vale identico anche per le pagine in
sottocartella. Va copiato nell'`<head>` di ogni pagina nuova.

### Orari: due punti da tenere allineati

Gli orari degli ambulatori compaiono in **due posti che vanno aggiornati insieme**:

1. le tabelle `.orari-table` in `ambulatori.html` (quello che legge il paziente)
2. gli `openingHoursSpecification` nei nodi `Physician`, presenti **sia** in
   `ambulatori.html` **sia** in `index.html` (quello che legge Google)

Stato al 6 agosto 2026: **Faenza il lunedì 15:00–19:00, Bologna il mercoledì
15:00–19:00.** Sono gli unici due mezzi giornate di attività libero-professionale.
Fino a quella data il sito dichiarava giorni diversi e invertiti fra le due sedi
(Bologna lun/mer/ven, Faenza mar/gio): un dato ereditato e mai verificato.

Se gli orari cambiano vanno cambiati in tre punti, o Google mostrerà "Aperto ora"
quando l'ambulatorio è chiuso. Quando ci sarà il Google Business Profile diventeranno
quattro: anche la scheda GBP deve dire la stessa cosa.

### Identificatori dello schema — riusare, non duplicare

Le entità hanno `@id` stabili e vanno referenziate, mai ridefinite per intero:

- `https://corradogizzi.it/#corrado-gizzi` — la persona
- `https://corradogizzi.it/#website` — il sito
- `https://corradogizzi.it/ambulatori.html#bologna` — sede Bologna (`Physician`)
- `https://corradogizzi.it/ambulatori.html#faenza` — sede Faenza (`Physician`)

Le due sedi sono modellate come due `Physician` distinti perché rispecchiano le due
schede Google Business Profile previste, una per città: schema e GBP devono raccontare
la stessa cosa, o il segnale locale si indebolisce.

## Accessibilità — i pazienti sono in larga parte anziani

Il contrasto non è un dettaglio estetico su questo sito.

- `--gold` (`#b8962e`) è **decorativo**: linee, bordi, sfondi, e testo su navy.
  Su fondo chiaro dà 2,66:1, sotto il minimo WCAG di 4,5:1.
- `--gold-deep` (`#7f6720`) è la variante **per il testo su fondo chiaro**: link inline,
  `.section-label`, `.btn-outline`. Passa 4,5:1 su crema, bianco, gold-pale e gray-100.
- I bottoni oro portano testo **navy**, non bianco: bianco su oro è 2,82:1.

Prima di introdurre una nuova combinazione di colori, verificane il rapporto.
Ogni controllo interattivo deve avere stato di focus visibile, `aria-expanded`
sincronizzato dove apre/chiude qualcosa, e nome accessibile.

## Divisione dei compiti

- **Corrado**: contenuti testuali, correzioni cliniche e di dato, supervisione grafica.
  La precisione clinica e anatomica è essenziale — nel dubbio, chiedere.
- **Claude Code**: modifiche strutturali, nuove sezioni, SEO tecnica, integrazione
  illustrazioni, sviluppo. Le prime bozze dei testi le scrive Claude, Corrado revisiona.

Contenuti verso i pazienti **sempre in italiano**: l'approccio bilingue è stato provato
e abbandonato.

## Note operative

- Procedere per passi, avvisando prima di push che vanno in produzione (Netlify
  pubblica a ogni push su `main`).
- Il repo va tenuto **fuori dai percorsi sincronizzati di Google Drive**: il file
  locking di Drive corrompe `.git`. GitHub è l'unico punto di sincronizzazione
  affidabile tra il clone sul NAS e quello su Windows.
