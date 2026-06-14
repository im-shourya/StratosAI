import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111111] font-sans">
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-5xl font-display font-bold mb-6">Contact Us</h1>
        <p className="text-xl text-gray-600 mb-12">
          We'd love to hear from you. Reach out to our team for support or inquiries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-gray-600">parasharshourya07@gmail.com</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Office</h3>
            <p className="text-gray-600">India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
