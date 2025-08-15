"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button, message } from 'antd'
import p from '../../../assets/img/pages/profile/profile/p.png'
import { 
  useGetMyProfileQuery, 
  useUpdateUserProfileMutation, 
  useUpdateUserProfileImageMutation 
} from '@/store/pages/profile/ProfileApi'
import { useRouter } from 'next/navigation'

const EditProfile = () => {
  const router = useRouter()
  const { data, isLoading, isError } = useGetMyProfileQuery()
  const profile = data?.data

  const [updateProfile] = useUpdateUserProfileMutation()
  const [updateProfileImage] = useUpdateUserProfileImageMutation()

  const [form, setForm] = useState({
    firstName: '',
    userName: '',
    about: '',
    gender: ''
  })

  const [photoPreview, setPhotoPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        userName: profile.userName || '',
        about: profile.about || '',
        gender: profile.gender ?? ''
      })
      setPhotoPreview(profile.image ? `http://37.27.29.18:8003/images/${profile.image}` : p.src)
    }
  }, [profile])

  if (isLoading) return <p>Загрузка...</p>
  if (isError) return <p>Ошибка при загрузке данных</p>

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleChangePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    try {
      // Оборачиваем данные в userProfile
      await updateProfile({ userProfile: form }).unwrap()
      message.success("Profile updated successfully!")
      router.push('/profile')
    } catch (err) {
      message.error("Error updating profile")
    }

    if (selectedFile) {
      const formData = new FormData()
      formData.append('imageFile', selectedFile)
      try {
        await updateProfileImage(formData).unwrap()
        message.success("Profile image updated!")
      } catch (err) {
        message.error("Error uploading image")
      }
    }
  }

  return (
    <div className="sm:max-w-[640px] ml-[100px] mt-5 flex flex-col items-start gap-[20px] justify-between">
      <div className='flex items-start gap-[10px]'>
        <Link href={'/profile'}>
          <p className='text-[20px] font-[700] text-[#2563EB]'>Profile </p>
        </Link>
        <p className='text-[20px] font-[700] text-[#1E293B]'> / Edit profile</p>
      </div>

      <section className='w-full flex items-center justify-between bg-[#F3F4F6] rounded-2xl p-[20px]'>
        <article className='flex items-center gap-[20px]'>
          <Image
            src={photoPreview || p.src}
            width={70}
            height={70}
            className="rounded-full object-cover"
            alt="Profile photo"
          />
          <div>
            <p className="font-[600]">{form.userName}</p>
            <p className="text-[#64748B] text-[14px]">{form.firstName}</p>
          </div>
        </article>

        <div>
          <input 
            type="file" 
            id="fileInput" 
            accept="image/*" 
            onChange={handleChangePhoto} 
            className=""
          />
          <label htmlFor="fileInput">
            <Button>Change photo</Button>
          </label>
        </div>
      </section>

      <fieldset className='bg-white border-2 w-full h-[60px] border-[#E2E8F0] rounded-xl'>
        <legend className='ml-[10px] text-[#64748B]'>Name</legend>
        <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className='w-full h-full outline-0 px-[10px]' />
      </fieldset>

      <fieldset className='bg-white border-2 w-full h-[60px] border-[#E2E8F0] rounded-xl'>
        <legend className='ml-[10px] text-[#64748B]'>User name</legend>
        <input type="text" name="userName" value={form.userName} onChange={handleChange} className='w-full h-full outline-0 px-[10px]' />
      </fieldset>

      <fieldset className='bg-white border-2 w-full h-[100px] border-[#E2E8F0] rounded-xl'>
        <legend className='ml-[10px] text-[#64748B]'>Bio</legend>
        <textarea name="about" value={form.about} onChange={handleChange} className='w-full h-full outline-0 px-[10px]' />
      </fieldset>

      <select name="gender" value={form.gender} onChange={handleChange} className='bg-white text-[#64748B] border-2 w-full h-[60px] px-[10px] border-[#E2E8F0] rounded-xl'>
        <option value="">Gender</option>
        <option value="0">Male</option>
        <option value="1">Female</option>
      </select>
      <p className='text-[#64748B]'>This won’t be part of your public profile.</p>

      <Button onClick={handleSubmit} className="w-[180px] h-[48px] rounded-xl bg-[#E2E8F0] text-[#41526b]">
        Submit
      </Button>
    </div>
  )
}

export default EditProfile
