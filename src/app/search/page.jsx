'use client'
import { useGetUsersForSearchQuery } from '@/store/pages/setting/settingApi'
import React, { useState } from 'react'
import userImg from './Без названия.png'

const Search = () => {
	const [search, setSearch] = useState('')

	const { data, isLoading } = useGetUsersForSearchQuery({
		pageNumber: 1,
		pageSize: 9999,
	})

	let [findUserModal, setFindUserModal] = useState(false)
	let [findUserImg, setFindUserImg] = useState(null)
	let [findUserName, setFindUserName] = useState('')
	let [findUserFullName, setFindUserFullName] = useState('')
	function showFindUserModal(el) {
		setFindUserImg(el.avatar)
		setFindUserModal(true)
		setFindUserName(el.userName)
		setFindUserFullName(el.fullName)
	}

	const filteredUsers = data?.data?.filter(
		user =>
			user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			user.userName?.toLowerCase().includes(search.toLocaleLowerCase())
	)

	if (isLoading) return <p>Загрузка...</p>

	return (
		<div className='w-[1300px] flex justify-between items-start'>
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

			<div>
				{findUserModal && (
					<div className='shadow-xl p-[50px] rounded-[15px] w-[600px] text-center'>
						<img
							src={
								findUserImg
									? `http://37.27.29.18:8003/images/${findUserImg}`
									: userImg.src
							}
							alt=''
							width={200}
							height={200}
							className='rounded-[50%] m-auto'
						/>
						<h1 className='text-[35px] my-[15px]'>
							<b>{findUserName}</b>
						</h1>
						<h3 className='text-[25px] text-gray-500'>
							<b>{findUserFullName}</b>
						</h3>
					</div>
				)}
			</div>
		</div>
	)
}

export default Search
