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
    └── foto.jpg        ← Foto professionale (in realtà un PNG di 1,8 MB: da ottimizzare)
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
Apri `js/layout.js`, trova l'array `pages` e aggiungi una riga seguendo il formato esistente.

---

## Aggiungere la foto (se si vuole cambiare)

1. Rinomina la nuova foto `foto.jpg`
2. Copiala nella cartella `assets/`, sovrascrivendo quella esistente
3. Il sito si aggiorna automaticamente — nessun altro file da toccare

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
