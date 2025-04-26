import { Model } from "@/types/model";
import { decideNewProcedure } from "../../logics/decideNewProcedure";
import { insertData } from "@/utils/upload-data";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import * as THREE from "three";
import { currentStepAtom } from "../../atoms/currentStepAtom";
import { inputStepObjectAtom } from "../../atoms/inputStepObjectAtom";
import { useAtomValue } from "jotai";

type UseRegisterOrigami = (props: {
  origamiName: string;
  origamiColor: string;
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
}) => {
  handleRegisterOrigami: () => void;
};

export const useRegisterOrigami: UseRegisterOrigami = ({
  origamiName,
  origamiColor,
  sceneRef,
  cameraRef,
  rendererRef,
}) => {
  const currentStep = useAtomValue(currentStepAtom);
  const procedureIndex = currentStep.procedureIndex;
  const { data: session } = useSession();

  const inputStepObject = useAtomValue(inputStepObjectAtom);

  const fixBoards = inputStepObject[procedureIndex.toString()].fixBoards;
  const moveBoards = inputStepObject[procedureIndex.toString()].moveBoards;
  const numberOfMoveBoards =
    inputStepObject[procedureIndex.toString()].numberOfMoveBoards;
  const rotateAxis = inputStepObject[procedureIndex.toString()].rotateAxis;
  // const foldingAngle = inputStepObject[procedureIndex.toString()].foldingAngle;
  const isFoldingDirectionFront =
    inputStepObject[procedureIndex.toString()].isFoldingDirectionFront;
  const isMoveBoardsRight =
    inputStepObject[procedureIndex.toString()].isMoveBoardsRight;
  const description = inputStepObject[procedureIndex.toString()].description;

  const handleRegisterOrigami = () => {
    if (!origamiName) {
      console.error("Origami name is required.");
      return;
    }
    if (moveBoards.length === 0) return;
    if (rotateAxis.length === 0) return;
    // xy平面上の板のうち、z座標が大きい順に、numberOfMoveBoards枚を折る
    // それ以外の板は無条件で折る
    const { newProcedure } = decideNewProcedure({
      fixBoards,
      moveBoards,
      numberOfMoveBoards,
      rotateAxis,
      isFoldingDirectionFront,
      isMoveBoardsRight,
      description,
    });

    // TODO: ProcedureとinputStepObjectの整合性を取る
    // 現在はnewProcedureだけが入っているが、それまでの手順は入っていない
    const procedures = { [procedureIndex]: newProcedure };

    const model: Model = {
      name: origamiName,
      color: origamiColor,
      procedure: procedures,
    };

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!scene || !camera || !renderer) {
      console.error("Failed to register origami.");
      return;
    }

    renderer.render(scene, camera);

    renderer.domElement.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "model.png", { type: "image/png" });
      //   setPopup({ message: "データ送信中です", type: "info" });
      insertData(file, session, model).then(() => {
        // setPopup({ message: "データの挿入に成功しました！", type: "success" });
        // setTimeout(() => {
        //   redirect("/");
        // }, 1500);
        redirect("/");
      });
    });
  };

  return {
    handleRegisterOrigami,
  };
};
