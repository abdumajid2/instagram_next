import React, { useState } from "react";
import { add } from "@/assets/icon/layout/svg";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import { IoImagesOutline } from "react-icons/io5";
import { useAddPostMutation } from "@/store/pages/home/muslimApi";
const AddPostButtonSm = () => {
  const { t } = useTranslation();
  const iconClass =
    "flex items-center gap-4 rounded-[8px] h-[52px] px-0 m-[0] justify-center";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [addPost] = useAddPostMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  async function addNewPost(e) {
    e.preventDefault();
    let formData = new FormData();
    let target = e.target;

    formData.append("Title", target["title"].value);
    formData.append("Content", target["content"].value);

    for (let i = 0; i < target["addPost"].files.length; i++) {
      formData.append("Images", target["addPost"].files[i]);
    }

    try {
      await addPost(formData);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Modal
        title=""
        closable={true}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        className="!fixed !top-1/2 !left-1/2  !-translate-x-1/2 !-translate-y-1/2"
      >
        <section className="h-[30vh]">
          <article className="flex items-center justify-center pb-1 border-b border-gray-300">
            <h3>Создание публикации</h3>
          </article>
        </section>

        <section className="flex flex-col items-center justify-center mb-[20vh]">
          <form
            onSubmit={addNewPost}
            className="flex flex-col gap-5 items-center group"
          >
            <IoImagesOutline className="text-7xl" />
            <label className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 text-white cursor-pointer">
              <input
                name="addPost"
                type="file"
                className="hidden file-input"
                multiple
                id="file"
                required
              />
              Выбрать на компьютере
            </label>

            <input
              type="text"
              name="title"
              placeholder="Введите название"
              className="hidden w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition
    group-has-[.file-input:valid]:block outline-none"
            />
            <input
              type="text"
              name="content"
              placeholder="Content"
              className="hidden w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition
    group-has-[.file-input:valid]:block outline-none"
            />
            <button
              className="hidden group-has-[.file-input:valid]:block bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-300 hover:via-pink-500 hover:to-purple-500 px-4 py-1.5 text-white rounded-lg w-[150px] max-w-[170px]"
              type="submit"
            >
              Save
            </button>
          </form>
        </section>
      </Modal>

      <div className={iconClass} onClick={showModal}>
        {add}
      </div>
    </>
  );
};

export default AddPostButtonSm;
