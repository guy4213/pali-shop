import Link from 'next/link'
import { MessageCircle, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-3xl font-black tracking-tight mb-3">
              <span className="gold-text">PALI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              חנות עם מכירות הצומחות באופן אקספוננציאלי. המלץ, שתף, והרווח.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">ניווט מהיר</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-yellow-400 transition-colors">דף הבית</Link></li>
              <li><Link href="/dashboard" className="hover:text-yellow-400 transition-colors">הדשבורד שלי</Link></li>
              <li><Link href="/wallet" className="hover:text-yellow-400 transition-colors">הארנק שלי</Link></li>
              <li><Link href="/guide" className="hover:text-yellow-400 transition-colors">מדריך לממליץ</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">עזרה ותמיכה</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="hover:text-yellow-400 transition-colors">שאלות ותשובות</Link></li>
              <li><Link href="/track" className="hover:text-yellow-400 transition-colors">מעקב חבילה</Link></li>
              <li><Link href="/terms" className="hover:text-yellow-400 transition-colors">תנאי שימוש</Link></li>
              <li><Link href="/terms" className="hover:text-yellow-400 transition-colors">מדיניות פרטיות</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">צור קשר</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://wa.me/972500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-green-400 transition-colors"
                >
                  <MessageCircle size={16} />
                  וואטסאפ
                </a>
              </li>
              <li>
                <a href="mailto:info@pali.co.il" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                  <Mail size={16} />
                  info@pali.co.il
                </a>
              </li>
              <li>
                <a href="tel:+972500000000" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                  <Phone size={16} />
                  050-0000000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} PALI. כל הזכויות שמורות.</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">תנאי שימוש</Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">מדיניות פרטיות</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
