import { find, pathEq, propEq } from "ramda";
import { __ } from "i18n-for-browser";
import { getLisatiedotFromStorage } from "helpers/lisatiedot";

export async function getOpiskelijamaaratLomake(
  { maaraykset },
  { isPreviewModeOn, isReadOnly }
) {
  const _isReadOnly = isPreviewModeOn || isReadOnly;
  const lisatiedot = await getLisatiedotFromStorage();

  const lisatiedotObj = find(
    pathEq(["koodisto", "koodistoUri"], "lisatietoja"),
    lisatiedot || []
  );

  const lisatietomaarays = find(propEq("koodisto", "lisatietoja"), maaraykset);

  return [
    {
      anchor: "info",
      components: [
        {
          anchor: "valinta",
          name: "StatusTextRow",
          properties: {
            title: __("opiskelijamaara.osionInfoteksti")
          }
        }
      ]
    },
    {
      anchor: "lisatiedot",
      components: [
        {
          anchor: "info",
          name: "StatusTextRow",
          properties: {
            title: __("common.lisatiedotInfo")
          }
        }
      ],
      layout: { margins: { top: "large" } },
      styleClasses: ["mt-10", "pt-10", "border-t"]
    },
    {
      anchor: "lisatiedot",
      components: [
        {
          anchor: lisatiedotObj.koodiarvo,
          name: "TextBox",
          properties: {
            forChangeObject: {
              koodiarvo: lisatiedotObj.koodiarvo,
              koodisto: lisatiedotObj.koodisto,
              versio: lisatiedotObj.versio,
              voimassaAlkuPvm: lisatiedotObj.voimassaAlkuPvm
            },
            isPreviewModeOn,
            isReadOnly: _isReadOnly,
            title: __("common.lisatiedot"),
            value: lisatietomaarays ? lisatietomaarays.meta.arvo : ""
          }
        }
      ]
    }
  ];
}
