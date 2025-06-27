import Image from "next/image";
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
    <header className="flex items-center justify-between gap-8">
      <Image
        src="/profile.png"
        alt="Andrey Luiz"
        className="w-36 h-36 rounded-full border-2 border-neutral-200"
        width={144}
        height={144}
      />
      <div className="flex-1">
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

          <div className="w-16">
            <span className="font-bold">{t("available")}:</span>
          </div>
          <div>{t("immediately")}</div>
        </div>
      </div>
    </header>
  );
}
