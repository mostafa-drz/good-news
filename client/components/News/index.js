import React from "react";
import style from "./News.module.css";
import dateFormat from "dateformat";
import Bar from "../Bar";

export default function News(props) {
  const {
    date,
    summary,
    Sentiment,
    overAllScore,
    link,
    source_title,
    id,
    title,
  } = props;
  const {
    overall: { SentimentScore },
  } = overAllScore;
  return (
    <div key={id} className={style.News}>
      <Bar {...SentimentScore} />
      {/* <span>❤️ * {(Positive * 100).toFixed(2)} </span>
        <span>😐 * {(Neutral * 100).toFixed(2)} </span>
        <span>💔 * {(Negative * 100).toFixed(2)} </span> */}
      <div className={style.content}>
        <a href={link} target="_blank">
          <h2>{title}</h2>
        </a>
        <p>{summary}</p>
        <div className={style["news-footer"]}>
          <h3 className={style["source-title"]}>{source_title}</h3>
          <date className={style["news-date"]}>
            {dateFormat(date, "fullDate")}
          </date>
        </div>
      </div>
    </div>
  );
}
