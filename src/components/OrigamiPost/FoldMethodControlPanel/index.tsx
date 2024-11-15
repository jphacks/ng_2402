"use client";

import styles from "./index.module.scss";
import { AxisSelectPanel } from "./AxisSelectPanel";
import { FoldTargetSelectPanel } from "./FoldTargetSelectPanel";
import { FoldMethodSelectPanel } from "./FoldMethodSelectPanel";
import { useState } from "react";

type Props = {
  handleDecideRotateAxis: () => void;
};

export const FoldMethodControlPanel: React.FC<Props> = ({
  handleDecideRotateAxis,
}) => {
  const [step, setStep] = useState(3);
  const handlePrevStep = () => setStep(step - 1);
  const handleNextStep = () => setStep(step + 1);
  return (
    <section className={styles.container}>
      {step === 1 && (
        <AxisSelectPanel handleNextStep={handleDecideRotateAxis} />
      )}
      {step === 2 && (
        <FoldTargetSelectPanel
          handlePrevStep={handlePrevStep}
          handleNextStep={handleNextStep}
        />
      )}
      {step === 3 && (
        <FoldMethodSelectPanel
          handlePrevStep={handlePrevStep}
          handleNextStep={handleNextStep}
        />
      )}
    </section>
  );
};
