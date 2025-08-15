import type { Variant } from "@/lib/types";
import ProfileImage from "./ProfileImage";
import ContactInfo from "./ContactInfo";
import Languages from "./Languages";

interface LeftColumnProps {
  resumeData: Variant;
  className?: string;
}

export default function LeftColumn({ resumeData, className = "" }: LeftColumnProps) {
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