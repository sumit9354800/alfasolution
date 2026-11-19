
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const contactOptions = [
  {
    label: "WhatsApp",
    href: "https://wa.me/919315424622?text=Hello%20Alfa%20Solution,%20I%20want%20to%20discuss%20a%20project.",
    icon: FaWhatsapp,
    color: "bg-[#25D366] hover:bg-[#1DA851]",
  },
  {
    label: "Call Us",
    href: "tel:+919315424622",
    icon: FaPhoneAlt,
    color: "bg-[#B58A62] hover:bg-[#8D6749]",
  },
  {
    label: "Email Us",
    href: "mailto:nishant@aplhasolution.net",
    icon: FaEnvelope,
    color: "bg-[#788A9A] hover:bg-[#627687]",
  },
];

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-5 z-[100] flex flex-col items-center gap-3 sm:bottom-8 sm:right-8">
      {contactOptions.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.label}
            href={item.href}
            target={item.label === "WhatsApp" ? "_blank" : undefined}
            rel={item.label === "WhatsApp" ? "noopener noreferrer" : undefined}
            aria-label={item.label}
            title={item.label}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${item.color}`}
          >
            <Icon size={20} />

            <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-[#191D27] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
              {item.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
