/* globals gauge*/
"use strict";
const {
  $,
  button,
  goto,
  click,
  closeBrowser,
  currentURL,
  focus,
  link,
  openBrowser,
  scrollTo,
  setViewPort,
  text,
  textBox,
  write,
  reload
} = require("taiko");
const chai = require("chai");
require("dotenv").config();
const assert = chai.assert;
const headless = process.env.headless_chrome.toLowerCase() === "true";

beforeSuite(async () => {
  await openBrowser({ args: ["--window-size=1600,900"], headless });
});

afterSuite(async () => {
  await closeBrowser();
});

step("Siirry osoitteeseen <url>", async url => {
  try {
    await goto(url);
  } catch (e) {
    await click($("#details-button"));
    await click($("#proceed-link"));
  }
});

step("Log in as <username>", async username => {
  await click("Kirjaudu sisään");
  await write(username);
  await focus(textBox({ type: "password" }));
  await write(process.env[username]);
  await click(button({ type: "submit" }));
  assert.ok(await text("Kirjaudu ulos").exists());
});

step("Log out", async () => {
  try {
    await click(link({ href: "/cas-logout" }));
  } catch (e) {
    console.error(e);
  }
});

step("Jarjestamislupa", async () => {
  try {
    click("Järjestämislupa");
    assert.ok(await text("Tutkinnot ja koulutukset").exists());
  } catch (e) {
    console.error(e);
  }
});

step("Avaa uusi muutospyyntolomake", async () => {
  try {
    await click(link({ class: "link-to-own-organisation" }));
    await click(link({ id: "jarjestamislupa-asiat" }));
    await click($("button.newHakemus"));
    await text("Uusi hakemus").exists();
  } catch (e) {
    console.error(e);
  }
});

step("Klikkaa elementtiä, jossa on teksti <teksti>", async teksti => {
  try {
    await click(teksti);
  } catch (e) {
    console.error(e);
  }
});

step(
  "Varmista, että uuden asian esidialogi aukesi otsikolla <teksti>",
  async teksti => {
    try {
      assert.equal(await $("h6").text(), teksti);
    } catch (e) {
      console.error(e);
    }
  }
);

step("Edellinen sivu", async () => {
  try {
    await click($("button.previous"));
  } catch (e) {
    console.error(e);
  }
});

step("Seuraava sivu", async () => {
  try {
    await click($("button.next"));
  } catch (e) {
    console.error(e);
  }
});

step("Tallenna hakemus", async () => {
  try {
    await click($("button.save"));
  } catch (e) {
    console.error(e);
  }
});

step("Lataa sivu uudelleen", async () => {
  try {
    await reload(currentURL());
  } catch (e) {
    console.error(e);
  }
});

step("Tarkista, että ollaan sivulla <pageNumber>", async pageNumber => {
  try {
    assert.include(await currentURL(), `uusi/${pageNumber}`);
  } catch (e) {
    console.error(e);
  }
});

step("Lomakeoperaatio <sectionId> valitse <item>", async (sectionId, item) => {
  try {
    //await scrollDown($(".MuiDialogContent-root"));
    await scrollTo(item);
    await click(item);
  } catch (e) {
    console.error(e);
  }
});

step("Sulje lomake", async () => {
  try {
    await click($('button[aria-label="Close"]'));
    await click("Kyllä");
    assert.notInclude(await currentURL(), "hakemukset-ja-paatokset");
  } catch (e) {
    console.error(e);
  }
});

step("Assert if text exists <string>", async string => {
  try {
    assert.ok(await text(string).exists());
  } catch (e) {
    console.error(e);
  }
});

step("Klikkaa päänavigaation linkkiä <linkinTeksti>", async linkinTeksti => {
  await click(linkinTeksti);
  assert.ok(await text(linkinTeksti).exists());
  assert.equal(await $("h1").text(), linkinTeksti);
});

step(
  "Siirry koulutusmuodon <koulutusmuoto> pääsivulle",
  async koulutusmuoto => {
    await click(koulutusmuoto);
    assert.ok(await $("h1").exists());
    assert.equal(await $("h1").text(), koulutusmuoto);
  }
);

step(
  "Siirry koulutusmuodon avoimiin asioihin sivulla olevan linkin <linkinTeksti> kautta",
  async linkinTeksti => {
    await click(linkinTeksti);
    assert.ok(await $("h1").exists());
    assert.equal(await $("h1").text(), linkinTeksti);
  }
);

step(
  "Siirry päätettyihin asioihin klikkaamalla asianhallintasivun välilehteä <tabText>",
  async tabText => {
    await click(tabText);
  }
);

step("Tarkista, että urlissa lukee <teksti>", async teksti => {
  assert.include(await currentURL(), teksti, "URL OK");
});

step("Vaihda kieleksi <locale>", async locale => {
  await click(locale);
});

step("Navigate to Lukiokoulutus", async () => {
  click(link({ href: "https://localhost:4433/lukiokoulutus" }));
  assert.ok(await text("Tulossa vuoden 2020 aikana").exists());
});

step("Navigate to Vapaa sivistystyö", async () => {
  click(link({ href: "/vapaa-sivistystyo" }));
  assert.ok(await text("Tulossa vuoden 2020 aikana").exists());
});

step("Set view port to <width> x <height>", async (width, height) => {
  await setViewPort({ width: parseInt(width), height: parseInt(height) });
});
