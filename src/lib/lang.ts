export const langs = {
  en: "English",
  pt: "Portuguese",
  fr: "French",
};

export const langsOptions = Object.entries(langs).map(([key, value]) => ({
  label: value,
  value: key,
}));
