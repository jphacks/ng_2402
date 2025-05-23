"use client";

import React, { useRef, useState } from "react";
import styles from "./index.module.scss";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { FoldMethodControlPanel } from "./FoldMethodControlPanel";
import { NameAndColorControlPanel } from "./NameAndColorControlPanel";
import Popup from "./Popup";
import { useInitScene } from "./hooks/useInitScene";
import { useSelectPoints } from "./hooks/useSelectPoints";
import { useDecideRotateAxis } from "./hooks/useDecideRotateAxis";
import { useDecideTargetBoard } from "./hooks/useDecideTargetBoard";
import { useSelectSideAndNumberOfBoards } from "./hooks/useSelectSideAndNumberOfBoards";
import { useRotateBoards } from "./hooks/useRotateBoards";
import { useDecideFoldMethod } from "./hooks/useDecideFoldMethod";
import { useRegisterOrigami } from "./hooks/useRegisterOrigami";
import { useOrigamiName } from "./hooks/useOrigamiName";
import { useOrigamiColor } from "./hooks/useOrigamiColor";
import { currentStepAtom } from "./atoms/currentStepAtom";
import { inputStepObjectAtom } from "./atoms/inputStepObjectAtom";
import { useAtom } from "jotai";

export const OrigamiPost = () => {
  // 常に保持しておきたい変数
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const { origamiName, handleOrigamiNameChange } = useOrigamiName();
  const { origamiColor, handleOrigamiColorChange } = useOrigamiColor();

  // 折り方選択で、現在のステップを保持する変数
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const inputStep = currentStep.inputStep;
  const procedureIndex = currentStep.procedureIndex;

  const [inputStepObject, setInputStepObject] = useAtom(inputStepObjectAtom);
  const currentInputStepObject = inputStepObject[procedureIndex.toString()];

  const foldingAngle = currentInputStepObject.foldingAngle;
  const numberOfMoveBoards = currentInputStepObject.numberOfMoveBoards;
  const isFoldingDirectionFront =
    currentInputStepObject.isFoldingDirectionFront;
  const maxNumberOfMoveBoards = currentInputStepObject.maxNumberOfMoveBoards;
  const origamiDescription = currentInputStepObject.description;

  const inputStepLength = Object.keys(inputStepObject).length;

  // TODO: 再レンダリングが増えそう？
  const handleOrigamiDescriptionChange = (description: string) => {
    setInputStepObject((prev) => ({
      ...prev,
      [procedureIndex.toString()]: {
        ...prev[procedureIndex.toString()],
        description,
      },
    }));
  };
  const handleFoldingAngleChange = (angle: number) => {
    setInputStepObject((prev) => ({
      ...prev,
      [procedureIndex.toString()]: {
        ...prev[procedureIndex.toString()],
        foldingAngle: angle,
      },
    }));
  };

  // TODO: あとで綺麗にする
  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleClosePopup = () => {
    setPopup(null);
  };

  const handleCancelFoldTarget = () => {
    // TODO: fixBoardsを元に戻す処理
    // setMoveBoards([]);
    // setFixBoards([initialBoard]);
    // setInputStep("target");
  };

  const handleChangeStep = (step: number) => {
    setCurrentStep({ inputStep: "fold", procedureIndex: step });
  };

  // シーンの初期化
  useInitScene({
    canvasRef,
    sceneRef,
    cameraRef,
    rendererRef,
    controlsRef,
    raycasterRef,
  });

  // step1：折り線の点の選択
  // 板と点の描画を行う。点を選択できるようにする。
  useSelectPoints({
    canvasRef,
    sceneRef,
    cameraRef,
    rendererRef,
    raycasterRef,
    origamiColor,
  });

  // 入力された点から回転軸を決定。板を左右に分割する。
  const { handleDecideRotateAxis, handleCancelRotateAxis } =
    useDecideRotateAxis();

  // step2：板を折る対象を決定
  // 板の描画を行う。左右どちらの板を対象にするかを選択できるようにする。
  const { handleDecideFoldTarget } = useDecideTargetBoard({
    canvasRef,
    sceneRef,
    cameraRef,
    raycasterRef,
    origamiColor,
  });

  // step3：板を折る方向と枚数を決定
  const { handleFoldFrontSide, handleFoldBackSide } =
    useSelectSideAndNumberOfBoards();

  // 回転に応じて板を描画
  useRotateBoards({
    sceneRef,
    origamiColor,
  });

  const { handleDecideFoldMethod } = useDecideFoldMethod();

  const { handleRegisterOrigami } = useRegisterOrigami({
    origamiName,
    origamiColor,
    sceneRef,
    cameraRef,
    rendererRef,
  });

  return (
    <>
      <canvas ref={canvasRef} id="canvas" className={styles.model} />
      <div className={styles.namePanelContainer}>
        <NameAndColorControlPanel
          name={origamiName}
          handleNameChange={handleOrigamiNameChange}
          color={origamiColor}
          handleColorChange={handleOrigamiColorChange}
        />
      </div>
      <div className={styles.panelContainer}>
        <FoldMethodControlPanel
          handleDecideRotateAxis={handleDecideRotateAxis}
          handleCancelRotateAxis={handleCancelRotateAxis}
          handleDecideFoldTarget={handleDecideFoldTarget}
          handleCancelFoldTarget={handleCancelFoldTarget}
          handleFoldFrontSide={handleFoldFrontSide}
          handleFoldBackSide={handleFoldBackSide}
          foldAngle={foldingAngle}
          handleFoldingAngleChange={handleFoldingAngleChange}
          handleDecideFoldMethod={handleDecideFoldMethod}
          currentStep={inputStep}
          totalNumber={maxNumberOfMoveBoards}
          currentNumber={numberOfMoveBoards}
          isFoldFrontSide={isFoldingDirectionFront}
          handleRegisterOrigami={handleRegisterOrigami}
          origamiDescription={origamiDescription}
          handleOrigamiDescriptionChange={handleOrigamiDescriptionChange}
          inputStepLength={inputStepLength}
          procedureIndex={procedureIndex}
          handleChangeStep={handleChangeStep}
        />
      </div>
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};
