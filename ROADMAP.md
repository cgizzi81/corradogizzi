# Roadmap — corradogizzi.it

Stato dei lavori in sospeso. **Aggiornare questo file a ogni avanzamento**, così non serve
ricostruire il contesto a ogni sessione. Ultimo aggiornamento: 6 settembre 2026.

L'obiettivo di fondo resta quello del briefing: essere il riferimento regionale per il
glaucoma in Emilia-Romagna, superando in ranking i profili di terze parti sul nome del
dottore e su "glaucoma" + area geografica.

---

## Stato al 6 settembre 2026

**La fase di costruzione è finita.** Tutte le sezioni cliniche sono scritte, approvate,
indicizzate e in sitemap: `diagnostica/` (6 schede), `laser/` (3), `chirurgia/` (4), le tre
landing geografiche, cinque articoli di blog. Nessuna bozza in coda di revisione.

Il collo di bottiglia si è spostato **fuori dal sito**: farlo trovare, e misurare se
funziona. Le priorità qui sotto riflettono questo spostamento — nessuna di esse è
"scrivere altre pagine".

Deploy del 6/9/2026 (`7f02121`), andato in produzione in un blocco unico: statistiche
Umami, card di condivisione, articolo MIGS, modulo di prenotazione collegato, combinazione
visita + controllo tono, e prima pubblicazione della PWA.

Per pubblicare un post: `bozza: false` esplicito nel front matter (togliere la riga **non
basta**, resta il default di `posts/posts.json`), data aggiornata al giorno della revisione,
riga in `sitemap.xml`, e card di condivisione generata (vedi sotto).

---

## Priorità

### 1. Search Console — da fare, e con urgenza

Reinviare la sitemap e chiedere l'indicizzazione delle pagine di agosto e del nuovo
articolo. **Va guardata anche la finestra del guasto SSL del 29/8–1/9**: per Googlebot un
certificato non valido è un errore di recupero, non un avviso, quindi in quei giorni le
scansioni sono fallite e qualche pagina può essere uscita dall'indice.

La proprietà è già verificata via record TXT sul DNS: non c'è nulla da configurare, solo da
entrare e usarla. Lo fa Corrado.

### 2. Recensioni Google — la leva più forte rimasta

Vedi la sezione dedicata più sotto. Zero lavoro tecnico, ma va trasformata in abitudine di
fine visita: le recensioni si accumulano lentamente.

### 3. Blog con cadenza regolare — attivo

Cinque articoli pubblicati. Il sistema di etichette (Novità / Approfondimento / Curiosità)
funziona, e ogni articolo ha ora la sua card di condivisione.

**Gli argomenti li decide Corrado di volta in volta** (deciso il 14/8/2026): non proporre né
scrivere post non richiesti. Le proposte arrivano da un'attività programmata di Claude
Desktop che scrive su Drive (`AI/Claude/Sito/corradogizzi_new/Blog/`); vanno **sempre
riscritte**, non integrate così come sono — quelle di agosto contenevano dati di mercato
statunitensi e affermazioni che contraddicevano le schede cliniche del sito.

### 4. Backlink di autorità — bloccato, non rimandato

Era il punto con più peso residuo, ma il 6/9/2026 Corrado ha chiarito che **non è
praticabile**: i siti delle società scientifiche in genere non hanno un campo per l'URL
personale, e in ospedale non gli è consentito pubblicizzare il sito per conflitto
d'interessi. Se in futuro si presenta l'occasione, la coglie lui.

Unica strada che non dipende da permessi altrui: i profili di terze parti che oggi lo
superano sul suo nome (ilmiodottore e simili) hanno quasi sempre un campo "sito web" per il
professionista che **rivendica** il profilo. Vale la pena verificare se i suoi sono
rivendicati: trasformerebbe un concorrente in una fonte di traffico.

Con i backlink fuori gioco, il peso si sposta tutto su recensioni e contenuti.

---

## Misurazione

### Statistiche di visita — Umami, attivo dal 6/9/2026

