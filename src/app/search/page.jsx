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
import ProfileById from '@/components/pages/setting/compInfoSearch'
import Link from 'next/link'

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
						<Link href={`/profile/${el.id}`}
							key={el.id}
							className='flex items-center mb-4 bg-white p-4 rounded-lg shadow'
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
						</Link>
					))}
				</div>
			)}

			{findUserModal && (
				<ProfileById/>
			)}

			
		</div>
	)
}

export default Search
