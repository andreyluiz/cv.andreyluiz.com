import Title from "@/lib/components/ui/Title";
import { Variant } from "@/lib/types";

interface Props {
  name: string;
  title: string;
  contactInfo: Variant["contactInfo"];
}

export default function Header({ name, title, contactInfo }: Props) {
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
      <table className="mt-4 w-full">
        <tbody>
          <tr className="mb-2">
            <td className="w-24 pr-2">
              <span className="font-bold">Email:</span>
            </td>
            <td className="pr-6">{contactInfo.email}</td>
            <td className="w-24 pr-2">
              <span className="font-bold">Phone:</span>
            </td>
            <td>{contactInfo.phone}</td>
          </tr>
          <tr className="my-2">
            <td className="w-24 pr-2">
              <span className="font-bold">Location:</span>
            </td>
            <td className="pr-6">{contactInfo.location}</td>
            <td className="w-24 pr-2">
              <span className="font-bold">Website:</span>
            </td>
            <td>{contactInfo.website}</td>
          </tr>
          <tr className="mt-2">
            <td className="w-24 pr-2">
              <span className="font-bold">LinkedIn:</span>
            </td>
            <td className="pr-6">{contactInfo.linkedin}</td>
            <td className="w-24 pr-2">
              <span className="font-bold">Available:</span>
            </td>
            <td>Immediately</td>
          </tr>
        </tbody>
      </table>
    </header>
  );
}
