"use client";
import { useRegisterUserMutation } from "@/store/pages/auth/registerAPi";
import React, { useState } from "react";
import loginImg from '@/assets/img/pages/auth/login/Frame 241.png'
import Image from "next/image";
import Link from "next/link";

export default function Registration() {
	const [registerUser, { isLoading }] = useRegisterUserMutation();

	const [formData, setFormData] = useState({
		userName: "",
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			alert("Пароли не совпадают");
			return;
		}

		try {
			await registerUser(formData).unwrap();
		} catch (err) {
			console.error("Ошибка регистрации:", err);
		}
	};

	return (
		<>
			<div className="flex min-h-screen items-center justify-center ">
				<Image className="hidden lg:block" src={loginImg} />
				<div className="w-[500px] h-[700px] flex flex-col gap-[20px]    p-10 ">
					<h1 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
						Instagram
					</h1>
					<form onSubmit={handleSubmit} className="max-w-md mx-auto  rounded-lg space-y-4" >
						<input name="userName" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Имя пользователя" value={formData.userName} onChange={handleChange} required />
						<input name="fullName" placeholder="Полное имя" value={formData.fullName} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
						<input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
						<input name="password" type="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
						<input name="confirmPassword" type="password" placeholder="Подтверждение пароля" value={formData.confirmPassword} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
						<button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-[20px] py-[10px] w-full rounded-[5px]" >
							{isLoading ? "Регистрация..." : "Зарегистрироваться"}
						</button>
					</form>

					<div className="border w-full text-center rounded-[5px] border-[gray] shadow-2xs shadow-[gray]">

					<p className="mt-8 text-center text-[20px]  text-gray-500">
						Have an account?{" "}
						<Link href={"/login"} className="font-semibold text-blue-600 hover:underline">{" "}Login{" "}</Link>
					</p>
					</div>
				</div>
			</div>
		</>
	);
}
