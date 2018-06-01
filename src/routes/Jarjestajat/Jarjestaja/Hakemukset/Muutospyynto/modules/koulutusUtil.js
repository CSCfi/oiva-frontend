import _ from 'lodash'
import store from '../../../../../../store'
import { parseLocalizedField } from "../../../../../../modules/helpers"
import { KOODISTOT } from "../../../modules/constants"

export function getKieliByKoodi(koodi) {
  const state = store.getState()

  const { kielet } = state

  if (kielet && kielet.data) {
    return _.find(kielet.data, (kieli) => { return kieli.koodiArvo === koodi })
  } else {
    return undefined
  }
}

export function getKoulutusAlat() {
  const state = store.getState()

  if (state.koulutusalat && state.koulutusalat.fetched) {
    return state.koulutusalat.data
  }
}

export function getTutkintoNimiByKoodiarvo(koodi) {
  const state = store.getState()

  if (state.koulutukset && state.koulutukset.treedata) {
    const { treedata } = state.koulutukset

    let nimi = undefined

    _.forEach(treedata, ala => {
      _.forEach(ala.koulutukset, koulutus => {
        if (koulutus.koodiarvo === koodi) {
          nimi = koulutus.nimi
        }
      })
    })

    return nimi
  }
}

export function getTutkintoKoodiByMaaraysId(maaraysId) {
  const state = store.getState()

  if (state.lupa && state.lupa.data && state.lupa.data.maaraykset) {
    const { maaraykset } = state.lupa.data
    const obj = _.find(maaraykset, {id: maaraysId})

    if (obj && obj.koodiarvo) {
      return obj.koodiarvo
    }
  }
}

export function getTutkintoNimiByMaaraysId(maaraysId) {
  const state = store.getState()

  if (state.lupa && state.lupa.data && state.lupa.data.maaraykset) {
    const { maaraykset } = state.lupa.data
    const obj = _.find(maaraykset, {id: maaraysId})

    if (obj && obj.koodi && obj.koodi.metadata) {
      return parseLocalizedField(obj.koodi.metadata)
    }
  }
}

export function getMuutosperusteluObjectById(muutosperusteluId) {
  const state = store.getState()

  if (state.muutosperustelut && state.muutosperustelut.data) {
    return _.find(state.muutosperustelut.data, mperustelu => {
      return String(mperustelu.koodiArvo) === String(muutosperusteluId)
    })
  }
}

export function getPaatoskierrosByUuid(paatoskierrosUuid) {
  const state = store.getState()

  if (state.paatoskierrokset && state.paatoskierrokset.data) {
    return _.find(state.paatoskierrokset.data, paatoskierros => {
      return paatoskierros.uuid === paatoskierrosUuid
    })
  }
}

export function getEditIndex(values, koodiarvo, koodisto) {
  let i = undefined

  _.forEach(values, (value, idx) => {
    if (value.koodiarvo === koodiarvo && value.koodisto === koodisto) {
      i = idx
    }
  })

  return i
}

export function getChangeIndices(values, koodiarvo) {
  let indices = []

  _.forEach(values, (value, i) => {
    if (value.type === "change" && value.koodiarvo === koodiarvo) {
      indices.push(i)
    }
  })

  return indices
}

export function getOpiskelijavuosiIndex(values, koodiarvo) {
  let i = undefined

  _.forEach(values, (value, idx) => {
    if (value.koodiarvo === koodiarvo) {
      i = idx
    }
  })

  return i
}

