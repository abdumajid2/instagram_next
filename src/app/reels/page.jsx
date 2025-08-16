'use client'
import React, { useRef, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaRegComment } from "react-icons/fa";
import { IoVolumeMuteSharp } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { LiaBookmark } from "react-icons/lia";
import { FaBookmark } from "react-icons/fa6";
import { useGetReelsQuery, useAddLikeMutation, useFollowMutation, useAddToFavoriteMutation, useAddCommentMutation, useDeleteCommentMutation } from "@/store/pages/reels/ReelsApi";
import { Modal } from 'antd';

let userImage = "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png"

const Reals = () => {
  let { data, refetch } = useGetReelsQuery()
  let [ addLike ] = useAddLikeMutation()
  let [ Folow ] = useFollowMutation()
  let [ addToFavorite ] = useAddToFavoriteMutation()
  let [ addCommentf ] = useAddCommentMutation()
  let [ deleteComment ] = useDeleteCommentMutation()
  console.log(data?.data)
  const [mutedStates, setMutedStates] = useState({});
  const videoRefs = useRef([]);
  const [likedStates, setLikedStates] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [savedStates, setSavedStates] = useState({});

  let [ comments, setcomments ] = useState([])
  let [ addcomment, setaddcomment ] = useState("")
  let [ postid, setpostid ] = useState(null)

  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
  if (!addcomment.trim()) return;
  try {
    await addCommentf({ comment: addcomment, postId: postid }).unwrap();
    setcomments(prev => [
      {
        userImage: null,
        userName: "You",
        comment: addcomment
      },
      ...prev
    ]);
    setaddcomment("");
    } catch (err) {
      console.error("Ошибка при отправке комментария:", err);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const togglePlay = (e) => {
    const video = e.currentTarget;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  
  const toggleMute = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = !video.muted;
    setMutedStates(prev => ({ ...prev, [index]: video.muted }));
  };

  const handleLike = async (postId, currentCount) => {
    const isLiked = likedStates[postId] ?? false;
    setLikedStates(prev => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [postId]: isLiked ? (prev[postId] ?? currentCount) - 1 : (prev[postId] ?? currentCount) + 1
    }));
    try {
      await addLike(postId);
    } catch (err) {
      setLikedStates(prev => ({ ...prev, [postId]: isLiked }));
      setLikeCounts(prev => ({
        ...prev,
        [postId]: currentCount
      }));
      console.error(err);
    }
  };

  const handleSave = async (postId, currentState) => {
    const isSaved = savedStates[postId] ?? currentState;
    setSavedStates(prev => ({ ...prev, [postId]: !isSaved }));
    try {
      await addToFavorite({ postId });
    } catch (err) {
      setSavedStates(prev => ({ ...prev, [postId]: isSaved }));
      console.error(err);
    }
  };

  return <>
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {data?.data.map((e, i) => {
        const isLiked = likedStates[e.postId] ?? e.postLike;
        return (
          <div className="relative flex justify-center items-end w-[100%]" key={i}>
            <div className="relative">
              <div className="flex w-full border border-red-500 m-auto h-screen snap-start items-center  bg-black">
                <video onClick={togglePlay} ref={el => videoRefs.current[i] = el} muted={mutedStates[i] ?? true} className="w-full h-screen" autoPlay loop src={`http://37.27.29.18:8003/images/${e.images}`}></video>
              </div>
              <div className="absolute left-2 flex flex-col top-[-120px] items-start gap-3 text-[#e4e4e4]">
                <div className="flex items-center gap-4">
                  <img className="w-12 h-12 rounded-[50%] bg-white" src={e.userImage ? `http://37.27.29.18:8003/images/${e.userImage}` : userImage} alt="" />
                  <p>{e.userName}</p>
                  {!e.isSubscriber && <button onClick={()=>{Folow(e.userId)}} className="border py-1 px-3 rounded-xl">Subscribe</button>}
                </div>
                <div className="flex justify-between items-center">
                  <p className="lg:w-95">🎵 {e.userName} original audio</p>
                  <img className="w-10 h-10 rounded-[10px] bg-white" src={e.userImage ? `http://37.27.29.18:8003/images/${e.userImage}` : userImage} alt="" />
                </div>
              </div>
              <button className="absolute right-2 top-2 rounded-2xl p-1 bg-[#616161c1]" onClick={() => toggleMute(i)}>
                {mutedStates[i] ?? true ? <IoVolumeMuteSharp className="text-white w-6 h-6" /> : <GoUnmute className="text-white w-6 h-6" />}
              </button>
              <div className="flex flex-col items-center gap-2 mb-45 absolute bottom-0 right-1 text-white">
                <div className="flex flex-col items-center">
                  {isLiked ? <FaHeart className="text-red-500 w-8 h-8" onClick={() => handleLike(e.postId, e.postLikeCount)} /> : <CiHeart className="w-10 h-10 hover:text-[#949494]" onClick={() => handleLike(e.postId, e.postLikeCount)} />}
                  <p>{likeCounts[e.postId] ?? e.postLikeCount}</p>
                </div>
                <div className="flex flex-col items-center">
                  <FaRegComment onClick={()=>{showModal(), setcomments(e.comments), setpostid(e.postId)}} className="w-8 h-8 hover:text-[#cdcdcd]" />
                  <p>{e.commentCount}</p>
                </div>
                <div className="flex flex-col gap-5 items-center">
                  <PiPaperPlaneTiltBold className="w-7 h-7 hover:text-[#cacaca]" />
                  <button>{savedStates[e.postId] ?? e.postFavorite ? <FaBookmark className="w-8 h-8" /> : <LiaBookmark className="w-10 h-10 hover:text-[#949494]" onClick={() => handleSave(e.postId, e.postFavorite)} />}</button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <Modal
        title="Comments"
        open={open}
        mask={false}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        footer={[
          <div key="custom-footer" className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Add comment..."
              name="addCommentInp"
              value={addcomment}
              onChange={(e)=>{setaddcomment(e.target.value)}}
              className="flex-1 border rounded-lg px-3 py-2 outline-none"
            />
            <button
              onClick={()=>{handleOk()}}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        ]}
      >
        <div className="overflow-x-auto h-100 flex flex-col gap-10">
          {comments.map((c, ind)=>{
            if (comments == []) return <p>not Comments yet</p>
            return <div key={ind} className="flex items-center gap-2 justify-between px-5">
              <div className="flex items-start gap-2">
                <img className="w-12 h-12 rounded-[50%]" src={c.userImage ? `http://37.27.29.18:8003/images/${c.userImage}` :userImage} alt="" />
                <div className="flex flex-col justify-between">
                  <h3 className="text-[18px]">{c.userName}</h3>
                  <p>{c.comment}</p>
                </div>
              </div>
              <button onClick={()=>deleteComment(c.postCommentId)}>❌</button>
            </div>
          })}
        </div>
      </Modal>
    </div>
  </>;
};

export default Reals;
