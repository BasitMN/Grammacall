# GrammaCall – drift och skötsel

Den här guiden är för familjen. Den ska gå att följa även om Basit inte är
tillgänglig. Inga förkunskaper krävs, men du behöver kunna hantera en
Android-telefon.

> **Viktigt:** Appen är **inget trygghetslarm**. Moster har ett separat larm
> från kommunen för nödsituationer.

---

## 1. Vad appen gör

- Hela skärmen är stora bilder på mosters viktigaste personer (högst 9).
- Hon trycker på en bild → skärmen visar "Ringer …" och räknar ner 5 sekunder
  (stor röd **AVBRYT** om hon tryckte fel) → ett vanligt telefonsamtal rings
  upp, på högtalare och full volym.
- En röst säger på **arabiska** vem hon ringer, och vem som ringer henne.
  All text på skärmen är på svenska.
- Ringer någon av personerna på hemskärmen till henne **svarar telefonen själv**
  efter 2 sekunder, på högtalare.
- Alla andra nummer ringer som vanligt och besvaras **aldrig** automatiskt.
- När samtalet är slut går telefonen tillbaka till bilderna av sig själv.
- Appen gäller bara **vanliga telefonsamtal** – inte imo, WhatsApp eller
  liknande.

---

## 2. Så kommer du in i inställningarna

1. Uppe till höger på hemskärmen, till höger om klockan, finns ett litet grått
   **kugghjul ⚙**. Håll fingret på det. En nedräkning **5 – 4 – 3 – 2 – 1**
   visas. Släpp inte förrän den är klar. (Ett vanligt tryck gör ingenting.)
2. En mörk sifferruta visas. Skriv **PIN-koden** (4 siffror).
3. Inställningarna öppnas.

Glömt PIN-koden? Se avsnitt 7.

Inställningarna låser sig själva när du trycker **Lås** eller när telefonen
lämnar appen.

---

## 3. Lägga till, ändra eller ta bort en person

### Lägga till
1. Öppna inställningarna (avsnitt 2).
2. Tryck **+ Lägg till kontakt**. Första gången frågar telefonen om lov att
   läsa kontakter – tryck **Tillåt**.
3. Välj personen i listan. Personen måste finnas sparad i telefonens kontakter.
4. Kontrollera:
   - **Namn på hemskärmen** – kort, gärna bara förnamn (max 14 tecken).
   - **Namn på arabiska (för uppläsning)** – skriv namnet med arabiska
     bokstäver, t.ex. فاطمة. Tryck **▶ Lyssna** och hör att det låter rätt.
   - **Foto** – kommer från kontakten. Har kontakten inget foto, tryck
     **Välj foto** och välj ett ur galleriet. En bild med tydligt ansikte är bäst.
   - **Nummer** – har personen flera nummer, välj det hen svarar på.
5. Tryck **Spara**. (Knappen är grå tills både namn och nummer finns.)

### Ändra
Tryck **Byt** bredvid personen. Där kan du ändra namn, foto, nummer, eller
välja en helt annan kontakt för den platsen.

### Ordning på bilderna
Använd **▲ ▼** i listan. Plats 1 är uppe till vänster.

### Ta bort
Tryck **Byt** → **Ta bort från hemskärmen**.

### Antal personer
1–3 personer visas som stora bilder under varandra, 4 som 2×2, 5–6 som 2×3,
7–9 som 3×3. Färre personer = större bilder. Fyra är lagom för de flesta.

---

## 4. När något slutar fungera

Öppna först inställningarna och titta under **TELEFONEN**. Allt ska stå **Ja**
i grönt. Står något **Nej** i rött finns en knapp under för att rätta det.

| Problem | Trolig orsak | Gör så här |
|---|---|---|
| Notis: **"GrammaCall tar inte emot samtal"** | Någon har öppnat Samsungs vanliga Telefon-app, som då tog tillbaka rollen som telefonapp. | Inställningar → **Gör till standardapp för telefon** → välj GrammaCall. |
| Hon trycker på en bild men inget samtal går ut | Samma som ovan. | Samma som ovan. |
| Telefonen svarar inte själv | Samma som ovan, eller **Svara automatiskt** är avstängt, eller numret i appen stämmer inte med det personen ringer från. | Kontrollera TELEFONEN-statusen och brytaren under AUTOSVAR. Kontrollera numret under **Byt**. |
| Ingen högtalare | **Högtalare och max volym i alla samtal** är avstängd. | Slå på den under AUTOSVAR. |
| Ingen arabisk röst | Arabisk röst saknas. | Androids inställningar → **Allmän hantering → Text till tal** → installera arabiska. |
| Hemknappen leder till Samsungs vanliga skärm | Appen är inte längre hemskärm. | Inställningar → **Gör till hemskärm**. |
| Appen verkar stängas av sig själv | Batterisparläge. | Inställningar → **Stäng av batterisparläge för appen**. |
| Skärmen släcks på laddaren | Normalt bara om laddningen är pausad. | Inget att göra; den tänds vid nästa samtal. |
| Ringer folk som inte ska få ringa? | Appen blockerar ingen; okända nummer ringer som vanligt. | – |

