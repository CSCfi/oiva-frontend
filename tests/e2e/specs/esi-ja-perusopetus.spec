# Esi- ja perusopetus

* Siirry osoitteeseen "localhost"
* Log in as "oiva-essi"

## Pääsy tallennetulle hakulomakkeelle - kirjautunut/kirjautumaton käyttäjä

* Klikkaa päänavigaation linkkiä "Järjestämis- ja ylläpitämisluvat"
* Siirry koulutusmuodon "Esi- ja perusopetus" pääsivulle
* Siirry koulutusmuodon avoimiin asioihin sivulla olevan linkin "Asianhallinta" kautta
* Klikkaa elementtiä, jossa on teksti "Luo uusi asia"
* Varmista, että uuden asian esidialogi aukesi otsikolla "Luo uusi asia"
* Klikkaa elementtiä, jossa on teksti "Hae koulutuksen järjestäjää (Y-tunnus, OID, Virastotunnus)"
* Kirjoita kenttään, jonka tyyppi on "text" arvo "0162193-3"
* Klikkaa esidialogin hakupainiketta
* Klikkaa elementtiä, jossa on teksti "Hyväksy"
* Varmista, että hakulomake on avattu otsikolla "Lappeenrannan kaupunki"
* Assert if text exists "Päätöksen valmistelu: Järjestämisluvan muutos"
* Kirjoita kenttään, jonka parametri "id" on "paatoksentiedot.asianumero.A" arvo "VN/0000/0001"
* Klikkaa elementtiä, jossa on teksti "TALLENNA LUONNOS"
* Varmista, että hakulomake on avattu otsikolla "Lappeenrannan kaupunki"
* Päivitä selainikkuna
* Varmista, että hakulomake on avattu otsikolla "Lappeenrannan kaupunki"
* Klikkaa elementtiä, jossa on teksti "esiopetus"
* Lomakeoperaatio "perusopetus" valitse "perusopetus"
* Lomakeoperaatio "VALITSE KUNNAT" valitse "VALITSE KUNNAT"
* Kirjoita kenttään, jonka parametri "id" on "maakunnat-ja-kunnat-filter" arvo "Kemi"
* Paina näppäintä "Enter"
* Kirjoita kenttään, jonka parametri "id" on "maakunnat-ja-kunnat-filter" arvo "Oulu"
* Paina näppäintä "Enter"
* Kirjoita kenttään, jonka parametri "id" on "maakunnat-ja-kunnat-filter" arvo "Vaasa"
* Paina näppäintä "Enter"
* Scroll to text "Peruuta"
* Klikkaa elementtiä, jossa on teksti "Hyväksy"
* Scroll to text "Rajoitteet"
* Klikkaa elementtiä, jonka "id" sisältää "rajoitteenLisaaminen.painike"
* Valitse rajoituksen "kohde-0" kohteeksi "Kunnat, joissa opetusta järjestetään"
* Kirjoita kenttään, jonka parametri "id" on "toimintaalue-0" arvo "Oulu"
* Vieritä alas "100"
* Valitse asetuksen kohde "asetuksenKohde-toimintaalue-0" kohteeksi "Opetus, jota lupa koskee"
* Valitse asetuksen tarkennin "asetuksenTarkennin-toimintaalue-0" kohteeksi "esiopetus"
* Klikkaa elementtiä, jossa on teksti "HYVÄKSY"
* Klikkaa elementtiä, jossa on teksti "TALLENNA LUONNOS"
* Varmista, ettei auki olevalle hakemukselle pääse kirjautumattomana
