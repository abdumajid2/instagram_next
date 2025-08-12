



// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import loginImg from '@/assets/img/pages/auth/login/Frame 241.png'
// import Link from "next/link";

// export default function Login() {
// 	const router = useRouter();

// 	const [userName, setUserName] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [error, setError] = useState(null);

// 	const API_URL = "http://37.27.29.18:8003/Account/login";

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
// 		setError(null);

// 		try {
// 			const res = await fetch(API_URL, {
// 				method: "POST",
// 				headers: {
// 					accept: "*/*",
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					userName,
// 					password,
// 				}),
// 			});

// 			if (!res.ok) {
// 				const errData = await res.json();
// 				throw new Error(errData.message || "Ошибка авторизации");
// 			}

// 			const data = await res.json();
// 			console.log("Успех:", data);

// 			// сохраняем токен с ключом 'authToken'
// 			localStorage.setItem("authToken", data.data);

// 			alert("Вход успешен!");
// 			router.push("/");
// 		} catch (err) {
// 			setError(err.message);
// 		}
// 	};

// 	return (
// 		<div className="flex  min-h-screen items-center justify-center ">
// 			<Image className="hidden lg:block" src={loginImg} />
// 			<div className="w-[500px] h-[700px] rounded border border-gray-200 bg-white p-10 shadow-md">
// 				<h1 className="mb-8 text-center text-3xl font-extrabold text-gray-900">   Instagram </h1>

// 				<form onSubmit={handleSubmit} className="space-y-5">
// 					<input type="text" placeholder="Phone number, user name or email" required value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />

// 					<input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />

// 					<button type="submit" className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800" > Log in </button>
// 				</form>

// 				<div className="mt-4 flex justify-end">
// 					<a href="#" className="text-xs font-semibold text-blue-600 hover:underline" >Forgot password? </a>
// 				</div>

// 				<div className="my-6 flex items-center">
// 					<div className="flex-grow border-t border-gray-300"></div>
// 					<span className="mx-4 text-xs font-semibold text-gray-400">or</span>
// 					<div className="flex-grow border-t border-gray-300"></div>
// 				</div>

// 				<button className="flex w-full items-center justify-center gap-2 rounded bg-blue-800 py-2 text-sm font-semibold text-white hover:bg-blue-900 active:bg-blue-950" type="button" >
// 					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
// 						<path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.406.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.313h3.59l-.467 3.622h-3.123V24h6.116c.73 0 1.324-.594 1.324-1.326V1.326C24 .593 23.406 0 22.675 0z" />
// 					</svg>
// 					Log in with Facebook
// 				</button>

// 				<p className="mt-8 text-center text-xs text-gray-500">
// 					Don't have an account?{" "}
// 					<Link href={'/registration'} className="font-semibold text-blue-600 hover:underline">   Sign up </Link>
// 				</p>
// 			</div>
// 		</div>
// 	);


// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import loginImg from '@/assets/img/pages/auth/login/Frame 241.png'
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Новый стейт для видимости пароля
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = "http://37.27.29.18:8003/Account/login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          password,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Ошибка авторизации");
      }

      const data = await res.json();
      console.log("Успех:", data);

      localStorage.setItem("authToken", data.data);

      alert("Вход успешен!");
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <Image className="hidden lg:block" src={loginImg} />
      <div className="w-[500px] h-[700px] rounded border border-gray-200 bg-white p-10 shadow-md">
        <h1 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
          Instagram
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <input
            type="text"
            placeholder="Phone number, user name or email"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-3 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* Кнопка иконки глазика */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? (
				<h1>Hide</h1>
              ) : (
				<h1>Open</h1>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
          >
            Log in
          </button>
        </form>

        <div className="mt-4 flex justify-end">
          <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">
            Forgot password?{" "}
          </a>
        </div>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-xs font-semibold text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded bg-blue-800 py-2 text-sm font-semibold text-white hover:bg-blue-900 active:bg-blue-950"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.406.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.313h3.59l-.467 3.622h-3.123V24h6.116c.73 0 1.324-.594 1.324-1.326V1.326C24 .593 23.406 0 22.675 0z" />
          </svg>
          Log in with Facebook
        </button>

        <p className="mt-8 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link href={"/registration"} className="font-semibold text-blue-600 hover:underline">
            {" "}
            Sign up{" "}
          </Link>
        </p>
      </div>
    </div>
  );
}
