import React from "react";
import { Link } from "react-router-dom";
import "./ExercisesPreview.css";

const ExercisePreview = () => {
  return (
    <section className="benefits" id="benefits">
      <div className="bnf-cont exercise-container">
        <div className="exercise-header">
          <h2 className="bnf-title">Психологічні вправи для батьків</h2>
          <p>
            Ці вправи допомагають батькам керувати емоціями, знижувати стрес,
            покращувати взаєморозуміння з дитиною та підтримувати її розвиток.
          </p>
        </div>
        <div className="bnf-info">
          <ul className="bnf-ul">
            <li className="bnf-li">
              <div className="bnf-svg-cont">
                <svg width="24" height="24">
                  <use
                    className="bnf-icons"
                    href="./img/svg/icons.svg#icon-user"
                  ></use>
                </svg>
              </div>
              <div className="bnf-text-cont">
                <h3 className="bnf-name">Розуміння</h3>
                <p className="bnf-discr">
                  Допомагає батькам краще усвідомлювати власні емоції та реакції
                  у взаємодії з дитиною.
                </p>
              </div>
            </li>
            <li className="bnf-li">
              <div className="bnf-svg-cont">
                <svg width="24" height="24">
                  <use
                    className="bnf-icons"
                    href="./img/svg/icons.svg#icon-hourglass-o"
                  ></use>
                </svg>
              </div>
              <div className="bnf-text-cont">
                <h3 className="bnf-name">Спокій</h3>
                <p className="bnf-discr">
                  Сприяє зниженню стресу та тривожності під час виховання.
                </p>
              </div>
            </li>
            <li className="bnf-li">
              <div className="bnf-svg-cont">
                <svg width="24" height="24">
                  <use
                    className="bnf-icons"
                    href="./img/svg/icons.svg#icon-brush"
                  ></use>
                </svg>
              </div>
              <div className="bnf-text-cont">
                <h3 className="bnf-name">Комунікація</h3>
                <p className="bnf-discr">
                  Покращує здатність слухати і підтримувати дитину у складних
                  ситуаціях.
                </p>
              </div>
            </li>
            <li className="bnf-li">
              <div className="bnf-svg-cont">
                <svg width="24" height="24">
                  <use
                    className="bnf-icons"
                    href="./img/svg/icons.svg#icon-bubbles"
                  ></use>
                </svg>
              </div>
              <div className="bnf-text-cont">
                <h3 className="bnf-name">Підтримка</h3>
                <p className="bnf-discr">
                  Дозволяє батькам ефективніше допомагати дитині у розвитку та
                  адаптації.
                </p>
              </div>
            </li>
          </ul>
          <Link className="bnf-btn" to="/exercises" role="button">
            Дізнатися більше
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExercisePreview;
