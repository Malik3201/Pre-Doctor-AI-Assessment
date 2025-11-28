import { useEffect } from "react";
import { useHospitalBranding } from "../../context/HospitalBrandingContext.jsx";

const DEFAULT_TITLE = "Pre-Doctor AI";
const GLOBAL_TITLE = "Pre-Doctor AI – Hospital Intelligence Suite";
const DEFAULT_FAVICON = "/predocAi-logo.png";

const ensureFaviconLink = () => {
  let link =
    document.querySelector("link[rel='icon']") ||
    document.querySelector("link[rel='shortcut icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  return link;
};

export default function BrandingHeadEffect() {
  const { branding, loading } = useHospitalBranding();

  useEffect(() => {
    if (loading) {
      document.title = DEFAULT_TITLE;
      return;
    }

    if (branding?.mode === "hospital" && branding?.name) {
      document.title = `${branding.name} – Pre-Doctor AI Portal`;
    } else {
      document.title = GLOBAL_TITLE;
    }

    const faviconUrl =
      branding?.mode === "hospital" && branding?.logo
        ? branding.logo
        : DEFAULT_FAVICON;

    const faviconLink = ensureFaviconLink();
    faviconLink.href = faviconUrl;
  }, [branding, loading]);

  return null;
}