Servizio esterno gratuito (piano hobby, infrastruttura negli Stati Uniti). Scelto rispetto
al self-hosting sul NAS per una ragione precisa: **lo script di analytics gira nel browser
dei visitatori, quindi il server che raccoglie i dati deve essere pubblicamente
raggiungibile** — e il NAS ospita l'EMR con i dati dei pazienti. Aprire una porta pubblica
su quella macchina per contare le visite sarebbe uno scambio pessimo. Se un domani si vuole
l'infrastruttura in Germania, l'alternativa individuata è Plausible Cloud (~9 €/mese).

Lo script si inietta da `injectLayout()` in `js/layout.js`: un punto solo per tutte le
pagine più i due template del blog. Due condizioni lo governano:

- **si carica solo su `corradogizzi.it`** — senza questo filtro le anteprime del ramo
  `revisione`, che sono una copia integrale del sito, finirebbero nelle statistiche;
- **`?notrack=1` su qualsiasi pagina** spegne il conteggio su quel browser per sempre
  (`?notrack=0` lo riaccende), con conferma a schermo. Serve perché Firefox su Android non
  ha una console da cui impostare a mano la chiave `umami.disabled`, ed è il browser da cui
  Corrado visita il sito più spesso: con un traffico ancora basso le sue visite
  falserebbero ogni numero.

**Le conversioni non richiedono codice di tracciamento**: `/grazie.html` e
`/preventivo-inviato.html` sono raggiungibili solo dopo un invio riuscito, quindi il loro
numero di visualizzazioni nel pannello *Pages* è il numero di prenotazioni e di richieste di
preventivo completate.

Umami non usa cookie, quindi niente banner di consenso. La privacy policy è stata aggiornata
di conseguenza (punti 1, 2, 3, 5, 7): raccolta statistica anonima, legittimo interesse come
base giuridica, Umami fra i responsabili con la nota sul trasferimento extra-UE.

### Monitoraggio — UptimeRobot, dal 6/9/2026

Due monitor di tipo **keyword** (non semplice controllo di stato: Netlify restituisce 200
anche su una pagina segnaposto o su un deploy rotto) che cercano la parola "Gizzi" —
presente 37 volte nell'HTML statico, quindi indipendente dal JavaScript, che UptimeRobot non
esegue. Uno su `corradogizzi.it`, uno su `www.` per accorgersi se si rompe il 301.

**Il piano gratuito non include l'avviso di scadenza del certificato SSL.** Accettato
consapevolmente: il monitor keyword rileva comunque il guasto entro 5 minuti, perché un
certificato non valido fa fallire l'handshake TLS. Se un rinnovo dovesse fallire di nuovo,
valutare HetrixTools o Better Stack (che storicamente includono il controllo SSL nel piano
gratuito) o uno script sul NAS.

### Il guasto SSL del 1/9/2026 — cosa era, per non ridiagnosticarlo

Il sito serviva il certificato jolly `*.netlify.app` invece del proprio, e i browser
rifiutavano la connessione. **Causa**: Netlify tentava di rinnovare un certificato
**wildcard** per `*.corradogizzi.it`, che richiede una convalida DNS-01 — cioè un record TXT
che Netlify non può scrivere, perché il DNS è gestito da Aruba e non delegato a Netlify.
Ogni tentativo falliva, e cinque fallimenti in un'ora hanno fatto scattare il limite di
Let's Encrypt.

**Soluzione**: rimuovere `*.corradogizzi.it` dai domini del sito su Netlify. Il certificato
per `corradogizzi.it` + `www` non richiede DNS-01 e si rinnova da solo. Non era in alcun modo
collegato all'email di phishing ricevuta nei giorni precedenti: DNS, nameserver e
registrazione del dominio erano intatti.

---

## Recensioni Google

Due schede GBP, una per sede, ciascuna con il proprio link — **le recensioni sono per sede e
anche il ranking locale lo è**, quindi una recensione sulla scheda sbagliata è persa per
entrambe:

| Sede | Link recensione |
|---|---|
| Faenza (Le Cicogne) | `https://g.page/r/CeIRzQnYqAzXEBI/review` |
| Bologna (Life Clinic) | `https://g.page/r/CbRiT3xHBjk7EBI/review` |

**Faenza è già coperta**: il referto generato dall'EMR porta in calce un QR verso la scheda
di Faenza (`report_config.review_url`, con fallback scritto in
`emr-clinic/server/pdfGenerator.js`). Il campo è unico e non distingue la sede, ma **non è
un problema**: a Bologna il gestionale è quello del poliambulatorio, non l'EMR, quindi il
referto con QR esce solo a Faenza.

