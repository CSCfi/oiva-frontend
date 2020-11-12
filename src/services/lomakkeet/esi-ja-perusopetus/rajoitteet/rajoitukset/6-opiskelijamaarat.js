import { getPOMuutEhdotFromStorage } from "helpers/poMuutEhdot";
import { getLisatiedotFromStorage } from "helpers/lisatiedot";
import { getChangeObjByAnchor } from "../../../../../components/02-organisms/CategorizedListRoot/utils";
import { } from "ramda";
import { find, flatten, pathEq, map,toUpper  } from "ramda";
import { __ } from "i18n-for-browser";

export default async function opiskelijaMaarat(
    changeObjects,
    locale
) {
  const localeUpper = toUpper(locale);
  const lisatiedot = await getLisatiedotFromStorage();
  const isReadOnly = false;
  const lisatiedotObj = find(
      pathEq(["koodisto", "koodistoUri"], "lisatietoja"),
      lisatiedot
  );

  return {
      anchor: "maaraaika",
      components: [
          {
              anchor: "dropdown",
              styleClasses: "mb-0 mr-2 w-1/5",
              name: "Dropdown",
              properties: {
                  options: [
                      // 1 = koodiarvo 1, enintään, koodisto: kujalisamaareet
                      { label: __("common.enintaan"), value: "1" },
                      // 2 = koodiarvo 2, enintään, koodisto: kujalisamaareet
                      { label: __("common.vahintaan"), value: "2" }
                  ],
                  isReadOnly
              }
          },
          {
              anchor: "input",
              name: "Input",
              properties: {
                  placeholder: __("education.oppilastaOpiskelijaa"),
                  type: "number",
                  value: "",
                  isReadOnly
              }
          }
      ]
  };

}
