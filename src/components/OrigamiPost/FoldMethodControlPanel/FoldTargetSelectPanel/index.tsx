import styles from "./index.module.scss";
import { NextStepButton } from "../ui/NextStepButton";
import { PrevStepButton } from "../ui/PrevStepButton";

type Props = {
  handlePrevStep: () => void;
  handleNextStep: () => void;
};

export const FoldTargetSelectPanel: React.FC<Props> = ({
  handlePrevStep,
  handleNextStep,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>折る側の紙を選択</h2>
      <div>ここにGIFの説明が入る</div>
      <div className={styles.buttons}>
        <PrevStepButton handlePrevStep={handlePrevStep} />
        <NextStepButton handleNextStep={handleNextStep} />
      </div>
    </div>
  );
};