**Bologna no**: per quella sede esistono i bigliettini stampabili preparati il 6/9/2026 (A4,
8 per foglio, guide di taglio, QR verificati rileggendoli dal PDF a 300 dpi). Da stampare la
pagina 2. Il generatore non è nel repo: se serve rifarli, si rigenerano.

Tre regole emerse discutendone:

- **Mai incentivare** una recensione (sconti, omaggi): viola sia le regole di Google sia il
  codice deontologico.
- **Chiedere in modo neutro**, non "se è soddisfatto": il *review gating* è vietato da
  Google, e una distribuzione naturale con qualche 4 stelle è più credibile di un muro di
  5 stelle.
- **Il rischio vero è rispondere, non chiedere.** Rispondere confermando che la persona è un
  paziente, o citando qualunque dettaglio clinico, viola il segreto professionale — il
  Garante ha sanzionato esattamente questo schema in ambito sanitario. Ringraziamento
  generico, mai un dato clinico, soprattutto sotto una recensione negativa. Se è
  diffamatoria, se ne chiede la rimozione a Google.

---

## Google Business Profile — allineato

I nodi `Physician` di `index.html` e `ambulatori.html` dichiarano il cellulare
(349 1908892) per Faenza, come il GBP. Entrambe le schede puntano al sito.

Il 6/9/2026 corretta una discordanza: la scheda di Bologna dichiarava l'apertura alle 15:30,
il sito le 15:00. **Vale 15:00**, che è quando i pazienti vengono ricevuti — la visita la
iniziano gli ortottisti, Corrado arriva da Faenza verso le 15:30. Il suo orario di arrivo è
logistica interna, non un orario di apertura.

Gli orari vivono in **quattro** punti da tenere allineati: le tabelle di `ambulatori.html`,
gli `openingHoursSpecification` in `ambulatori.html` **e** in `index.html`, e le due schede
GBP.

---

## Immagini del blog

### Card di condivisione — `tools/card-condivisione.mjs`

Prima del 6/9/2026 ogni pagina del sito dichiarava lo stesso `og:image` (il ritratto): tre
articoli condivisi in una chat davano tre anteprime identiche, proprio nel momento in cui un
paziente ne sta raccomandando uno a qualcun altro.

Ora ogni post ha la sua card 1200×630 in `assets/og/<slug>.png`: titolo in Playfair sul navy
del sito, badge dell'etichetta, filo dorato, firma e simbolo del logo in filigrana. Non
ritrae nulla — compone il titolo, come la copertina di un libro.

```
node tools/card-condivisione.mjs            genera solo le card mancanti
node tools/card-condivisione.mjs --tutte    le rigenera tutte
```

**Non gira dentro `npm run build`**: servirebbe scaricare Chromium a ogni deploy su Netlify.
Si generano in locale e si committano come asset statici — cambiano solo quando cambia un
titolo. Richiede Playwright; se manca, lo script lo dice e si ferma senza rompere nulla.

Un articolo che dichiara `immagine: /assets/…` nel front matter usa quella al posto della
card, e il generatore lo salta.

### Illustrazioni anatomiche — in lavorazione da Corrado

Per le schede chirurgia/laser: Inkscape, Plain SVG con viewBox, testo convertito in curve
per l'HTML; PNG 300dpi ≥1200×900 per i PDF. È la parte più lenta del lavoro e procede al suo
ritmo.

**Quando saranno pronte serviranno due volte**: nelle schede cliniche e come immagine degli
articoli di blog corrispondenti, al posto della card tipografica. Deciso il 6/9/2026 di **non
aprire un secondo cantiere di immagini** per il blog e di **non usare foto stock**: su un
sito dove il blocco autore e i dati strutturati servono a segnalare autorevolezza, l'immagine
di repertorio rema contro. Le foto cliniche di occhi di pazienti aprirebbero inoltre un
problema di consenso (art. 9 GDPR).

---

## PWA "Le Mie Gocce" — in produzione dal 6/9/2026

