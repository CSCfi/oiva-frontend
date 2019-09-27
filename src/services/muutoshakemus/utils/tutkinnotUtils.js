import { isInLupa, isAdded, isRemoved } from "../../../css/label";
import * as R from "ramda";
import _ from "lodash";

const categories = {};

export const getMetadata = (anchorParts, categories, i = 0) => {
  const category = R.find(R.propEq("anchor", anchorParts[i]), categories);
  if (anchorParts[i + 1]) {
    return getMetadata(anchorParts, category.categories, i + 1);
  }
  return category.meta;
};

export const getCategories = (
  index,
  article,
  koulutustyypit,
  kohde,
  maaraystyyppi,
  locale
) => {
  if (!categories[index]) {
    categories[index] = R.values(
      R.map(koulutustyyppi => {
        return {
          anchor: koulutustyyppi.koodiArvo,
          code: koulutustyyppi.koodiArvo,
          title:
            _.find(koulutustyyppi.metadata, m => {
              return m.kieli === locale;
            }).nimi || "[Koulutustyypin otsikko tähän]",
          categories: R.map(koulutus => {
            const isInLupaBool = article
              ? !!_.find(article.koulutusalat, koulutusala => {
                  return !!_.find(koulutusala.koulutukset, {
                    koodi: koulutus.koodiArvo
                  });
                })
              : false;

            return {
              anchor: koulutus.koodiArvo,
              meta: {
                kohde,
                maaraystyyppi,
                koodisto: koulutus.koodisto,
                metadata: koulutus.metadata,
                isInLupa: isInLupaBool
              },
              components: [
                {
                  anchor: "A",
                  name: "CheckboxWithLabel",
                  properties: {
                    name: "CheckboxWithLabel",
                    code: koulutus.koodiArvo,
                    title:
                      _.find(koulutus.metadata, m => {
                        return m.kieli === locale;
                      }).nimi || "[Koulutuksen otsikko tähän]",
                    labelStyles: {
                      addition: isAdded,
                      removal: isRemoved,
                      custom: Object.assign({}, isInLupaBool ? isInLupa : {})
                    },
                    isChecked: isInLupaBool
                  }
                }
              ],
              categories: (koulutus.osaamisalat || []).map(osaamisala => {
                const isInLupaBool = article
                  ? !!_.find(article.koulutusalat, koulutusala => {
                      return !!_.find(koulutusala.koulutukset, {
                        koodi: osaamisala.koodiArvo
                      });
                    })
                  : false;
                const isAddedBool = false;
                const isRemovedBool = false;
                return {
                  anchor: osaamisala.koodiArvo,
                  meta: {
                    kohde,
                    maaraystyyppi,
                    koodisto: osaamisala.koodisto,
                    metadata: osaamisala.metadata,
                    isInLupa: isInLupaBool
                  },
                  components: [
                    {
                      anchor: "A",
                      name: "CheckboxWithLabel",
                      properties: {
                        name: "CheckboxWithLabel",
                        code: osaamisala.koodiArvo,
                        title:
                          _.find(osaamisala.metadata, m => {
                            return m.kieli === "FI";
                          }).nimi || "[Osaamisalan otsikko tähän]",
                        labelStyles: {
                          addition: isAdded,
                          removal: isRemoved
                        },
                        isChecked:
                          (isInLupaBool && !isRemovedBool) || isAddedBool
                      }
                    }
                  ]
                };
              })
            };
          }, koulutustyyppi.koulutukset)
        };
      }, koulutustyypit)
    );
  }
  return categories[index];
};