export function handleSimpleCheckboxChange(event, editValues, fields, isInLupa, obj) {
  const { checked } = event.target
  const { koodiarvo, koodisto, kohde, maaraystyyppi } = obj

  if (checked) {
    if (isInLupa) {
      // Valtakunnallinen luvassa --> poistetaan se formista
      const i = getEditIndex(editValues, koodiarvo, koodisto)
      if (i !== undefined) {
        fields.remove(i)
      }
    } else {
      // Valtakunnallinen ei luvassa --> lisätään muutos formiin
      fields.push({
        type: 'addition',
        meta: { perusteluteksti: null },
        muutosperusteluId: null,
        isValtakunnallinen: true,
        koodiarvo: 'FI1',
        koodisto: 'nuts1',
        kohde,
        maaraystyyppi,
        metadata: {
          kuvaus: {
            FI: 'Tutkintoja ja koulutusta saa lisäksi järjestää Ahvenanmaan maakuntaa lukuun ottamatta myös muualla Suomessa.',
            SV: 'Examina och utbildning får därtill ordnas även på annat håll i Finland, med undantag för landskapet Åland.'
          }
        }
      })
    }
  } else {
    if (isInLupa) {
      // Valtakunnallinen luvassa --> lisätään muutos formiin
      fields.push({
        type: 'addition',
        meta: { perusteluteksti: null },
        muutosperusteluId: null,
        isValtakunnallinen: false,
        koodiarvo: 'FI1',
        koodisto: 'nuts1',
        kohde,
        maaraystyyppi,
        metadata: {
          kuvaus: {
            FI: 'Tutkintoja ja koulutusta saa lisäksi järjestää Ahvenanmaan maakuntaa lukuun ottamatta myös muualla Suomessa.',
            SV: 'Examina och utbildning får därtill ordnas även på annat håll i Finland, med undantag för landskapet Åland.'
          }
        }
      })
    } else {
      // Valtakunnallinen ei luvassa --> poistetaan se formista
      const i = getEditIndex(editValues, koodiarvo, koodisto)
      if (i !== undefined) {
        fields.remove(i)
      }
    }
  }
}

export function handleCheckboxChange(event, editValue, fields, isInLupa, currentObj) {
  const { koodiArvo, metadata, koodisto } = currentObj
  let { kohde, maaraystyyppi } = currentObj
  const { koodistoUri } = koodisto
  const nimi = parseLocalizedField(metadata, 'FI', 'nimi')
  const kuvaus = parseLocalizedField(metadata, 'FI', 'kuvaus')

  console.log(currentObj)

  const { checked } = event.target

  if (!kohde) {
    if (koodistoUri === KOODISTOT.KOULUTUS) {
      kohde = { id: 1 }
    }
  }

  if (!maaraystyyppi) {
    if (koodistoUri === KOODISTOT.KOULUTUS) {
      maaraystyyppi = { id: 1 }
    }
  }

  console.log(koodistoUri)
  console.log(kohde)

  if (checked) {
    if (isInLupa) {
      // Tutkinto oli luvassa --> poistetaan se formista
      const i = getEditIndex(editValue, koodiArvo, koodistoUri)
      if (i !== undefined) {
        fields.remove(i)
      }
    } else {
      // Tutkinto ei ollut luvassa --> lisätään se formiin
      fields.push({
        koodiarvo: koodiArvo,
        koodisto: koodistoUri,
        nimi,
        kuvaus,
        isInLupa,
        kohde,
        maaraystyyppi,
        type: "addition",
        meta: { perusteluteksti: null },
        muutosperusteluId: null
      })
    }
  } else {
    if (isInLupa) {
      // Tutkinto oli luvassa --> lisätään muutos formiin
      fields.push({
        koodiarvo: koodiArvo,
        koodisto: koodistoUri,
        nimi,
        kuvaus,
        isInLupa,
        kohde,
        maaraystyyppi,
        type: "removal",
        meta: { perusteluteksti: null },
        muutosperusteluId: null
      })
    } else {
      // Tutkinto ei ollut luvassa --> poistetaan muutos formista
      const i = getEditIndex(editValue, koodiArvo, koodistoUri)
      if (i !== undefined) {
        fields.remove(i)
      }
    }
  }
}

