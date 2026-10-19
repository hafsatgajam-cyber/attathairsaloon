import { whatsappLink } from "@/lib/config";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hi Attat Hair Saloon 👋 I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-[#1fa855] px-4 py-3 font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#188a45] sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
