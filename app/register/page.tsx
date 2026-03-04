"use client";

import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 text-black">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-gray-200">

        <h1 className="text-3xl font-semibold mb-8">
          Pharmacy Registration
        </h1>

        <form onSubmit={handleRegister} className="space-y-10">

          {/* SECTION 1 */}
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Section 1: Pharmacy Identity
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium">
                  Pharmacy Name
                </label>
                <input type="text" className="input-style" />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Contact Phone Number
                </label>
                <input type="text" className="input-style" />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  WhatsApp Business Number
                </label>
                <input type="text" className="input-style" />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">
                  Pharmacy Address / Location
                </label>
                <input type="text" className="input-style" />
              </div>

            </div>
          </div>

          {/* SECTION 2 */}
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Section 2: Opening Hours
            </h2>

            <label className="block mb-2 font-medium">
              Opening Hours
            </label>
            <textarea className="input-style h-24"></textarea>
          </div>

          {/* SECTION 3 */}
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Section 3: Delivery Configuration
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium">
                  Estimated Delivery Time
                </label>
                <input type="text" className="input-style" />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Service Areas
                </label>
                <input type="text" className="input-style" />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Base Delivery Charge
                </label>
                <input type="text" className="input-style" />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Delivery Pricing Description (Optional)
                </label>
                <textarea className="input-style h-20"></textarea>
              </div>

            </div>
          </div>

          {/* SECTION 4 */}
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Section 4: Policies
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">
                  Prescription Requirement Policy
                </label>
                <textarea className="input-style h-24"></textarea>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Refund & Cancellation Policy
                </label>
                <textarea className="input-style h-24"></textarea>
              </div>
            </div>
          </div>

          {/* SECTION 5 */}
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Section 5: Support & Chat Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium">
                  Live Chat Support
                </label>
                <select className="input-style">
                  <option>ON</option>
                  <option>OFF</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Maximum Concurrent Chats
                </label>
                <input type="number" className="input-style" />
              </div>

            </div>
          </div>

          {/* SECTION 6 */}
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Section 6: Pharmacy Staff (Agents)
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              <div>
                <label className="block mb-2 font-medium">
                  Agent Name
                </label>
                <input type="text" className="input-style" />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Agent Role
                </label>
                <select className="input-style">
                  <option>Pharmacist</option>
                  <option>Assistant</option>
                  <option>Admin</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Availability
                </label>
                <select className="input-style">
                  <option>Online</option>
                  <option>Offline</option>
                </select>
              </div>

            </div>
          </div>

          {/* SUBMIT */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition"
            >
              Complete Registration
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}