export const getCategoriesForPerustelut = (
  index,
  article,
  koulutustyypit,
  kohde,
  maaraystyyppi,
  locale,
  changes,
  anchorInitial,
  lomakkeet
) => {
  if (!lomakkeet) {
    return false;
  }
  const relevantAnchors = R.map(R.prop("anchor"))(changes);
  const relevantKoulutustyypit = R.filter(
    R.compose(
      R.not,
      R.isEmpty,
      R.prop("koulutukset")
    ),
    R.mapObjIndexed(koulutustyyppi => {
      koulutustyyppi.koulutukset = R.filter(koulutus => {
        const anchorStart = `${anchorInitial}.${koulutustyyppi.koodiArvo}.${koulutus.koodiArvo}`;
        return !!R.find(R.startsWith(anchorStart))(relevantAnchors);
      }, koulutustyyppi.koulutukset);
      return koulutustyyppi;
    })(koulutustyypit)
  );

  return R.values(
    R.map(koulutustyyppi => {
      return {
        anchor: koulutustyyppi.koodiArvo,
        code: koulutustyyppi.koodiArvo,
        title:
          _.find(koulutustyyppi.metadata, m => {
            return m.kieli === locale;
          }).nimi || "[Koulutustyypin otsikko tähän]",
        categories: R.map(koulutus => {
          const isInLupaBool = article
            ? !!_.find(article.koulutusalat, koulutusala => {
                return !!_.find(koulutusala.koulutukset, {
                  koodi: koulutus.koodiArvo
                });
              })
            : false;

          const anchorBase = `${anchorInitial}.${koulutustyyppi.koodiArvo}.${koulutus.koodiArvo}`;

          const changeObj = R.find(
            R.compose(
              R.startsWith(anchorBase),
              R.prop("anchor")
            )
          )(changes);

          const isAddition = changeObj && changeObj.properties.isChecked;

          let structure = {
            anchor: koulutus.koodiArvo,
            meta: {
              kohde,
              maaraystyyppi,
              koodisto: koulutus.koodisto,
              metadata: koulutus.metadata,
              isInLupa: isInLupaBool
            },
            components: [
              {
                anchor: "A",
                name: "StatusTextRow",
                properties: {
                  code: koulutus.koodiArvo,
                  title: _.find(koulutus.metadata, m => {
                    return m.kieli === locale;
                  }).nimi,
                  labelStyles: {
                    addition: isAdded,
                    removal: isRemoved,
                    custom: Object.assign({}, isInLupaBool ? isInLupa : {})
                  },
                  styleClasses: ["flex"],
                  statusTextStyleClasses: isAddition
                    ? ["text-green-600 pr-4 w-20 font-bold"]
                    : ["text-red-500 pr-4 w-20 font-bold"],
                  statusText: isAddition ? " LISÄYS:" : " POISTO:"
                }
              }
            ]
          };

          if (isAddition) {
            structure.categories = lomakkeet.addition;
          } else if (isRemoved) {
            structure.categories = lomakkeet.removal;
          }

          if (koulutus.osaamisala) {
            structure.categories = R.insert(
              -1,
              (osaamisala => {
                const isInLupaBool = article
                  ? !!_.find(article.koulutusalat, koulutusala => {
                      return !!_.find(koulutusala.koulutukset, {
                        koodi: osaamisala.koodiArvo
                      });
                    })
                  : false;
                return {
                  anchor: osaamisala.koodiArvo,
                  meta: {
                    kohde,
                    maaraystyyppi,
                    koodisto: osaamisala.koodisto,
                    metadata: osaamisala.metadata,
                    isInLupa: isInLupaBool
                  },
                  components: [
                    {
                      anchor: "A",
                      name: "StatusTextRow",
                      properties: {
                        code: osaamisala.koodiArvo,
                        title:
                          _.find(osaamisala.metadata, m => {
                            return m.kieli === "FI";
                          }).nimi || "[Osaamisalan otsikko tähän]",
                        labelStyles: {
                          addition: isAdded,
                          removal: isRemoved
                        }
                      }
                    }
                  ],
                  categories: lomakkeet.osaamisala
                };
              })(koulutus.osaamisala),
              structure.categories
            );
          }
          return structure;
        }, koulutustyyppi.koulutukset)
      };
    }, _.cloneDeep(relevantKoulutustyypit))
  );
};
