'use client'
import { Switch } from 'antd'
import Link from 'next/link'
import { useState } from 'react'

export default function Setting() {
	let [notificationsModal, setNotificationsModal] = useState(true)
	let [confidentialityModal, setConfidentialityModal] = useState(false)
	let [frinendModal, setFriendModal] = useState(false)
	let [enemyModal, setEnemyModal] = useState(false)
	let [comentModal, setComentModal] = useState(false)
	let [repostModal, setRepostModal] = useState(false)

	function showNotificationsModal() {
		setNotificationsModal(true)
		setConfidentialityModal(false)
		setFriendModal(false)
		setEnemyModal(false)
		setComentModal(false)
		setRepostModal(false)
	}

	function showConfidentialityModal() {
		setNotificationsModal(false)
		setConfidentialityModal(true)
		setFriendModal(false)
		setEnemyModal(false)
		setComentModal(false)
		setRepostModal(false)
	}

	function showFriendModal() {
		setNotificationsModal(false)
		setConfidentialityModal(false)
		setFriendModal(true)
		setEnemyModal(false)
		setComentModal(false)
		setRepostModal(false)
	}

	function showEnemyModal() {
		setNotificationsModal(false)
		setConfidentialityModal(false)
		setFriendModal(false)
		setEnemyModal(true)
		setComentModal(false)
		setRepostModal(false)
	}

	function showComentModal() {
		setNotificationsModal(false)
		setConfidentialityModal(false)
		setFriendModal(false)
		setEnemyModal(false)
		setComentModal(true)
		setRepostModal(false)
	}

	function showRepostModal() {
		setNotificationsModal(false)
		setConfidentialityModal(false)
		setFriendModal(false)
		setEnemyModal(false)
		setComentModal(false)
		setRepostModal(true)
	}

	return (
		<>
			<div className='flex justify-between items-center'>
				<div className='w-[100%] lg:w-[20%] fixed top-0  h-screen overflow-y-auto p-4 gap-4 flex flex-col bg-white shadow-md'>
					<p className='text-2xl font-semibold mb-2'>Настройки</p>
					<p className='text-gray-600 mb-4'>Для вас</p>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-6 h-6 flex-shrink-0'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
							/>
						</svg>
						<Link href={'/profile'} className='hover:underline'>
							Редактировать профиль
						</Link>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-6 h-6 flex-shrink-0'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'
							/>
						</svg>
						<p onClick={showNotificationsModal}>Уведомления</p>
					</div>
					<p className='text-gray-600 mb-4'>Кто может видеть ваш контент</p>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z'
							/>
						</svg>
						<p onClick={() => showConfidentialityModal()}>
							Конфидециальность аккаунта
						</p>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
							/>
						</svg>
						<p onClick={() => showFriendModal()}>Близкие друзья</p>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
							/>
						</svg>
						<p onClick={() => showEnemyModal()}>Заблокированные</p>
					</div>

					<p className='text-gray-600 mb-4'>Взаимодействие с нами</p>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z'
							/>
						</svg>

						<Link href={'/chats'}>Сообщения</Link>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z'
							/>
						</svg>
						<p onClick={() => showComentModal()}>Коментарии</p>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z'
							/>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
							/>
						</svg>
						<p onClick={() => showRepostModal()}>Настройки репостов</p>
					</div>

					{/* ------- */}

					<p className='text-gray-600 mb-4'>Ваши проиложения и медиафайлы</p>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'
							/>
						</svg>
						<p>Отметки "Нравится"</p>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802'
							/>
						</svg>
						<p>Язык</p>
					</div>

					<p className='text-gray-600 mb-4'>Для профисиональных аккаунтов</p>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z'
							/>
						</svg>
						<p>Тип аккаунта и инструменты</p>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z'
							/>
						</svg>
						<p>Покажите что ваш профиль подтверждён</p>
					</div>

					<p className='text-gray-600 mb-4'>Инфформация и поддержка</p>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 0 1 0 9.424m-4.138-5.976a3.736 3.736 0 0 0-.88-1.388 3.737 3.737 0 0 0-1.388-.88m2.268 2.268a3.765 3.765 0 0 1 0 2.528m-2.268-4.796a3.765 3.765 0 0 0-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9.027 9.027 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.014 9.014 0 0 1-9.424 0m5.976-4.138a3.765 3.765 0 0 1-2.528 0m0 0a3.736 3.736 0 0 1-1.388-.88 3.737 3.737 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 0 1-1.652-1.306 9.027 9.027 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.014 9.014 0 0 1 0-9.424m4.138 5.976a3.765 3.765 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 0 0-1.652 1.306A9.025 9.025 0 0 0 4.33 7.288'
							/>
						</svg>
						<p>Помощь</p>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z'
							/>
						</svg>
						<p>Конфидециальность</p>
					</div>

					<div className='flex items-center gap-3 text-gray-800 hover:text-blue-600 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='size-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
							/>
						</svg>
						<p>Статус аккаунта</p>
					</div>
				</div>

				<div className='relative z-10 bg-white lg:w-[100%] m-auto ml-[500px]'>
					{notificationsModal && (
						<div className='max-w-2xl mx-auto p-6'>
							<h2 className='text-3xl font-bold text-center mb-8'>
								Уведомления
							</h2>

							<div className='space-y-4'>
								<details className='group rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 overflow-hidden'>
									<summary className='flex justify-between items-center p-4 cursor-pointer list-none'>
										<span className='font-medium text-gray-800'>
											Push-уведомления
										</span>
										<svg
											className='w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19 9l-7 7-7-7'
											/>
										</svg>
									</summary>
									<div className='px-4 pb-4 pt-2 text-gray-600'>
										Настройте получение push-уведомлений на ваше устройство. Вы
										можете выбрать типы уведомлений, которые хотите получать.
										<div className='mt-4 space-y-3'>
											<label className='flex items-center space-x-3'>
												<input
													type='checkbox'
													className='form-checkbox h-5 w-5 text-blue-600 rounded'
												/>
												<span>Новые сообщения</span>
											</label>
											<label className='flex items-center space-x-3'>
												<input
													type='checkbox'
													className='form-checkbox h-5 w-5 text-blue-600 rounded'
												/>
												<span>Лайки и комментарии</span>
											</label>
											<label className='flex items-center space-x-3'>
												<input
													type='checkbox'
													className='form-checkbox h-5 w-5 text-blue-600 rounded'
												/>
												<span>Рекомендации</span>
											</label>
										</div>
									</div>
								</details>

								<details className='group rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 overflow-hidden'>
									<summary className='flex justify-between items-center p-4 cursor-pointer list-none'>
										<span className='font-medium text-gray-800'>
											Уведомления по электронной почте
										</span>
										<svg
											className='w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19 9l-7 7-7-7'
											/>
										</svg>
									</summary>
									<div className='px-4 pb-4 pt-2 text-gray-600'>
										Управляйте уведомлениями, которые приходят на вашу
										электронную почту.
										<div className='mt-4 space-y-3'>
											<label className='flex items-center space-x-3'>
												<input
													type='checkbox'
													className='form-checkbox h-5 w-5 text-blue-600 rounded'
												/>
												<span>Новые подписчики</span>
											</label>
											<label className='flex items-center space-x-3'>
												<input
													type='checkbox'
													className='form-checkbox h-5 w-5 text-blue-600 rounded'
												/>
												<span>Упоминания</span>
											</label>
											<label className='flex items-center space-x-3'>
												<input
													type='checkbox'
													className='form-checkbox h-5 w-5 text-blue-600 rounded'
												/>
												<span>Новости и обновления</span>
											</label>
										</div>
									</div>
								</details>
							</div>
						</div>
					)}

					{confidentialityModal && (
						<div className='max-w-2xl mx-auto p-6'>
							<h2 className='text-3xl font-bold text-center mb-8'>
								Конфиденциальность аккаунта
							</h2>

							<div className='space-y-6'>
								<div className='p-4 bg-gray-50 rounded-lg'>
									<div className='flex justify-between items-center mb-2'>
										<div>
											<h3 className='font-medium text-gray-800'>
												Закрытый аккаунт
											</h3>
											<p className='text-sm text-gray-500'>
												Одобряйте или отклоняйте подписчиков вручную
											</p>
										</div>
										<Switch
											className='bg-gray-300'
											checkedChildren='Вкл'
											unCheckedChildren='Выкл'
										/>
									</div>
									<p className='text-gray-600 text-sm'>
										Когда ваш аккаунт закрыт, только утвержденные вами
										подписчики смогут видеть ваши фото и видео.
									</p>
								</div>

								<div className='p-4 bg-gray-50 rounded-lg'>
									<h3 className='font-medium text-gray-800 mb-3'>Активность</h3>

									<div className='space-y-4'>
										<div className='flex justify-between items-center'>
											<div>
												<p className='text-gray-700'>Показывать активность</p>
												<p className='text-sm text-gray-500'>
													Отображать ваши действия другим пользователям
												</p>
											</div>
											<Switch />
										</div>

										<div className='flex justify-between items-center'>
											<div>
												<p className='text-gray-700'>История просмотров</p>
												<p className='text-sm text-gray-500'>
													Кто может видеть вашу историю просмотров
												</p>
											</div>
											<Switch />
										</div>
									</div>
								</div>

								<details className='group'>
									<summary className='flex justify-between items-center p-3 cursor-pointer list-none text-gray-700 hover:bg-gray-50 rounded-lg'>
										<span className='font-medium'>
											Дополнительная информация
										</span>
										<svg
											className='w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19 9l-7 7-7-7'
											/>
										</svg>
									</summary>
									<div className='p-4 text-gray-600 bg-gray-50 rounded-lg mt-1'>
										<p className='mb-3'>
											Конфиденциальность вашего аккаунта важна для нас. Эти
											настройки помогают контролировать, кто может видеть ваш
											контент и взаимодействовать с вами.
										</p>
										<p>
											Помните, что даже при закрытом аккаунте ваша информация
											профиля (имя пользователя, фото профиля) остается видимой
											для всех.
										</p>
									</div>
								</details>
							</div>
						</div>
					)}

					{frinendModal && (
						<div className='max-w-2xl mx-auto p-6'>
							<h2 className='text-3xl font-bold text-center mb-8'>
								Близкие друзья
							</h2>

							<div className='mb-6'>
								<div className='relative'>
									<input
										type='text'
										placeholder='Поиск друзей...'
										className='w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='w-5 h-5 absolute left-3 top-3.5 text-gray-400'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
										/>
									</svg>
								</div>
							</div>

							<div className='bg-gray-50 rounded-lg p-6 text-center'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={1.5}
									stroke='currentColor'
									className='w-12 h-12 mx-auto text-gray-400 mb-4'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z'
									/>
								</svg>
								<h3 className='text-xl font-semibold text-gray-700 mb-2'>
									У вас пока нет близких друзей
								</h3>
								<p className='text-gray-500 mb-4'>
									Добавляйте друзей в этот список, чтобы делиться контентом
									только с ними
								</p>
							</div>
						</div>
					)}

					{enemyModal && (
						<div className='max-w-2xl mx-auto p-6'>
							<h2 className='text-3xl font-bold text-center mb-8'>
								Заблокированные
							</h2>

							<div className='mb-6'>
								<div className='relative'>
									<input
										type='text'
										placeholder='Поиск заблокированных...'
										className='w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='w-5 h-5 absolute left-3 top-3.5 text-gray-400'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
										/>
									</svg>
								</div>
							</div>

							<div className='bg-gray-50 rounded-lg p-6 text-center'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={1.5}
									stroke='currentColor'
									className='w-12 h-12 mx-auto text-gray-400 mb-4'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z'
									/>
								</svg>
								<h3 className='text-xl font-semibold text-gray-700 mb-2'>
									У вас пока нет заблокированных пользователей
								</h3>
							</div>
						</div>
					)}

					{comentModal && (
						<div className='max-w-2xl mx-auto p-6'>
							<h2 className='text-3xl font-bold text-center mb-8'>
								Настройки комментариев
							</h2>

							<div className='space-y-6'>
								<div className='bg-gray-50 rounded-lg p-6'>
									<h3 className='font-medium text-lg mb-4'>
										Разрешить комментарии от
									</h3>

									<div className='space-y-4'>
										<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
											<div className='flex items-center'>
												<div className='relative'>
													<input
														type='checkbox'
														className='sr-only peer'
														defaultChecked
													/>
													<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
												</div>
												<span className='ml-3 text-gray-700'>
													Все пользователи
												</span>
											</div>
										</label>

										<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
											<div className='flex items-center'>
												<div className='relative'>
													<input type='checkbox' className='sr-only peer' />
													<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
												</div>
												<span className='ml-3 text-gray-700'>
													Люди, на которых вы подписаны
												</span>
											</div>
										</label>

										<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
											<div className='flex items-center'>
												<div className='relative'>
													<input type='checkbox' className='sr-only peer' />
													<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
												</div>
												<span className='ml-3 text-gray-700'>
													Ваши подписчики
												</span>
											</div>
										</label>
									</div>
								</div>

								<div className='bg-gray-50 rounded-lg p-6'>
									<h3 className='font-medium text-lg mb-4'>
										Дополнительные настройки
									</h3>

									<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
										<div className='flex items-center'>
											<div className='relative'>
												<input
													type='checkbox'
													className='sr-only peer'
													defaultChecked
												/>
												<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
											</div>
											<span className='ml-3 text-gray-700'>
												Разрешить комментарии с GIF
											</span>
										</div>
									</label>
								</div>
							</div>
						</div>
					)}

					{repostModal && (
						<div className='max-w-2xl mx-auto p-6'>
							<h2 className='text-3xl font-bold text-center mb-8'>
								Настройки репостов
							</h2>

							<div className='space-y-6'>
								<div className='bg-gray-50 rounded-lg p-6'>
									<h3 className='font-medium text-lg mb-4'>
										Разрешить людям делится вашим контентом
									</h3>

									<div className='space-y-4'>
										<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
											<div className='flex items-center'>
												<div className='relative'>
													<input
														type='checkbox'
														className='sr-only peer'
														defaultChecked
													/>
													<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
												</div>
												<span className='ml-3 text-gray-700'>
													Размещать публикации и видео Reels в историях
												</span>
											</div>
										</label>

										<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
											<div className='flex items-center'>
												<div className='relative'>
													<input type='checkbox' className='sr-only peer' defaultChecked/>
													<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
												</div>
												<span className='ml-3 text-gray-700'>
													Истории в сообщениях
												</span>
											</div>
										</label>

										<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
											<div className='flex items-center'>
												<div className='relative'>
													<input type='checkbox' className='sr-only peer' defaultChecked/>
													<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
												</div>
												<span className='ml-3 text-gray-700'>
													Репосты публикаций и видео Reels
												</span>
											</div>
										</label>
									</div>
								</div>

								<div className='bg-gray-50 rounded-lg p-6'>
									<h3 className='font-medium text-lg mb-4'>
										Разрешите людям публиковать контент за пределами Instagram
									</h3>

									<label className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
										<div className='flex items-center'>
											<div className='relative'>
												<input
													type='checkbox'
													className='sr-only peer'
													defaultChecked
												/>
												<div className='w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500'></div>
											</div>
											<span className='ml-3 text-gray-700'>
												
											</span>
										</div>
									</label>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
