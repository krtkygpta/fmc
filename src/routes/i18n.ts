// Route-level words: the page titles a route sets itself, and the privacy policy.
import { dict } from "$lib/shared/i18n";
import privacyEn from "./(app)/privacy/privacy.md?raw";
import privacyRu from "./(app)/privacy/privacy.ru.md?raw";
import privacyUk from "./(app)/privacy/privacy.uk.md?raw";
import privacyEs from "./(app)/privacy/privacy.es.md?raw";
import privacyHi from "./(app)/privacy/privacy.hi.md?raw";

export const t = dict(
  {
    editorTitle: "Editor — FMC Watchfaces",
    // privacy
    privacyTitle: "Privacy — FMC",
    privacyDescription: "What fmc.tools and the FMC Companion app collect, and what they don't.",
    privacy: privacyEn,
  },
  {
    ru: {
      editorTitle: "Редактор — FMC Watchfaces",
      privacyTitle: "Конфиденциальность — FMC",
      privacyDescription: "Что собирают fmc.tools и приложение FMC Companion, а что нет.",
      privacy: privacyRu,
    },
    uk: {
      editorTitle: "Редактор — FMC Watchfaces",
      privacyTitle: "Конфіденційність — FMC",
      privacyDescription: "Що збирають fmc.tools і застосунок FMC Companion, а що ні.",
      privacy: privacyUk,
    },
    es: {
      editorTitle: "Editor — FMC Watchfaces",
      privacyTitle: "Privacidad — FMC",
      privacyDescription: "Qué recopilan fmc.tools y la app FMC Companion, y qué no.",
      privacy: privacyEs,
    },
    hi: {
      editorTitle: "एडिटर — FMC Watchfaces",
      privacyTitle: "गोपनीयता — FMC",
      privacyDescription: "fmc.tools और FMC Companion ऐप क्या इकट्ठा करते हैं, और क्या नहीं।",
      privacy: privacyHi,
    },
  },
);
