import React,{useRef} from 'react';
import SwiperCore, { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Button, { OutlineButton } from '../button/Button';
import Modal,{ModalContent} from '../modal/Modal'
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useState, useEffect } from 'react';
import tmdbApi, { category, movieType } from '../../api/tmdbApi';
import apiConfig from '../../api/apiConfig';
import './hero-slide.scss';
import { useNavigate } from 'react-router-dom';

const HeroSlide = () => {
  SwiperCore.use([Autoplay]);

  const [movieItems, setMovieItems] = useState([]);

  useEffect(() => {
    const getMovies = async () => {
      const params = { page: 1 };
      try {
        const response = await tmdbApi.getMoviesList(movieType.popular, { params });
        setMovieItems(response.results.slice(1, 4));
        console.dir(response);
      } catch {
        console.log('error');
      }
    };
    getMovies();
  }, []);

  return (
    <div className='hero-slide'>
      {movieItems && (
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          grabCursor={true}
          spaceBetween={0}
          autoplay={{ delay: 4000 }}
          navigation={true}
        >
          {movieItems.map((item, i) => (
            <SwiperSlide key={i}>
              {({ isActive }) => (
                <HeroSlideItem item={item} className={`${isActive ? 'active' : ''}`} />
              )}
            </SwiperSlide>
          ))}
        </Swiper> )}
        {
          movieItems.map((item,i)=>(
            <TrailerModal key={i} item={item}/>
          ))
        }
    </div>
  );
};

const HeroSlideItem = (props) => {
  const navigate = useNavigate();
  const item = props.item;
  const background = apiConfig.originalImage(item.backdrop_path ? item.backdrop_path : item.poster_path);
  const setModalActive = async () => {
    const modal = document.querySelector(`#modal_${item.id}`);
    const videos = await tmdbApi.getVideos(category.movie,item.id)
    if(videos.results.length > 0){
      const videSrc = 'https://www.youtube.com/embed/'+ videos.results[0].key;
      modal.querySelector('.modal__content > iframe').setAttribute('src',videSrc);
    }else {
      modal.querySelector('.modal__content').innerHTML = 'No trailer' ;
    }

    modal.classList.toggle('active');
  }
  return (
    <div className={`hero-slide__item ${props.className}`} style={{ backgroundImage: `url(${background})` }} >
      <div className="hero-slide__item__content container">
        <div className="hero-slide__item__content__info">
          <h2 className="title">{item.title}</h2>
          <div className="overview">{item.overview}</div>
          <div className="btns">
            <Button onClick={() => navigate('/movie/' + item.id)}>Whatch Now</Button>
            <OutlineButton onClick={setModalActive}>Whatch trailer</OutlineButton>
          </div>
        </div>
        <div className="hero-slide__item__content__poster">
          <img src={apiConfig.w500Image(item.poster_path)} alt=""/>
        </div>
      </div>
    </div>
  );
};

const TrailerModal = (props) => {

  const item = props.item;
  const ifranRef = useRef(null);
  const onClose = () => ifranRef.current.setAttribute('src','');

  return(
    <Modal active={false} id={`modal_${item.id}`}>
      <ModalContent onClose={onClose}>
        <iframe ref={ifranRef} width="100%" height="500px" title='trailer'></iframe>
      </ModalContent>
    </Modal>
  )
}

export default HeroSlide;
