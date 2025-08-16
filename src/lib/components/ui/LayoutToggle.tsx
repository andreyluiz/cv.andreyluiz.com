import { Bars3Icon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { useStore } from "@/lib/store";
import Button from "./Button";

interface LayoutToggleProps {
  className?: string;
}

export default function LayoutToggle({ className }: LayoutToggleProps) {
  const { layoutMode, setLayoutMode } = useStore();

  const toggleLayout = () => {
    const newMode = layoutMode === "single" ? "two-column" : "single";
    setLayoutMode(newMode);
  };

  const isTwoColumn = layoutMode === "two-column";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLayout}
      className={className}
      aria-label={
        isTwoColumn
          ? "Switch to single column layout"
          : "Switch to two column layout"
      }
      aria-pressed={isTwoColumn}
      title={
        isTwoColumn
          ? "Switch to single column layout"
          : "Switch to two column layout"
      }
    >
      {isTwoColumn ? (
        <Bars3Icon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