**Öppna aldrig Samsungs Telefon-app på mosters telefon.** Den tar tillbaka
rollen som telefonapp och då slutar autosvar och utgående samtal att fungera
(tills det rättas enligt tabellen).

---

## 5. Efter en Android-uppdatering

Uppdateringar kan återställa standardappar eller behörigheter.

1. Öppna inställningarna och kontrollera att allt under **TELEFONEN** är **Ja**.
2. Kör de korta testerna i [`TESTSKRIPT.md`](TESTSKRIPT.md), åtminstone:
   ett utgående samtal, ett inkommande från en person på hemskärmen och ett
   från ett okänt nummer.
3. Om Play Protect har varnat eller stängt av appen: öppna **Play Butik →
   profilbilden → Play Protect**, och tillåt GrammaCall igen.

---

## 6. Installera på en ny telefon eller surfplatta

### Krav
- **Android 12 eller nyare**, helst 14 eller nyare. (Inställningar → Om telefonen → Programvaruinformation.) På äldre Android går appen inte att installera.
- Den måste kunna ringa **vanliga telefonsamtal** med SIM-kort. Många
  surfplattor med SIM kan bara använda mobildata – på dem fungerar appen inte.
- Telefonnumret som moster har ska sitta i den.

### Steg
1. **Installera appen.** Kopiera filen `app-release.apk` till telefonen (t.ex.
   via USB, e-post eller Google Drive) och öppna den. Tillåt installation från
   den källan när telefonen frågar. Om **Play Protect** varnar: tryck
   **Mer information → Installera ändå**.
2. **Öppna GrammaCall.** Hemskärmen säger "Inga kontakter ännu".
3. **Öppna inställningarna** (avsnitt 2). Första gången väljer du en ny
   PIN-kod och skriver den två gånger. Skriv upp koden på ett säkert ställe.
4. Telefonen frågar om **aviseringar** – tryck **Tillåt**.
   *Gör detta före nästa steg.* Annars kan varningsnotisen sluta fungera.
5. Under TELEFONEN, tryck i tur och ordning:
   - **Gör till standardapp för telefon** → GrammaCall.
     Kommer rutan **"App was denied access" / "Appen nekades åtkomst"**?
     Det är Androids skydd för appar som installerats från en fil. Tryck
     **Stäng**, öppna Androids **Inställningar → Appar → GrammaCall →
     ⋮ (tre prickar uppe till höger) → Tillåt begränsade inställningar**,
     bekräfta, och försök igen. (Behövs inte om appen installerades med
     dator och `adb install`.)
   - **Gör till hemskärm** → GrammaCall.
   - **Stäng av batterisparläge för appen** → Tillåt.
6. **Lägg till personerna** (avsnitt 3), med arabiska namn och bra foton.
7. Kontrollera att **Arabisk röst** står **Ja**, annars installera den (se tabellen).
8. **Telefonens egna inställningar:**
   - Ringsignalens volym: max.
   - **Stör ej**: avstängt.
   - Skärmlås: överväg **Ingen** (Inställningar → Låsskärm → Skärmlåstyp), så
     att moster aldrig behöver låsa upp. Nackdelen är att vem som helst kan
     använda telefonen.
9. **Kör hela [`TESTSKRIPT.md`](TESTSKRIPT.md).** Var noga med att ett
   okänt nummer *inte* besvaras automatiskt.
10. Starta om telefonen en gång och kontrollera att den startar direkt i
    bilderna.

### Uppdatera appen
Installera den nya `app-release.apk` ovanpå den gamla på samma sätt.
Personer, foton och PIN-kod finns kvar.

---

## 7. Övrigt

**Glömt PIN-koden:** Den går inte att återställa i appen. Androids
inställningar → Appar → GrammaCall → Lagring → **Rensa data**. Då
försvinner även personerna och allt måste göras om från steg 3 i avsnitt 6.

**Ta tillbaka telefonen till normalt läge** (t.ex. om appen ska tas bort):
1. Inställningar i appen → **Byt till telefonens vanliga hemskärm** → välj
   Samsungs (eller tillverkarens) hemskärm.
2. Androids inställningar → Appar → **Standardappar → Telefonapp** → välj
   tillverkarens Telefon-app.
3. Avinstallera GrammaCall.

**Teknisk dokumentation** (engelska) finns i [`README.md`](README.md).
