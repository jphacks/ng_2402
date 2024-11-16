import styles from "./index.module.scss";
import { NextStepButton } from "../ui/NextStepButton";
import { PrevStepButton } from "../ui/PrevStepButton";
import { FoldButton } from "../ui/FoldButton";
import { Slider, TextArea, Button } from "@radix-ui/themes";
import React from "react";

type Props = {
  handlePrevStep: () => void;
  handleFoldFrontSide: () => void;
  handleFoldBackSide: () => void;
  foldAngle: number;
  setFoldAngle: React.Dispatch<React.SetStateAction<number>>;
  handleNextStep: () => void;
  totalNumber: number;
  currentNumber: number;
  isFoldFrontSide: boolean;
  handleRegisterOrigami: () => void;
  origamiDescription: string;
  setOrigamiDescription: React.Dispatch<React.SetStateAction<string>>;
};

export const FoldMethodSelectPanel: React.FC<Props> = ({
  handlePrevStep,
  handleNextStep,
  handleFoldFrontSide,
  handleFoldBackSide,
  foldAngle,
  setFoldAngle,
  totalNumber,
  currentNumber,
  isFoldFrontSide,
  handleRegisterOrigami,
  origamiDescription,
  setOrigamiDescription,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>折り方を選択(3/3)</h2>
        <div className={styles.foldButtons}>
          <FoldButton
            handleClick={handleFoldFrontSide}
            currentStep={isFoldFrontSide ? currentNumber : 0}
            totalSteps={totalNumber}
            isFrontSide={true}
            isFoldFrontSide={isFoldFrontSide}
          />
          <FoldButton
            handleClick={handleFoldBackSide}
            currentStep={isFoldFrontSide ? 0 : currentNumber}
            totalSteps={totalNumber}
            isFrontSide={false}
            isFoldFrontSide={isFoldFrontSide}
          />
        </div>
        <section className={styles.h3Section}>
          <h3 className={styles.h3}>折る角度</h3>
          <div className={styles.sliderWrapper}>
            0
            <Slider
              className={styles.slider}
              min={0}
              max={180}
              size="3"
              onValueChange={(value) => {
                setFoldAngle(value[0]);
              }}
              defaultValue={[180]}
              value={[foldAngle]}
            />
            180
          </div>
        </section>
        <section className={styles.h3Section}>
          <h3 className={styles.h3}>折り方の説明</h3>
          <TextArea
            placeholder="半分に折る"
            className={styles.textArea}
            value={origamiDescription}
            onChange={(e) => setOrigamiDescription(e.target.value)}
          />
        </section>
        <div className={styles.stepButtons}>
          <PrevStepButton handlePrevStep={handlePrevStep} />
          <NextStepButton handleNextStep={handleNextStep} />
        </div>
      </div>
      <Button
        onClick={handleRegisterOrigami}
        className={styles.registerButton}
        size="3"
      >
        折り紙を登録
      </Button>
    </div>
  );
};
