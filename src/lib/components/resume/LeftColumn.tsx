import type { Variant } from "@/lib/types";
import ContactInfo from "./ContactInfo";
import Languages from "./Languages";
import ProfileImage from "./ProfileImage";

interface LeftColumnProps {
  resumeData: Variant;
  className?: string;
}

export default function LeftColumn({
  resumeData,
  className = "",
}: LeftColumnProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="flex justify-center">
        <ProfileImage />
      </div>
      <ContactInfo contactInfo={resumeData.contactInfo} />
      <Languages languages={resumeData.languages} />
    </div>
  );
}