export function handleTutkintoKieliCheckboxChange(event, editValue, fields, isInLupa, value, currentObj) {
  const { koodi, nimi, maaraysId, kohde, maaraystyyppi } = currentObj
  const koodistoUri = "kieli"

  const { checked } = event.target

  if (checked) {
    if (isInLupa) {
      // Tutkinto oli luvassa --> poistetaan se formista
      const i = getEditIndex(editValue, koodi, koodistoUri)
      if (i !== undefined) {
        fields.remove(i)
      }
    } else {
      // Tutkinto ei ollut luvassa --> lisätään se formiin
      fields.push({
        koodiarvo: koodi,
        koodisto: koodistoUri,
        nimi,
        maaraysId,
        kohde,
        maaraystyyppi,
        value,
        kuvaus: null,
        isInLupa,
        type: "addition",
        meta: { perusteluteksti: null },
        muutosperusteluId: null
      })
    }
  } else {
    if (isInLupa) {
      // Tutkinto oli luvassa --> lisätään muutos formiin
      fields.push({
        koodiarvo:
        koodi,
        koodisto: koodistoUri,
        nimi,
        maaraysId,
        value,
        kohde,
        maaraystyyppi,
        kuvaus: null,
        isInLupa,
        type: "removal",
        meta: { perusteluteksti: null },
        muutosperusteluId: null
      })
    } else {
      // Tutkinto ei ollut luvassa --> poistetaan muutos formista
      const i = getEditIndex(editValue, koodi, koodistoUri)
      if (i !== undefined) {
        fields.remove(i)
      }
    }
    // Tarkastetaan, että editvaluesiin ei jää muutos-tyyppisiä arvoja
    if (editValue) {
      const indices = getChangeIndices(editValue, koodi)
      if (indices.length > 0) {
        indices.forEach(i => {
          fields.remove(i)
        })
      }
    }
  }
}

export function handleTutkintokieliSelectChange(editValues, fields, isInLupa, tutkinto, selectedValue) {
  if (selectedValue === null) {
    return
  }

  const { koodi, maaraysId, nimi, kohde, maaraystyyppi } = tutkinto
  const { value, koodisto, label } = selectedValue
  const { koodistoUri } = koodisto

  if (isInLupa) {
    // Tarkastetaan löytyykö muutosta editValuesista
    if (editValues) {
      const i = getEditIndex(editValues, koodi, koodistoUri)
      if (i !== undefined) {
        let obj = fields.get(i)
        fields.remove(i)
        obj.value = selectedValue.value
        fields.insert(i, obj)
      } else {
        fields.push({
          koodiarvo: koodi,
          koodisto: koodistoUri,
          nimi,
          maaraysId,
          value,
          label,
          kohde,
          maaraystyyppi,
          kuvaus: null,
          isInLupa,
          type: "change",
          meta: { perusteluteksti: null },
          muutosperusteluId: null
        })
      }
    } else {
      fields.push({
        koodiarvo: koodi,
        koodisto: koodistoUri,
        nimi,
        maaraysId,
        value,
        label,
        kohde,
        maaraystyyppi,
        kuvaus: null,
        isInLupa,
        type: "change",
        meta: { perusteluteksti: null },
        muutosperusteluId: null
      })
    }
  } else {
    if (editValues) {
      const i = getEditIndex(editValues, koodi, koodistoUri)
      if (i !== undefined) {
        let obj = fields.get(i)
        fields.remove(i)
        obj.value = value
        obj.label = label
        obj.isAdded = true
        fields.insert(i, obj)
      }
    }
  }
}

export function getKieliList(kielet, locale) {
  let kieletExtended = []

  kielet.forEach(kieli => {
    const { koodiArvo, koodisto, metadata, kohde, maaraystyyppi } = kieli
    kieletExtended.push({ koodiArvo, koodisto, metadata, kohde, maaraystyyppi, label: parseLocalizedField(metadata, locale), value: koodiArvo })
  })

  return kieletExtended
}
