"use client";
import { useAddStoryMutation } from "@/store/pages/home/muslimApi";
import { Button, Modal } from "antd";
import React, { useState } from "react";
import { LuPlus } from "react-icons/lu";

const AddStory = () => {
  const [addStory] = useAddStoryMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setPreview(null);
    setFile(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPreview(null);
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  async function addNewStory(e) {
    e.preventDefault();
    if (!file) return;

    let formData = new FormData();
    formData.append("Image", file);

    try {
      await addStory(formData);
      setIsModalOpen(false);
      setPreview(null);
      setFile(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Modal

        title={null}
        closable={false}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={400}
        className="!rounded-2xl !overflow-hidden"
      >
        <form
          onSubmit={addNewStory}
          className="flex flex-col items-center gap-4 p-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">Create Story</h2>

          <label
            htmlFor="inpAddImage"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-500 transition"
          >
            {!preview ? (
              <span className="text-gray-400">Click to select photo</span>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className=" w-full h-full object-cover rounded-xl"
              />
            )}
            <input
              id="inpAddImage"
              type="file"
              name="inpAddImage"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <Button
            htmlType="submit"
            type="primary"
            className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full px-6 py-2 font-semibold"
            disabled={!file}
          >
            Share to Story

        title="Add Story"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <form onSubmit={addNewStory} className="flex flex-col gap-3">
          <input
            type="file"
            name="inpAddImage"
            accept="image/*"
            onChange={handleFileChange}
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="max-h-60 object-contain rounded  p-1"
            />
          )}

          <Button htmlType="submit" type="primary" disabled={!file}>
            Add

          </Button>
        </form>
      </Modal>

      <button
        onClick={showModal}
        className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer hover:to-purple-500 hover:via-pink-400 hover:from-yellow-300 transition-colors delay-75"
      >
        <LuPlus className="text-white text-xl" />
      </button>
    </div>
  );
};

export default AddStory;
