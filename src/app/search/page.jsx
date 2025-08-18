'use client'
import {
	useFollowToUserMutation,
	useGetSubscribersQuery,
	useGetUsersForSearchQuery,
	useUnfollowToUserMutation,
} from '@/store/pages/setting/settingApi'
import React, { useState } from 'react'
import userImg from './Без названия.png'
import ExploreComponent from '@/components/pages/setting/compSearch'

const Search = () => {
	const [search, setSearch] = useState('')

	const { data, isLoading, refetch } = useGetUsersForSearchQuery({
		pageNumber: 1,
		pageSize: 9999,
	})

	let [findUserModal, setFindUserModal] = useState(false)
	let [findUserImg, setFindUserImg] = useState(null)
	let [findUserName, setFindUserName] = useState('')
	let [findUserFullName, setFindUserFullName] = useState('')
	let [findUserFollow, setFindUserFollow] = useState(null)
	let [findUserId, setFindUserId] = useState(null)

	function showFindUserModal(el) {
		setFindUserImg(el.avatar)
		setFindUserModal(true)
		setFindUserName(el.userName)
		setFindUserFullName(el.fullName)
		setFindUserFollow(el.subscribersCount)
		setFindUserId(el.id)
	}

	const filteredUsers = data?.data?.filter(
		user =>
			user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			user.userName?.toLowerCase().includes(search.toLowerCase())
	)

	let { data: subscribersData, refetch: refetchSubscribers } =
		useGetSubscribersQuery(findUserId, {
			skip: !findUserId,
		})
	let [followToUser] = useFollowToUserMutation()
	async function subscribe(id) {
		const result = await followToUser(id).unwrap()
		await refetch()
		await refetchSubscribers()
	}

	let [unfollowToUser] = useUnfollowToUserMutation()
	async function unfollow(id) {
		await unfollowToUser(id)
		await refetchSubscribers()
	}

	if (isLoading) return <p>Загрузка...</p>

	if (!search) {
		return (
			<div className='p-[25px]'>
				<input
					type='search'
					placeholder='Search...'
					value={search}
					onChange={e => setSearch(e.target.value)}
					className='w-[100%] p-2 rounded-md mb-6 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
				/>
				<ExploreComponent />
			</div>
		)
	}

	return (
		<div className='w-[1300px] flex justify-between items-start'>
			{!findUserModal && (
				<div className='w-full max-w-md'>
					<input
						type='search'
						placeholder='Search...'
						value={search}
						onChange={e => setSearch(e.target.value)}
						className='w-full p-2 rounded-md mb-6 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400'
					/>
					{filteredUsers?.map(el => (
						<div
							key={el.id}
							className='flex items-center mb-4 bg-white p-4 rounded-lg shadow'
							onClick={() => showFindUserModal(el)}
						>
							<img
								src={
									el.avatar
										? `http://37.27.29.18:8003/images/${el.avatar}`
										: userImg.src
								}
								alt=''
								width={50}
								height={50}
								className='rounded-full mr-4'
							/>
							<div>
								<span className='font-medium text-gray-800'>
									{el.userName} <br /> {el.fullName}
								</span>
							</div>
						</div>
					))}
				</div>
			)}

			{findUserModal && (
				<div className='fixed inset-0 flex justify-center items-center z-10'>
					<div className='bg-gray-50 shadow-lg rounded-xl p-4 lg:p-6 w-[95%] max-w-[600px] max-h-screen overflow-y-auto'>
						<div className='flex flex-col items-center'>
							<img
								src={
									findUserImg
										? `http://37.27.29.18:8003/images/${findUserImg}`
										: userImg.src
								}
								alt=''
								className='w-32 h-32 rounded-full object-cover border-4 border-blue-100'
							/>
							<h1 className='text-2xl font-bold mt-4'>{findUserName}</h1>
							<h3 className='text-lg text-gray-500'>{findUserFullName}</h3>
							<p className='text-sm text-gray-400 mt-1'>
								Подписчиков: <b>{findUserFollow}</b>
							</p>
							<div className='flex gap-2 mt-4'>
								<button
									onClick={() => subscribe(findUserId)}
									className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
								>
									Подписаться
								</button>
								<button
									onClick={() => unfollow(findUserId)}
									className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition'
								>
									Отписаться
								</button>
							</div>
						</div>

						<div className='mt-8'>
							<h2 className='text-xl font-semibold mb-4'>Подписчики</h2>
							<div className='grid grid-cols-2 gap-4'>
								{subscribersData?.data?.map(el => (
									<div
										key={el.userShortInfo.id}
										className='flex items-center gap-3 bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition'
									>
										<img
											src={
												el.userShortInfo.userPhoto
													? `http://37.27.29.18:8003/images/${el.userShortInfo.userPhoto}`
													: userImg.src
											}
											alt=''
											className='w-12 h-12 rounded-full object-cover'
										/>
										<div>
											<p className='font-medium'>{el.userShortInfo.userName}</p>
											<p className='text-sm text-gray-500'>
												{el.userShortInfo.fullname}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Search
