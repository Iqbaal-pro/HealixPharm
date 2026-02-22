
export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#e1e6f0] px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-[#0c2242] mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Join HealiXPharm today
        </p>

        {/* Signup Form */}
        <form className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0c2242] text-gray-700 placeholder-gray-400"
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0c2242] text-gray-700 placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0c2242] text-gray-700 placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0c2242] text-gray-700 placeholder-gray-400"
          />

          <button
            type="submit"
            className="w-full bg-[#0c2242] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Signup */}
        <button
          className="w-full border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign up with Google
        </button>

        {/* Login Redirect */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#0c2242] font-semibold hover:underline">
            Login
          </a>
        </p>

      </div>
    </main>
  );
}
