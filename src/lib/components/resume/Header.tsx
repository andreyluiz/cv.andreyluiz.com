import { useTranslations } from "next-intl";
import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";

interface Props {
  name: string;
  title: string;
  contactInfo: Variant["contactInfo"];
}

export default function Header({ name, title, contactInfo }: Props) {
  const t = useTranslations("resume.header");

  return (
    <header>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline">
          <Title tag="h1">{name}</Title>
          <Title tag="h2" className="mx-2 !text-neutral-600">
            -
          </Title>
          <Title tag="h2">{title}</Title>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-24">
        <div className="w-16">
          <span className="font-bold">{t("email")}:</span>
        </div>
        <div>{contactInfo.email}</div>
        <div className="w-16">
          <span className="font-bold">{t("phone")}:</span>
        </div>
        <div>{contactInfo.phone}</div>

        <div className="w-16">
          <span className="font-bold">{t("location")}:</span>
        </div>
        <div>{contactInfo.location}</div>

        {contactInfo.website && (
          <>
            <div className="w-16">
              <span className="font-bold">{t("website")}:</span>
            </div>
            <div>{contactInfo.website}</div>
          </>
        )}

        {contactInfo.linkedin && (
          <>
            <div className="w-16">
              <span className="font-bold">{t("linkedin")}:</span>
            </div>
            <div>{contactInfo.linkedin}</div>
          </>
        )}

        <div className="w-16">
          <span className="font-bold">{t("available")}:</span>
        </div>
        <div>{t("immediately")}</div>
      </div>
    </header>
  );
}
