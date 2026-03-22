import { Instagram, Send, Phone, Mail, Facebook, Clock } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8 items-start">
          {/* Logo & Contact */}
          <div>
            <Link href="/" className="text-xl font-extrabold text-amber-400 tracking-wider uppercase">
              Binom Mebli
            </Link>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <a href="mailto:info@binom-mebli.com" className="hover:text-amber-400 transition-colors">
                  info@binom-mebli.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Пн–Пт: 9:00 – 18:00</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-sm text-slate-400 mb-3">Ми у соц. мережах:</p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/binommebli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.facebook.com/binommebli/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              &copy;{new Date().getFullYear()} Binom Mebli
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <a
              href="tel:+380000000000"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Phone className="h-4 w-4 text-amber-400" />
              +380 00 000 00 00
            </a>
          </div>

          {/* CTA */}
          <div className="flex justify-end">
            <Link
              href="/contact"
              className="flex items-center gap-2 px-6 py-3 border-2 border-amber-400 text-white font-bold hover:bg-amber-400/10 transition-colors"
            >
              <Phone className="h-5 w-5 text-amber-400" />
              Замовити консультацію
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