Webapp per i promemoria dei colliri, servita da `/app/`, con cinque serverless function
(`netlify/functions/gocce-*.js`) e due dipendenze aggiunte al sito (`web-push`,
`@netlify/blobs`). Si consegna in ambulatorio: è in `Disallow` nel `robots.txt` perché una
pagina che chiede il permesso alle notifiche e che chiunque può aprire è un invito a
diffidare.

**Variabili d'ambiente richieste su Netlify**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT`. Senza, le funzioni si pubblicano ma falliscono a runtime — **da verificare**.

Il ramo `pwa-gocce` resta il posto dove continuare il lavoro; al 6/9 è interamente contenuto
in `main`.

---

## Bloccati su Corrado (non urgenti)

- **Video pazienti** — Bunny Stream non ancora attivato, riprese non iniziate. Gli script
  che il briefing dava per pronti (introduzione al glaucoma, aspetti ereditari, SLT) non
  sono né nel repo né su Drive: considerarli persi. I primi due argomenti sono ora coperti
  dagli articoli del blog.

---

## Strumenti interni — preventivi

Tutto in `strumenti/`, con una sola fonte per i prezzi:

- **`listino.js`** — **la fonte unica degli importi.** Lo leggono lo strumento interattivo,
  i due generatori e la risposta automatica: non esistono altri posti dove i prezzi siano
  scritti.
- **`preventivo.html`** — strumento interattivo: si apre con un doppio clic, funziona
  offline, si compila a sinistra e l'anteprima A4 si aggiorna a destra. «Stampa / Salva PDF»
  produce il documento senza il modulo.
- **`genera-listino.js`** — produce i due listini in PDF dallo stesso `listino.js`:
  `listino-segreteria-bologna-<data>.pdf` (solo Bologna, prezzi al paziente, da dare alla
  segreteria di Life Clinic) e `listino-completo-<data>.pdf` (entrambe le sedi, con quota
  di struttura e onorario — interno, non si diffonde). Uso:
  `node strumenti/genera-listino.js [cartella]`.
- **`verifica-listino.js`** — controlla che i `value` dei checkbox del modulo pubblico
  coincidano con i `nome` del listino. Gira dentro `npm run build`, quindi Netlify se ne
  accorge prima di pubblicare. Serve perché il disallineamento è silenzioso: il modulo
  funziona, la richiesta arriva, e la prestazione sparisce dall'email al paziente. È già
  successo con SLT, OCT, pachimetria e iridotomia.
- **`genera-preventivo.js`** — versione da riga di comando:

  ```
  node strumenti/genera-preventivo.js richiesta.json [cartella]
  ```

  Scrive un HTML autonomo e, se Playwright è disponibile, anche il PDF. Non duplica il
  documento: inietta `window.PRECOMPILATO` dentro `preventivo.html` e lascia che sia la
  pagina a renderizzare, così le due strade non possono divergere nell'aspetto.

**Nessuno di questi file è servito in produzione**: `netlify.toml` risponde 404 su
`/strumenti/*`. Se quella regola sparisse, il listino diventerebbe pubblicamente leggibile.

### Combinazione "Visita + controllo tono successivo"

Aggiunta il 6/9/2026, 180 € a Bologna e 150 € a Faenza — cioè la visita più 30 €, metà dei
60 € della misurazione isolata. Risolve un imbarazzo concreto: quando in visita si avvia o
si cambia una terapia e serve rivedere il paziente entro due mesi per il solo tono, chiedere
il pagamento a distanza ravvicinata da una visita appena pagata è sgradevole. Pagandolo in
anticipo insieme alla visita, e **dichiarandolo esplicitamente in quel momento**, il problema
sparisce: non è più una richiesta a sorpresa ma l'esecuzione di un accordo.

È marcata `soloInterno`: la applica Corrado dal preventivo compilato in visita, non è
selezionabile dal modulo pubblico. `verifica-listino.js` riconosce le combinazioni interne
come caso legittimo e non le segnala più come irraggiungibili.

**Vale una volta per episodio di titolazione.** Se al controllo il bersaglio non è raggiunto
e serve un altro giro, si passa a una vera visita di controllo a tariffa piena — anche
perché due aggiustamenti di seguito sul solo dato pressorio sono clinicamente meno solidi.
Lo sconto è un'eccezione dichiarata una volta, non una regola ricorrente.

