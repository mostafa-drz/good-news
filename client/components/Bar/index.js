import React from "react";

const COLORS = {
  Negative: "red",
  Neutral: "yellow",
  Positive: "green",
};
export default function Bar(props) {
  const { Negative, Positive, Neutral } = props;
  const sum = Negative + Positive + Neutral;
  return (
    <div style={{ width: "100%", display: "flex", height: "7px" }}>
      <div
        style={{
          width: `${(Positive / sum) * 100}%`,
          backgroundColor: COLORS.Positive,
        }}
        title={`Positive ${((Positive / sum) * 100).toFixed(2)}`}
      ></div>
      <div
        style={{
          width: `${(Neutral / sum) * 100}%`,
          backgroundColor: COLORS.Neutral,
        }}
        title={`Neutral ${((Neutral / sum) * 100).toFixed(2)}`}
      ></div>
      <div
        style={{
          width: `${(Negative / sum) * 100}%`,
          backgroundColor: COLORS.Negative,
        }}
        title={`Negative ${((Negative / sum) * 100).toFixed(2)}`}
      ></div>
    </div>
  );
}
