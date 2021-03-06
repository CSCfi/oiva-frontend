import { __ } from "i18n-for-browser";

export const getMaaraaikalomake = async locale => {
  return {
    anchor: "rajoitus",
    components: [
      {
        anchor: "alkamispaiva",
        name: "Datepicker",
        properties: {
          forChangeObject: {
            // TODO: Aseta koodisto ja koodiarvo ei-kovakoodatusti
            koodiarvo: "3",
            koodisto: "kujalisamaareet",
            section: "maaraaika"
          },
          label: "Alkamispäivä",
          value: "",
          onChanges: () => {},
          clearable: true,
          showTodayButton: false,
          localizations: {
            ok: __("common.ok"),
            clear: __("common.clear"),
            cancel: __("common.cancel"),
            today: __("common.today"),
            datemax: __("common.datemax"),
            datemin: __("common.datemin"),
            dateinvalid: __("common.dateinvalid")
          },
          locale
        }
      },
      {
        anchor: "paattymispaiva",
        name: "Datepicker",
        properties: {
          forChangeObject: {
            koodiarvo: "3",
            koodisto: "kujalisamaareet",
            section: "maaraaika"
          },
          label: "Päättymispäivä",
          value: "",
          onChanges: () => {},
          clearable: true,
          showTodayButton: false,
          localizations: {
            ok: __("common.ok"),
            clear: __("common.clear"),
            cancel: __("common.cancel"),
            today: __("common.today"),
            datemax: __("common.datemax"),
            datemin: __("common.datemin"),
            dateinvalid: __("common.dateinvalid")
          },
          locale
        }
      }
    ]
  };
};