### Risposta automatica dal sito

`netlify/functions/submission-created.js` risponde da sola alle richieste inviate dal
modulo `/richiedi-preventivo/`. Netlify invoca la funzione a ogni invio di form; lei filtra
sul solo form `richiesta-preventivo` e ignora gli altri. Manda email vere dal 24/8/2026.

Flusso: modulo → funzione → email al paziente da `info@corradogizzi.it`, con copia **in
Ccn** a Corrado (non in Cc: sarebbe visibile al paziente).

| Variabile | Valore |
|---|---|
| `SMTP_HOST` | server SMTP della casella, es. `smtps.aruba.it` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `info@corradogizzi.it` |
| `SMTP_PASS` | password della casella |
| `COPIA_A` | facoltativa, indirizzo in copia (default: `SMTP_USER`) |
| `PREVENTIVI_OFF` | facoltativa, `1` sospende gli invii lasciando i log |

`PREVENTIVI_OFF=1` è l'interruttore da usare se qualcosa va storto: ferma gli invii senza
dover ridistribuire il sito.

---

## Idee valutate e messe in standby

- **Banner "date extra" in `prenota.html`**: discusso il 23/8/2026. Corrado edita un file,
  il sito mostra un banner con le date aggiuntive di ambulatorio, che sparisce da solo dal
  giorno dopo. Tecnicamente richiede JS lato client (il sito è statico, nessun processo
  gira a mezzanotte) e — se si vuole editare il file senza spendere un deploy di produzione
  a ogni data — una fonte esterna a Netlify, perché Netlify fattura per deploy, non per
  quanto è piccola la modifica.

  **Deciso di rimandare**: le date extra si gestiscono telefonicamente tramite la segreteria.
  Dal 29/8 `prenota.html` lo dice esplicitamente in un riquadro sopra il calendario. Se in
  futuro diventano frequenti abbastanza da giustificare il lavoro, riprendere da qui invece
  di ridiscutere l'architettura da capo.

---

## Debito tecnico noto

- **~~`prenota.html` senza `action`~~ (risolto il 6/9/2026)**: il form non aveva `action`,
  quindi dopo l'invio Netlify mostrava la propria schermata generica mentre `grazie.html`,
  già stilata, non era collegata a nulla. Ora punta a `/grazie.html`. Nota: Netlify riscrive
  il tag del form in post-processing (virgolette singole, attributi riordinati, `.html`
  tolto) e serve la pagina come `/grazie` — è normale, non è un errore.
- **~~File interni serviti in produzione~~ (risolto il 18/8/2026)**: `publish = "."` pubblica
  l'intera radice del repo, e `/CLAUDE.md`, `/package.json`, `/eleventy.config.js`
  rispondevano 200. Ora `netlify.toml` li blocca con un 404, insieme a `/strumenti/*` e
  `/tools/*`. **Prima di aggiungere un file al repo, chiedersi se possa essere servito**: la
  radice è pubblica per impostazione predefinita.
- **Upload referti nel modulo preventivo**: escluso di proposito. Caricare documentazione
  clinica significa trattare categorie particolari di dati (art. 9 GDPR). La privacy policy
  è stata estesa per coprire i dati sanitari conferiti *nelle note*, ma prima di abilitare
  l'upload serve una revisione da parte di un consulente privacy.
- **DMARC decorativo**: il record è `p=none` senza indirizzo per i rapporti, quindi non
  applica nulla e non raccoglie niente. Irrilevante finché le email dei preventivi arrivano,
  ma è lì.

---

## Flusso di lavoro e crediti

```
ramo "revisione"  →  https://revisione--corrado-gizzi.netlify.app  →  gratis
      ↓  solo a blocco approvato, con conferma esplicita di Corrado
main              →  https://corradogizzi.it                       →  15 crediti
```

Ciclo di fatturazione Netlify **dal 2 di ogni mese all'1 del successivo**, 300 crediti a
ciclo: segue l'anniversario di creazione del team, non il mese di calendario.

Un deploy scatta a ogni **push**, non a ogni commit: più merge in un solo push costano un
deploy solo. È così che il 6/9 sono andati in produzione insieme il lavoro sul sito e la PWA.
