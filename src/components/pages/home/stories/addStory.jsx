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
