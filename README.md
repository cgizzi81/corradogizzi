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
├── netlify.toml        ← Configurazione hosting Netlify
├── css/
│   └── style.css       ← Tutto il CSS (colori, font, layout)
├── js/
│   ├── main.js         ← Navbar, scroll, accordion, form
│   └── layout.js       ← Nav e footer (condivisi tra pagine)
└── assets/
    ├── logo-symbol.svg ← Logo grafico (senza testo)
    ├── logo.svg        ← Logo completo
    ├── foto.jpg        ← Foto professionale
    ├── brochure-glaucoma.pdf    ← DA AGGIUNGERE
    ├── brochure-chirurgia.pdf   ← DA AGGIUNGERE
    └── brochure-laser.pdf       ← DA AGGIUNGERE
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
- `--gold: #b8962e` → colore oro (accenti, bottoni)
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

1. Metti i PDF nella cartella `assets/` con questi nomi esatti:
   - `brochure-glaucoma.pdf`
   - `brochure-chirurgia.pdf`
   - `brochure-laser.pdf`
2. I link nella pagina "Info Pazienti" funzioneranno automaticamente

---

## Attivare le prenotazioni online (Calendly)

1. Crea account gratuito su https://calendly.com
2. Collega Google Calendar nelle impostazioni
3. Crea due "Event Types": "Visita Bologna" e "Visita Faenza"
4. Apri `prenota.html` con VSCode
5. Cerca il commento `CALENDLY — ISTRUZIONI`
6. Sostituisci `TUO-USERNAME` con il tuo username Calendly
7. Decommenta il blocco widget (rimuovi `<!--` e `-->`)
8. Cancella o commenta il blocco `PLACEHOLDER`

---

## Pubblicare su Netlify (passo per passo)

1. Vai su https://netlify.com e crea un account gratuito
2. Clicca **Sites → Add new site → Deploy manually**
3. Trascina l'intera cartella `corradogizzi` nella finestra del browser
4. Il sito è online in 30 secondi con un URL temporaneo tipo `amazing-name.netlify.app`

**Per collegare il dominio corradogizzi.it:**

5. In Netlify: **Domain settings → Add custom domain** → scrivi `corradogizzi.it`
6. Accedi al pannello Aruba, vai in **Gestione DNS** del dominio
7. Cambia i nameserver con questi quattro:
   ```
   dns1.p04.nsone.net
   dns2.p04.nsone.net
   dns3.p04.nsone.net
   dns4.p04.nsone.net
   ```
8. Attendi 24-48 ore per la propagazione — il sito sarà live con HTTPS automatico

**Per ricevere le email del form di contatto:**
- In Netlify: **Site → Forms** → clicca sul form "contatto"
- **Form notifications → Add notification → Email notification**
- Inserisci `info@corradogizzi.it`

---

## Condividere il sito in anteprima privata

Dopo il deploy su Netlify, l'URL temporaneo (es. `amazing-name.netlify.app`) è
già accessibile a chiunque tu lo invii ma non è indicizzato da Google.
Condividilo liberamente con parenti e amici per raccogliere feedback
prima di collegare il dominio definitivo.

---

## Aggiornare il sito dopo modifiche

Ogni volta che modifichi dei file e vuoi aggiornare il sito online:
1. Vai su Netlify → il tuo sito → **Deploys**
2. Clicca **Deploy manually** e trascina di nuovo la cartella aggiornata

In alternativa, collega Netlify a un repository GitHub per aggiornamenti automatici
ad ogni salvataggio (richiede conoscenza base di Git).
