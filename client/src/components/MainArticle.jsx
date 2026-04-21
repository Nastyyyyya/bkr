import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import { assets } from "../assets/assets";
import ArrowLeft from "../assets/arrow-narrow-left.svg";
import ArrowRight from "../assets/arrow-narrow-right.svg";

const MainArticle = () => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Всі статті тепер беруться з бази через articleId
  const projects = [
    {
      id: 1,
      title: "Корисні статті",
      description:
        "Як впоратися зі страхом повітряної тривоги та допомогти дитині",
      articleId: "69823b4ea88247899506b38e",
      image: assets.woman_holds_baby,
    },
    {
      id: 2,
      title: "Корисні статті",
      description: "Ознаки, що вказують на потребу психологічної допомоги",
      articleId: "NEW_ARTICLE_ID_FROM_MONGO", // тут вставляємо id твоєї другої статті
      image: assets.truvoga_article,
    },
    {
      id: 3,
      title: "Корисні статті",
      description:
        "Як впливати на поведінку дитини розумно та без шкоди для психіки",
      articleId: "6982406a6f321e6f7b9e0c1f",
      image: assets.happy_family,
    },
  ];

  return (
    <section className="projects" id="projects">
      <div className="container">
        <h2 className="project-title visually-hidden">PROJECTS</h2>

        <div className="project-swiper project-container">
          <Swiper
            modules={[Navigation, Keyboard]}
            spaceBetween={20}
            slidesPerView={1}
            speed={600}
            grabCursor
            keyboard={{
              enabled: true,
              onlyInViewport: true,
              pageUpDown: true,
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            ref={swiperRef}
          >
            {projects.map((project) => (
              <SwiperSlide
                key={project.id}
                className="swiper-slide project-item"
              >
                <div className="project-item-inf">
                  <div className="skills">
                    <p className="skills-p">{project.title}</p>
                  </div>

                  <p className="item-inf-p">{project.description}</p>

                  {/* 🔹 Всі статті тепер переходять всередині сайту */}
                  <button
                    className="item-inf-a"
                    onClick={() => navigate(`/articles/${project.articleId}`)}
                  >
                    Читати далі
                  </button>
                </div>

                <div className="project-item-img">
                  <picture>
                    <source
                      srcSet={`${project.image} 2x`}
                      media="(min-width: 768px)"
                    />
                    <img src={project.image} alt={project.title} width="385" />
                  </picture>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="slider-conteiner">
          <button className="swiper-button-prev">
            <img src={ArrowLeft} alt="previous slide" className="icon-arrow" />
          </button>
          <button className="swiper-button-next">
            <img src={ArrowRight} alt="next slide" className="icon-arrow" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MainArticle;
