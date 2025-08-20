import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import './ReelsSlider.css';

// import required modules
import { Pagination } from 'swiper/modules';

export default function ReelsSlider( { reels } ) {
  return (
    <>
      <Swiper
        direction={'vertical'}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {reels.map((e, i) => {
            return <SwiperSlide key={i}>Slide 1</SwiperSlide>
        })}
      </Swiper>
    </>
  );
}
