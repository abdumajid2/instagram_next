"use client"

import { useGetChatQuery } from "@/store/pages/chat/pages/storeApi"



export default function DefaultChat(){
	const {data} = useGetChatQuery()
	const chat = data?.data || [];
	return <>
		<div>
			{
				chat.map((e)=>{
					return (
						<p>{e.receiveUserName}</p>
					)
				})
			}
		</div>
	</>
} 
