import Title from "@/lib/components/ui/Title";
import type { Variant } from "@/lib/types";
import { useTranslations } from "next-intl";

interface Props {
	breaks: Variant["breaks"];
}

export default function Break({ breaks }: Props) {
	const t = useTranslations("resume.breaks");

	return (
		<section>
			<Title tag="h2" className="mb-4 border-b-2 border-neutral-300 pb-2">
				{t("title")}
			</Title>
			<div className="flex flex-col gap-6 print:gap-4">
				{breaks.map((b) => (
					<div
						key={b.period.start}
						className="break-inside-avoid border-b border-neutral-300 pb-4 last:border-b-0 space-y-4 print:space-y-2"
					>
						<div className="flex items-baseline justify-between gap-2 print:gap-1">
							<div className="text-neutral-600 dark:text-neutral-400">
								{b.period.start} - {b.period.end}
							</div>
						</div>
						<p className="mb-4">{t("description")}</p>
						{b.achievements.length > 0 && (
							<ul className="list-disc ml-4">
								{b.achievements.map((achievement) => (
									<li
										key={achievement}
										className="leading-relaxed print:leading-normal"
									>
										{achievement}
									</li>
								))}
							</ul>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
