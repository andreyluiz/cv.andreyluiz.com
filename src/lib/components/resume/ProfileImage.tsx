import Image from "next/image";

interface ProfileImageProps {
  className?: string;
}

export default function ProfileImage({ className = "" }: ProfileImageProps) {
  return (
    <Image
      src="/profile.png"
      alt="Profile Picture"
      width={150}
      height={150}
      className={`rounded-full print:size-32 ${className}`}
    />
  );
}
