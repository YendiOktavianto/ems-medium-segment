import Image from "next/image";

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg2.png')" }}
    >
      <div className="px-10 py-5 bg-gray-800/60 rounded-2xl shadow-lg w-[440px] flex flex-col items-center">
        {/* Logo */}
        <Image src="/logo.svg" alt="Logo" width={100} height={100} className="mx-2" />

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-8">
          Welcome to <br /> Power Management System
        </h1>

        {/* Form */}
        <form className="flex flex-col w-80 gap-5">
          {/* Input Username */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image
              src="/user.svg"
              alt="user"
              width={20}
              height={20}
              className="mr-3 opacity-70"
            />
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Input Password */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image
              src="/pw.svg"
              alt="password"
              width={20}
              height={20}
              className="mr-3 opacity-70"
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded-sm border-[#414141] accent-[#2196F3]"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-[#2196F3] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="shadow-xl bg-[#2196F3] hover:bg-blue-600 text-white font-semibold py-2 rounded-full w-full h-12 transition-all duration-200 mt-5"
          >
            Login
          </button>
        </form>

        {/* Have account Register */}
        <div className="text-sm text-gray-300 mt-5 mb-3">
          Don't have an account?{" "}
          <button type="button" className="text-blue-400 hover:underline">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

