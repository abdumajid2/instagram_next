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
  <div className="w-full max-w-[640px] sm:mx-0  sm:ml-[100px]  mx-auto px-4 mt-5 flex flex-col gap-5">
    {/* Breadcrumbs */}
    <div className="flex flex-wrap items-center gap-2 text-[18px] sm:text-[20px]">
      <Link href="/profile">
        <p className="font-[700] text-[#2563EB]">Profile</p>
      </Link>
      <p className="font-[700] text-[#1E293B]">/ Edit profile</p>
    </div>

    {/* Header section */}
    <section className="w-full flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 bg-[#F3F4F6] rounded-2xl p-4 sm:p-6">
      <article className="flex items-center gap-4"> 
        <Image
          src={photoPreview || p.src}
          width={70}
          height={70}
          className="rounded-full object-cover w-16 h-16 sm:w-[70px] sm:h-[70px]"
          alt="Profile photo"
        />
        <div className="text-center sm:text-left">
          <p className="font-[600]">{form.userName}</p>
          <p className="text-[#64748B] text-sm">{form.firstName}</p>
        </div>
      </article>

      <div className="flex flex-col items-center sm:items-end">
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleChangePhoto}
          className="hidden"
        />
        <label htmlFor="fileInput">
          <Button size="sm">Change photo</Button>
        </label>
      </div>
    </section>

    {/* Inputs */}
    <fieldset className="bg-white border-2 w-full h-[60px] border-[#E2E8F0] rounded-xl">
      <legend className="ml-2 text-[#64748B] text-sm">Name</legend>
      <input
        type="text"
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        className="w-full h-full outline-0 px-3"
      />
    </fieldset>

    <fieldset className="bg-white border-2 w-full h-[60px] border-[#E2E8F0] rounded-xl">
      <legend className="ml-2 text-[#64748B] text-sm">User name</legend>
      <input
        type="text"
        name="userName"
        value={form.userName}
        onChange={handleChange}
        className="w-full h-full outline-0 px-3"
      />
    </fieldset>

    <fieldset className="bg-white border-2 w-full h-[120px] sm:h-[100px] border-[#E2E8F0] rounded-xl">
      <legend className="ml-2 text-[#64748B] text-sm">Bio</legend>
      <textarea
        name="about"
        value={form.about}
        onChange={handleChange}
        className="w-full h-full outline-0 px-3 resize-none"
      />
    </fieldset>

    <select
      name="gender"
      value={form.gender}
      onChange={handleChange}
      className="bg-white text-[#64748B] border-2 w-full h-[60px] px-3 border-[#E2E8F0] rounded-xl"
    >
      <option value="">Gender</option>
      <option value="0">Male</option>
      <option value="1">Female</option>
    </select>
    <p className="text-[#64748B] text-sm">This won’t be part of your public profile.</p>

    <Button
      onClick={handleSubmit}
      className="w-[180px] h-[48px] mb-[100px] sm:mb-0 rounded-xl bg-[#E2E8F0] text-[#41526b]"
    >
      Submit
    </Button>
  </div>
)

}

export default EditProfile
