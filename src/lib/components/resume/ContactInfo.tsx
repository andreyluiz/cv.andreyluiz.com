import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import type { Variant } from "@/lib/types";
import { Section } from "../ui/Section";

interface Props {
  contactInfo: Variant["contactInfo"];
}

const ContactItem = ({ item, icon }: { item: string; icon: string }) => {
  return (
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="size-4" />
      <a
        href={item}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {item}
      </a>
    </div>
  );
};

export default function ContactInfo({ contactInfo }: Props) {
  const t = useTranslations("resume.contactInfo");

  return (
    <Section title={t("title")}>
      <ul className="grid grid-cols-2">
        <ContactItem item={contactInfo.email} icon="mdi:email" />
        <ContactItem item={contactInfo.location} icon="mdi:map-marker" />
        <ContactItem item={contactInfo.phone} icon="mdi:phone" />
        <ContactItem item={contactInfo.linkedin} icon="mdi:linkedin" />
        <ContactItem item={contactInfo.github} icon="mdi:github" />
        <ContactItem item={contactInfo.website} icon="mdi:web" />
        <ContactItem item={contactInfo.age.toString()} icon="mdi:calendar" />
        <ContactItem item={contactInfo.nationality} icon="mdi:flag" />
        <ContactItem item={contactInfo.permit} icon="mdi:passport" />
      </ul>
    </Section>
  );
}
