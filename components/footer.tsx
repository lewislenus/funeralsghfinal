import Link from "next/link"
import { Heart, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl opacity-20"></div>
              </div>
              <div>
                <span className="text-xl font-bold">damarifadue</span>
                <p className="text-xs text-slate-400 -mt-1">Honoring Lives</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A dignified digital platform connecting families and communities across Ghana to honor loved ones, share
              condolences, and provide support during difficult times.
            </p>
            <div className="flex items-center text-sm text-slate-400">
              <Heart className="w-4 h-4 mr-2 text-amber-500" />
              Made with love for Ghanaian families
            </div>
          </div>

          {/* For Families */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">For Families</h3>
            <ul className="space-y-3">
              {[
                { href: "/create-funeral", label: "Create Funeral Page" },
                { href: "/pricing", label: "Pricing Plans" },
                { href: "/templates", label: "Design Templates" },
                { href: "/support", label: "24/7 Support" },
                { href: "/guides", label: "How-to Guides" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Resources</h3>
            <ul className="space-y-3">
              {[
                { href: "/how-it-works", label: "How It Works" },
                { href: "/cultural-guide", label: "Cultural Guide" },
                { href: "/faq", label: "FAQ" },
                { href: "/blog", label: "Blog & Stories" },
                { href: "/community", label: "Community" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Get in Touch</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-slate-400">
                <Mail className="w-4 h-4 mr-3 text-amber-500" />
                support@funeralsghana.com
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <Phone className="w-4 h-4 mr-3 text-amber-500" />
                +233 (0) 24 123 4567
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <MapPin className="w-4 h-4 mr-3 text-amber-500" />
                Accra, Ghana
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white text-sm mb-3">Legal</h4>
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/cookies", label: "Cookie Policy" },
              ].map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">&copy; 2024 damarifadue. All rights reserved.</p>

            <div className="flex items-center space-x-6">
              <span className="text-slate-400 text-sm">Available in:</span>
              <div className="flex space-x-3 text-sm">
                <button className="text-slate-400 hover:text-amber-400 transition-colors duration-200">English</button>
                <button className="text-slate-400 hover:text-amber-400 transition-colors duration-200">Twi</button>
                <button className="text-slate-400 hover:text-amber-400 transition-colors duration-200">Ga</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
