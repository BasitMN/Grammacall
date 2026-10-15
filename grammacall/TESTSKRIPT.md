# Testskript – GrammaCall

Kör hela skriptet **efter varje ändring av appen**, efter en
**Android-uppdatering** och på **varje ny enhet**. Det tar ungefär 15 minuter.

Du behöver:
- **Telefon A** – grammas telefon med appen.
- **Telefon B** – en telefon vars nummer finns **på hemskärmen** i appen.
- **Telefon C** – en telefon vars nummer **inte** finns i appen (för de
  negativa testerna). Saknas telefon C: stäng tillfälligt av "Svara
  automatiskt" och använd telefon B där det står C, men kom ihåg att slå på
  den igen (steg 33).

Markera varje steg: ✅ som förväntat, ❌ avvikelse (skriv vad som hände).

---

## A. Grundläge

| # | Gör | Förväntat |
|---|---|---|
| 1 | Starta om telefon A. | Telefonen startar direkt i appens hemskärm med bilderna. |
| 2 | Titta på hemskärmen. | Klocka och svenskt datum överst. Bilderna fyller skärmen. Namnen syns stort. Ingen engelsk text. |
| 3 | Tryck på hemknappen. | Ingenting byts – du är kvar på bilderna. |
| 4 | Svep bakåt (tillbaka-gest). | Ingenting händer. Appen stängs inte. |
| 5 | Öppna inställningarna: håll kugghjulet ⚙ uppe till höger tills nedräkningen 5–1 är klar, skriv PIN. | Inställningar öppnas. Under **TELEFONEN** står allt **Ja**. |
| 6 | Skriv fel PIN en gång (efter att ha låst). | "Fel kod, försök igen". Inställningarna öppnas inte. |
| 7 | Tryck kort på kugghjulet, och håll det bara 2 s. | Ingenting händer (nedräkningen avbryts när du släpper). |

## B. Ringa ut

| # | Gör | Förväntat |
|---|---|---|
| 8 | Tryck på bilden för telefon B. | Inom en bråkdel av en sekund: "Ringer *namn*", nedräkning 5, stor röd AVBRYT. Rösten säger "جاري الاتصال بـ …" på arabiska. |
| 9 | Tryck **AVBRYT** innan nedräkningen är slut. | Tillbaka till bilderna. **Inget samtal** till telefon B. |
| 10 | Tryck på bilden igen, svep bakåt under nedräkningen. | Tillbaka till bilderna. Inget samtal. |
| 11 | Tryck på bilden och vänta. | Efter 5 s ringer telefon B. Skärmen visar namn, foto, "Ringer upp…", **LÄGG PÅ**. |
| 12 | Svara på telefon B. | Telefon A visar "Ni pratar nu · 0:0x". **Högtalare på** (grön), ljudet hörs högt. |
| 13 | Tryck på **Högtalare på**. | Byter till "Högtalare av", ljudet går till luren. Tryck igen → på. |
| 14 | Tryck **LÄGG PÅ**. | Samtalet avslutas. Telefon A går tillbaka till bilderna av sig själv. |

## C. Ta emot – person på hemskärmen

| # | Gör | Förväntat |
|---|---|---|
| 15 | Lås telefon A (skärmen av). Ring från telefon B. | Skärmen tänds. Grön rad **SVARAR AUTOMATISKT**, foto, "*namn* ringer", "Du kopplas fram om 2 sekunder". Rösten säger "مكالمة من …". |
| 16 | Rör ingenting. | Efter ca 2 s besvaras samtalet. Högtalare på, full volym. Visar "Ni pratar nu". |
| 17 | Lägg på från telefon B. | Telefon A går tillbaka till bilderna. |
| 18 | Ring igen från B, tryck **SVARA NU** direkt. | Besvaras direkt, högtalare på. Lägg på. |

## D. Ta emot – okänt nummer (negativa tester)

| # | Gör | Förväntat |
|---|---|---|
| 19 | Ring från **telefon C**. Rör ingenting i 20 sekunder. | Telefonen ringer som vanligt. Skärmen visar numret, "Okänt nummer ringer", **SVARA** och **AVVISA**. **Samtalet besvaras INTE automatiskt.** |
| 20 | Ring från C igen och tryck **AVVISA**. | Samtalet avvisas. Tillbaka till bilderna. |
| 21 | Ring från C igen och tryck **SVARA**. | Samtalet kopplas. Högtalare på. Lägg på. |
| 22 | Ring från ett **dolt nummer** om möjligt. | Ringer som vanligt, besvaras inte automatiskt. |

## E. Inställningar

| # | Gör | Förväntat |
|---|---|---|
| 23 | Lägg till en person (+ Lägg till kontakt). Skriv arabiskt namn, tryck ▶ Lyssna. | Arabisk uppläsning av namnet. Efter Spara syns personen på hemskärmen med foto. |
| 24 | Flytta personen med ▲. | Ordningen ändras på hemskärmen. |
| 25 | Ta bort personen igen. | Försvinner från hemskärmen. |
| 26 | Öppna personen för telefon B (**Byt**), stäng av **Svara automatiskt efter 2 sekunder**, Spara. Ring från B. | Listan visar "ringer". Samtalet ringer med SVARA/AVVISA och besvaras **inte** automatiskt. Slå på igen. |
| 26b | Stäng av huvudbrytaren **Autosvar på**. Ring från B. | Besvaras inte automatiskt, oavsett personens brytare. Slå på igen. |
| 26c | Sänk mediavolymen till noll. Tryck på en bild. | Den arabiska uppläsningen hörs ändå tydligt (volymen höjs automatiskt). Tryck AVBRYT. |
| 27 | Lås inställningarna med **Lås**. | Tillbaka till bilderna. |
| 28 | Öppna inställningarna och tryck hemknappen. | Inställningarna låses; bilderna visas. |

## F. Skydd mot fel

| # | Gör | Förväntat |
|---|---|---|
| 29 | Sätt telefonen på laddning, lämna på hemskärmen i 5 min. | Skärmen förblir tänd. |
| 30 | (Bara med dator och adb) Kör `adb shell cmd role add-role-holder android.app.role.DIALER com.samsung.android.dialer`. Vänta 1 min med skärmen tänd. | Notis **"GrammaCall tar inte emot samtal"**. TELEFONEN visar rött **Nej** för standardapp. |
| 31 | Tryck **Gör till standardapp för telefon** → GrammaCall. | Status blir **Ja**. Notisen försvinner inom en minut. |
| 32 | Ring ut och ta emot ett samtal igen (steg 11 och 15). | Fungerar som tidigare. |

## G. Avslutning

| # | Gör | Förväntat |
|---|---|---|
| 33 | Kontrollera att **Svara automatiskt** och **Högtalare** är på igen. | Båda gröna. |
| 34 | Lås inställningarna. | Telefonen visar bilderna. Klar. |

---

Datum: ________  Enhet/Android-version: ______________________

Testat av: ________  Avvikelser: _______________________________
