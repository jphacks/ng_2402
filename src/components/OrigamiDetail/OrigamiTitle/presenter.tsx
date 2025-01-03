"use client";
import style from "./presenter.module.scss";
import { useEffect, useState } from "react";
import { SetHiragana } from "@/utils/children-mode";
import { useChildren } from "@/app/_children-provider";

interface OrigamiTitlePresenterProps {
  title: string;
  description: string;
}

export const OrigamiTitlePresenter: React.FC<OrigamiTitlePresenterProps> = (
  props: OrigamiTitlePresenterProps
) => {
  const { isChildren } = useChildren();
  const [description, setDescription] = useState("");
  useEffect(() => {
    if (isChildren) {
      if (props.description != "") {
        SetHiragana(props.description, setDescription);
      }
    } else {
      setDescription(props.description);
    }
  }, [props.description, isChildren]);

  return (
    <div className={style.origami_title}>
      <h1 className={style.title}>{props.title}</h1>
      <p className={style.description}>{description}</p>
    </div>
  );
};
