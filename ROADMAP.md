# Roadmap — corradogizzi.it

Stato dei lavori in sospeso. **Aggiornare questo file a ogni avanzamento**, così non serve
ricostruire il contesto a ogni sessione. Ultimo aggiornamento: 18 agosto 2026.

L'obiettivo di fondo resta quello del briefing: essere il riferimento regionale per il
glaucoma in Emilia-Romagna, superando in ranking i profili di terze parti sul nome del
dottore e su "glaucoma" + area geografica.

---

## In attesa di revisione da Corrado

| Cosa | Dove | Stato |
|---|---|---|
| `diagnostica/tonometria.html` | scheda nuova | bozza, `noindex` + BOZZA |
| `diagnostica/disco-ottico.html` | scheda nuova | bozza, `noindex` + BOZZA |
| Listino del generatore preventivi | `strumenti/preventivo.html` | importi indicativi, da confermare |

Approvato il 18/8/2026 e già in sitemap: le altre cinque pagine di `diagnostica/` e i tre
articoli del blog.

Per pubblicare un post: `bozza: false` esplicito nel front matter (togliere la riga **non
basta**, resta il default di `posts/posts.json`), data aggiornata al giorno della revisione,
e riga in `sitemap.xml`.

---

## Priorità per la visibilità locale/regionale

### 1. Merge su `main` — bloccato sul via libera di Corrado

Nove pagine cliniche sono approvate e pronte ma vivono su `revisione`: finché non arrivano
in produzione non contano nulla per il ranking. Un deploy di produzione costa 15 crediti
Netlify, per questo si va a blocchi.

### 2. Search Console — dopo il merge

Inviare la sitemap aggiornata e richiedere l'indicizzazione delle pagine nuove. Senza,
Google può metterci settimane a scoprirle.

### 3. Allineare i nodi `Physician` al Google Business Profile

Entrambe le schede GBP (Bologna e Faenza) sono attive. Il GBP di Faenza usa il **cellulare**
(349 1908892), mentre i nodi `Physician` in `index.html` e `ambulatori.html` dichiarano
ancora il fisso (0546 1910613). Schema e GBP che dicono cose diverse indeboliscono il
segnale locale. Aggiungere anche il link al sito da entrambe le schede.

### 4. Sezione diagnostica — fatta

`diagnostica/` sul modello di `chirurgia/` e `laser/`: indice più una scheda per tonometria,
disco ottico, OCT, campo visivo, pachimetria e gonioscopia. Sono ricerche che i pazienti
fanno **prima** di sapere di avere un glaucoma, quindi intercettano più in alto nel funnel
rispetto a "trabeculectomia".

Restano da validare tonometria e disco ottico (vedi sopra).

### 5. Blog con cadenza regolare — avviato

Il sistema di etichette (Novità / Approfondimento / Curiosità) è in produzione. Tre bozze
in attesa di revisione (sopra).

**Gli argomenti dei prossimi articoli li decide Corrado di volta in volta** (deciso il
14/8/2026): non proporre né scrivere post non richiesti.

### 6. Backlink di autorità — mai affrontato

L'unico punto che non dipende dal sito, e quello con più peso residuo: ordine dei medici,
società scientifiche (AIMO, SOI), le pagine degli specialisti degli ospedali di Faenza e
Forlì dove Corrado è responsabile di servizio.

---

## Bloccati su Corrado (non urgenti)

- **Illustrazioni SVG anatomiche** per le schede chirurgia/laser — Inkscape, Plain SVG con
  viewBox, testo convertito in curve per l'HTML; PNG 300dpi ≥1200×900 per i PDF.
- **Video pazienti** — Bunny Stream non ancora attivato, riprese non iniziate. Gli script
  che il briefing dava per pronti (introduzione al glaucoma, aspetti ereditari, SLT) non
  sono né nel repo né su Drive: considerarli persi. I primi due argomenti sono ora coperti
  dagli articoli del blog.

---

## Strumenti interni

- **`strumenti/preventivo.html`** — generatore di preventivi: file HTML autonomo, si apre
  con un doppio clic e funziona offline. Si compila a sinistra, l'anteprima A4 si aggiorna
  a destra, «Stampa / Salva PDF» produce il documento senza il modulo. Il listino di
  partenza sta nella costante `LISTINO` in fondo al file; i singoli importi restano
  modificabili sul singolo preventivo.
- **Non è servito in produzione**: `netlify.toml` risponde 404 su `/strumenti/*`. Se quella
  regola sparisse, il listino diventerebbe pubblicamente leggibile.

---

## Debito tecnico noto

- **`prenota.html` non ha `action` sul form**: dopo l'invio Netlify mostra la propria
  schermata generica. `grazie.html` esiste, è stilata e già in `Disallow` nel `robots.txt`,
  ma non è collegata a nulla — sembra un cablaggio mai completato. Il modulo preventivo usa
  già il pattern corretto (`action="/preventivo-inviato.html"`).
- **~~File interni serviti in produzione~~ (risolto il 18/8/2026)**: `publish = "."` pubblica
  l'intera radice del repo, e `/CLAUDE.md`, `/package.json`, `/eleventy.config.js`
  rispondevano 200 su corradogizzi.it. Ora `netlify.toml` li blocca con un 404, insieme a
  `/strumenti/*` e `/tools/*`. **Prima di aggiungere un file al repo, chiedersi se possa
  essere servito**: la radice è pubblica per impostazione predefinita.
- **Upload referti nel modulo preventivo**: escluso di proposito. Caricare documentazione
  clinica significa trattare categorie particolari di dati (art. 9 GDPR). La privacy policy
  è stata estesa per coprire i dati sanitari conferiti *nelle note*, ma prima di abilitare
  l'upload serve una revisione da parte di un consulente privacy.
