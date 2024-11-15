"use client";

import styles from "./index.module.scss";
import { AxisSelectPanel } from "./AxisSelectPanel";
import { FoldTargetSelectPanel } from "./FoldTargetSelectPanel";
import { useState } from "react";

type Props = {};

export const FoldMethodControlPanel: React.FC<Props> = () => {
  const [step, setStep] = useState(1);
  const handlePrevStep = () => setStep(step - 1);
  const handleNextStep = () => setStep(step + 1);
  return (
    <section className={styles.container}>
      {step === 1 && <AxisSelectPanel handleNextStep={handleNextStep} />}
      {step === 2 && (
        <FoldTargetSelectPanel
          handlePrevStep={handlePrevStep}
          handleNextStep={handleNextStep}
        />
      )}
    </section>
  );
};
