import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  contactInfo: Variant["contactInfo"];
}

type ContactInfoT = Props["contactInfo"];
type ContactKey = keyof ContactInfoT;

const CONTACT_CONFIG = {
  email: {
    icon: "mdi:email",
    href: (v: string) => `mailto:${v.replace(/^mailto:/i, "").trim()}`,
  },
  phone: {
    icon: "mdi:phone",
    href: (v: string) => `tel:${v.replace(/^tel:/i, "").trim()}`,
  },
  location: {
    icon: "mdi:map-marker",
    href: (v: string) => `https://maps.google.com/?q=${encodeURIComponent(v)}`,
  },
  website: {
    icon: "mdi:web",
    href: (v: string) => {
      const s = v.trim().replace(/\/+$/, "");
      return /^https?:\/\//i.test(s) ? s : `https://${s}`;
    },
  },
  linkedin: {
    icon: "mdi:linkedin",
    href: (v: string) => `https://linkedin.com/in/${v.replace(/^@/, "")}`,
  },
  github: {
    icon: "mdi:github",
    href: (v: string) => `https://github.com/${v}`,
  },
} satisfies Record<ContactKey, { icon: string; href: (v: string) => string }>;


const ContactItem = ({ label, href, icon }: { label: string; href: string; icon: string }) => {
  return (
    <li className="flex items-center gap-2">
      <Icon icon={icon} className="size-4" />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {label}
      </a>
    </li>
  );
};

export default function ContactInfo({ contactInfo }: Props) {
  const t = useTranslations("resume.contactInfo");
  const { layoutMode } = useStore();

  const items = (Object.entries(contactInfo) as [ContactKey, string | undefined][])
    .filter(([, v]) => typeof v === "string" && v.trim() !== "")
    .map(([key, item]) => ({
      key,
      item,
      icon: CONTACT_CONFIG[key].icon,
      href: CONTACT_CONFIG[key].href(item!),
    }));

  return (
    <Section title={t("title")}>
      <ul className="grid grid-cols-2 gap-x-24">
        {items.map(({ key, item, icon, href }) => (
          <ContactItem key={key} label={item!.trim()} href={href} icon={icon} />
        ))}
      </ul>
    </Section>
  );
}
