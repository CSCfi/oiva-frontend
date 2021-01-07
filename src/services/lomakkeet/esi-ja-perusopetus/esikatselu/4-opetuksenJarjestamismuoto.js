import { append, endsWith, find, pathEq, propEq } from "ramda";
import { replaceAnchorPartWith } from "utils/common";

export const previewOfOpetuksenJarjestamismuoto = ({
  lomakedata,
  rajoitteet
}) => {
  let structure = [];
  const checkedNode = find(
    pathEq(["properties", "isChecked"], true),
    lomakedata
  );

  if (checkedNode) {
    const kuvausNode = find(
      propEq(
        "anchor",
        `${replaceAnchorPartWith(checkedNode.anchor, 2, "kuvaus")}.A`
      ),
      lomakedata
    );

    if (kuvausNode) {
      console.info(kuvausNode);
      structure = append(
        {
          anchor: "valittu",
          components: [
            {
              anchor: "A",
              name: "List",
              properties: {
                items: [
                  {
                    anchor: "muoto",
                    components: [
                      {
                        anchor: "kuvaus",
                        name: "HtmlContent",
                        properties: { content: kuvausNode.properties.value }
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        structure
      );
    }
  }

  const lisatiedotNode = find(
    node => endsWith(".lisatiedot.1", node.anchor),
    lomakedata
  );

  if (lisatiedotNode && lisatiedotNode.properties.value) {
    structure = append(
      {
        anchor: "lisatiedot",
        components: [
          {
            anchor: "A",
            name: "StatusTextRow",
            properties: {
              title: lisatiedotNode.properties.value
            }
          }
        ]
      },
      structure
    );
  }

  return structure;
};