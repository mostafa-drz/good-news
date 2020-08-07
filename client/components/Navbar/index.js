import React from "react";
import Link from "next/link";
import style from "./Navbar.module.css";
import cn from "classnames";

const Navbar = () => {
  return (
    <ul className={style.navbar}>
      <li className={cn(style.link, style.positive)}>
        <Link href="/?sentiment=positive">
          <a>Positive</a>
        </Link>
      </li>
      <li className={cn(style.link, style.neutral)}>
        <Link href="/?sentiment=neutral">
          <a>Neutral</a>
        </Link>
      </li>
      <li className={cn(style.link, style.negative)}>
        <Link href="/?sentiment=negative">
          <a>Negative</a>
        </Link>
      </li>
    </ul>
  );
};

export default Navbar;
