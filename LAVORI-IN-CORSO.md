# Lavori in corso — corradogizzi.it

Aggiornato al **6 agosto 2026**.

Elenco dei punti aperti, diviso per chi deve muoversi. Le voci si spuntano
man mano; quando una è chiusa si toglie da qui.

---

## 🔴 Serve Corrado — bloccano il resto

### 1. Revisionare le quattro bozze
Sono online ma **non indicizzate**: hanno `noindex`, quindi Google non le vede.
Si aprono ai motori solo dopo la validazione clinica.

- [ ] `corradogizzi.it/chirurgia/trabeculectomia.html` ← **priorità: sblocca sei pagine**
- [ ] `corradogizzi.it/chirurgia/`
- [ ] `corradogizzi.it/laser/`
- [ ] `corradogizzi.it/blog/glaucoma-ereditario/`

La trabeculectomia è il modello su cui verranno replicate le altre sei schede
cliniche: correggerla adesso vale sei volte.

### 2. Google Business Profile
Due schede, una per città, nome proposto "Dr. Corrado Gizzi – Specialista in Glaucoma".

Nodo aperto: Corrado non è proprietario degli ambulatori, quindi va capito come
verificare le schede senza cartolina, o coordinarsi con le due reception.

**È il singolo punto a più alto ritorno dell'intero progetto** e l'unico dove il
lavoro tecnico non può sostituirsi a una telefonata.

### 3. Inviare la sitemap a Search Console
`https://corradogizzi.it/sitemap.xml` — due minuti, accelera l'indicizzazione di
tutto il resto.

---

## 🟡 Serve Corrado — non bloccano, ma senza non si prosegue

- [ ] **Illustrazioni SVG anatomiche** (Inkscape, Plain SVG con viewBox, testo in
      curve; PNG 300 dpi min. 1200×900 per i PDF). Le pagine chirurgia sono oggi
      tutto testo: le illustrazioni sono ciò che le distinguerebbe da qualsiasi
      altro sito di oculistica.
- [ ] **Attivare Bunny Stream** (account, library, chiavi) — europeo, GDPR-compliant
- [ ] **Girare i video**: tre script già pronti (introduzione al glaucoma, aspetti
      ereditari, laser SLT), mai diventati riprese
- [ ] **Brochure PDF**: fornire i contenuti, oppure autorizzare la generazione
      automatica a partire dalle pagine chirurgia
- [ ] **Numeri clinici**: percentuali di successo, durate di follow-up, moltiplicatori
      di rischio sono stati volutamente omessi. Se servono, vanno forniti.
- [ ] **Backlink di autorità** — relazioni, non codice
- [ ] **Decisione sul cellulare personale**: `+39 335 681 5186` era pubblicato nei
      dati strutturati, ora non lo è più. Va rimesso o resta fuori?

---

## 🟢 Tocca a Claude — appena sbloccato

- [ ] Sei schede cliniche: impianti drenanti, MIGS, MIBS, SLT, iridotomia YAG,
      ciclofotocoagulazione a diodo *(dopo la revisione della trabeculectomia)*
- [ ] Tre landing geografiche: Bologna, Faenza, Emilia-Romagna
- [ ] Altri articoli del blog
- [ ] Integrazione delle illustrazioni nelle pagine e nei PDF
- [ ] Player Bunny Stream nelle pagine pazienti
- [ ] Rimozione dei `noindex` e ingresso in `sitemap.xml` di ciò che viene approvato
- [ ] Immagine dedicata per le anteprime social (1200×630): oggi si usa la foto
      del ritratto, che non è del formato ideale

---

## ✅ Fatto

- SEO tecnica on-page su tutte le pagine: title, description, canonical,
  Open Graph, dominio unificato senza `www`
- Dati strutturati: `Person`, `WebSite`, due `Physician` (una per sede) con
  coordinate e orari, `BreadcrumbList`, `MedicalWebPage`, `FAQPage`, `ProfilePage`
- `robots.txt` e `sitemap.xml`, che non esistevano
- Accessibilità: contrasti a norma WCAG, focus da tastiera, `aria-expanded`
  su menu e FAQ
- Foto ottimizzata: da 1,8 MB (era un PNG rinominato) a 53 KB, più WebP da 35 KB
- Bug corretti: telefono di Faenza non chiamabile, tre link a PDF inesistenti
  che davano 404, anno del footer fisso al 2025
- Orari reali di Faenza e Bologna, che prima erano sbagliati e invertiti
- Sezioni `chirurgia/` e `laser/` con menu a tendina
- Blog con Eleventy, build su Netlify, flusso di bozze
- Documentazione: `CLAUDE.md` e `README.md` riscritti
