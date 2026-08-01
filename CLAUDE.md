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

Nav e footer sono iniettati da `js/layout.js` via `injectLayout('<chiave-pagina>', '<base>')`,
chiamato in fondo al `<body>` di ogni pagina.

- pagine in radice: `injectLayout('home')` — il secondo argomento si omette
- pagine in sottocartella: `injectLayout('trabeculectomia', '../')`

Il secondo argomento è il prefisso applicato a **tutti** i percorsi di nav e footer,
così l'elenco delle voci di menu resta scritto una volta sola rispetto alla radice.
Le voci di menu stanno nell'array `NAV_PAGES`; una voce con `children` diventa un
menu a tendina (hover e focus da desktop, pulsante +/− da mobile).

Nelle pagine in sottocartella ricordarsi il `../` anche su CSS, JS e immagini.

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
