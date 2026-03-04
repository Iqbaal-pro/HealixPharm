"use client";

import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#e1e6f0] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-10">

        <h1 className="text-3xl font-bold text-[#0c2242] mb-8">
          Pharmacy Registration
        </h1>

        <form onSubmit={handleRegister} className="space-y-10">

          {/* SECTION 1 */}
          <div>
            <h2 className="text-xl font-semibold text-[#0c2242] mb-6">
              Section 1: Pharmacy Identity
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  placeholder="Enter pharmacy name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  WhatsApp Business Number
                </label>
                <input
                  type="text"
                  placeholder="Enter WhatsApp number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700 placeholder-gray-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 font-medium">
                  Pharmacy Address / Location
                </label>
                <input
                  type="text"
                  placeholder="Enter full address"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700 placeholder-gray-400"
                />
              </div>

            </div>
          </div>

          {/* SECTION 2 */}
          <div>
            <h2 className="text-xl font-semibold text-[#0c2242] mb-6">
              Section 2: Opening Hours
            </h2>

            <label className="block mb-2 text-gray-700 font-medium">
              Opening Hours
            </label>
            <textarea
              placeholder="Example: Mon–Sat 8AM–10PM | Sun 9AM–6PM"
              className="w-full border border-gray-300 rounded-lg px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-[#0c2242]
              text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* SECTION 3 */}
          <div>
            <h2 className="text-xl font-semibold text-[#0c2242] mb-6">
              Section 3: Delivery Configuration
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  placeholder="1–3 hours"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Service Areas
                </label>
                <input
                  type="text"
                  placeholder="Colombo 01–15"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700 placeholder-gray-400"
                />
              </div>

            </div>
          </div>

          {/* SECTION 4 */}
          <div>
            <h2 className="text-xl font-semibold text-[#0c2242] mb-6">
              Section 4: Policies
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Prescription Requirement Policy
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Refund & Cancellation Policy
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-[#0c2242]
                  text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-[#0c2242] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Complete Registration
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}