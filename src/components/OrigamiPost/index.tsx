"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { separateBoard } from "./logics/separateBoard";
import { getAllIntersections } from "./logics/getAllIntersections";
import { isOnLeftSide } from "./logics/isOnLeftSide";

type Point = [number, number, number];
type Board = Point[];

const renderBoard = (scene: THREE.Scene, board: Board) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(board.flat()), 3)
  );

  if (board.length >= 4) {
    const indices = [];
    for (let j = 0; j < board.length - 2; j++) {
      indices.push(0, j + 1, j + 2);
    }
    geometry.setIndex(indices);
  }

  const frontMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("red"),
    side: THREE.FrontSide,
    transparent: true,
  });
  const backMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#DFDFDF"),
    side: THREE.BackSide,
    transparent: true,
  });
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1,
  });

  const frontMesh = new THREE.Mesh(geometry, frontMaterial);
  const backMesh = new THREE.Mesh(geometry, backMaterial);
  scene.add(frontMesh);
  scene.add(backMesh);

  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
  scene.add(wireframe);
};

export const OrigamiPost = () => {
  const initialBoard: Board = [
    [18, 18, 0],
    [-18, 18, 0],
    [-18, -18, 0],
    [18, -18, 0],
  ];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);

  const [fixBoards, setFixBoards] = useState<Board[]>([initialBoard]);
  const [moveBoards, setMoveBoards] = useState<Board[]>([]);
  const [rotateAxis, setRotateAxis] = useState<[Point, Point] | []>([]);

  const [foldingAngle, setFoldingAngle] = useState(0);

  // シーンの初期化
  useEffect(() => {
    const canvas = canvasRef.current!;
    let scene = sceneRef.current;
    let renderer = rendererRef.current;
    let camera = cameraRef.current;
    let controls = controlsRef.current;
    let raycaster = raycasterRef.current;

    if (!scene) {
      scene = new THREE.Scene();
    }
    sceneRef.current = scene;

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (!renderer) {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
    }

    if (!camera) {
      camera = new THREE.PerspectiveCamera(
        40,
        sizes.width / sizes.height,
        10,
        1000
      );
      camera.position.set(0, 0, 100); // 右斜め上からモデルを見るようにカメラ位置を設定
      camera.lookAt(new THREE.Vector3(0, 0, 0)); // モデルの中心を見るようにカメラの向きを設定
      scene.add(camera);
      cameraRef.current = camera;
    }

    if (!controls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;
    }

    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    fixBoards.forEach((board) => renderBoard(scene, board));

    if (!raycaster) {
      raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;
    }

    render();

    const resizeListener = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener("resize", resizeListener);

    let points: Point[] = [];
    const clickListener = (event: MouseEvent) => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / sizes.width) * 2 - 1;
      mouse.y = -(event.clientY / sizes.height) * 2 + 1;

      // Raycasterのセットアップ
      raycaster.setFromCamera(mouse, camera);

      // エッジに対してRaycasterを適用して交差を調べる
      const edges = scene.children.filter(
        (child) => child.type === "LineSegments"
      );
      const intersects = raycaster.intersectObjects(edges, true);

      if (intersects.length > 0) {
        const point = intersects[0].point; // 最初の交差点の座標を取得

        // pointで点を描画
        const geometry = new THREE.BufferGeometry().setFromPoints([point]);
        const material = new THREE.PointsMaterial({ color: 0x000000 });
        const pointMesh = new THREE.Points(geometry, material);
        scene.add(pointMesh);

        points.push([point.x, point.y, point.z]);

        if (points.length >= 2) {
          // TODO: 同じ板上にある2点を選択していない場合エラーになる
          // この2点を結ぶ線で板を分割する。
          const axis: [Point, Point] = [[...points[0]], [...points[1]]];
          setRotateAxis(axis);

          let leftBoards: Board[] = [];
          let rightBoards: Board[] = [];

          fixBoards.forEach((board) => {
            const intersections = getAllIntersections({
              board,
              rotateAxis: axis,
            });

            if (intersections.length === 2) {
              // 板を分割する場合
              const separatedBoard = separateBoard({
                board,
                rotateAxis: axis,
              });
              if (!separatedBoard) return alert("Failed to separate board.");

              const { leftBoard, rightBoard } = separatedBoard;

              console.log("leftBoard", leftBoard);
              console.log("rightBoard", rightBoard);
              leftBoards.push(leftBoard);
              rightBoards.push(rightBoard);
            } else {
              // 板を分割しない場合
              // 板が回転軸の左側にあるか、右側にあるかを判定
              // TODO: 一部分だけ回転軸の左右にある場合はエラーになる。

              const isLeftSide = board.map((point) =>
                isOnLeftSide({
                  point,
                  axis1: axis[0],
                  axis2: axis[1],
                })
              );
              const isAllLeft = isLeftSide.every((b) => b);
              const isAllRight = isLeftSide.every((b) => !b);

              console.log("intersection", intersections);

              // NOTE: ここが原因で、false falseになっている
              console.log(isAllLeft, isAllRight);

              if (isAllLeft) {
                leftBoards.push(board);
              } else if (isAllRight) {
                rightBoards.push(board);
              } else {
                console.log("板が回転軸の左右にまたがっている");
              }
            }
          });

          // boardを削除する
          scene.children = scene.children.filter(
            (child) => child.type !== "Mesh" && child.type !== "LineSegments"
          );

          // pointを削除する
          scene.children = scene.children.filter(
            (child) => child.type !== "Points"
          );

          setFixBoards(leftBoards);
          setMoveBoards(rightBoards);

          leftBoards.forEach((board) => renderBoard(scene, board));
          rightBoards.forEach((board) => renderBoard(scene, board));

          points = [];
          leftBoards = [];
          rightBoards = [];

          renderer.render(scene, camera);
        }
      }
    };

    canvas.addEventListener("click", clickListener);

    return () => {
      window.removeEventListener("resize", resizeListener);
      canvas.removeEventListener("click", clickListener);
    };
  }, [fixBoards]);

  // 回転に応じて板を描画
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (rotateAxis.length === 0) return;

    // 前の板を削除
    scene.children = scene.children.filter((child) => child.type === "Line");

    // そのままの板と、回転後の板を保持
    const boards = [...fixBoards];
    const theta = THREE.MathUtils.degToRad(foldingAngle);
    // 通常の折り方の場合
    const axis = new THREE.Vector3(...rotateAxis[0])
      .sub(new THREE.Vector3(...rotateAxis[1]))
      .normalize();
    const subNode = new THREE.Vector3(...rotateAxis[0]);

    for (let i = 0; i < moveBoards.length; i++) {
      const moveBoard = moveBoards[i];
      const newBoard: Board = moveBoard.map((point) => {
        const node = new THREE.Vector3(...point);
        const rotateNode = node.clone().sub(subNode);
        rotateNode.applyAxisAngle(axis, theta);
        rotateNode.add(subNode);
        return [rotateNode.x, rotateNode.y, rotateNode.z] as Point;
      });
      boards.push(newBoard);
    }

    // 板を描画
    boards.forEach((board) => {
      renderBoard(scene, board);
    });
  }, [foldingAngle, fixBoards, moveBoards, rotateAxis]);

  const handleDecideBoards = () => {
    // moveBoardsを回転した後の板を、fixBoardsに追加する
    if (moveBoards.length === 0) return;
    if (rotateAxis.length === 0) return;
    const boards = [...fixBoards];
    const theta = THREE.MathUtils.degToRad(foldingAngle);
    const axis = new THREE.Vector3(...rotateAxis[0])
      .sub(new THREE.Vector3(...rotateAxis[1]))
      .normalize();
    const subNode = new THREE.Vector3(...rotateAxis[0]);

    for (let i = 0; i < moveBoards.length; i++) {
      const moveBoard = moveBoards[i];
      const newBoard: Board = moveBoard.map((point) => {
        const node = new THREE.Vector3(...point);
        const rotateNode = node.clone().sub(subNode);
        rotateNode.applyAxisAngle(axis, theta);
        rotateNode.add(subNode);
        return [rotateNode.x, rotateNode.y, rotateNode.z] as Point;
      });
      boards.push(newBoard);
    }

    // boardsの格値を少数第2位までにする
    const roundedBoards = boards.map((board) =>
      board.map((point) => point.map((v) => Math.round(v * 100) / 100) as Point)
    );

    setFixBoards(roundedBoards);
    setMoveBoards([]);
    setRotateAxis([]);
    setFoldingAngle(0);

    console.log("decide ------------------------------------------");
  };

  return (
    <>
      <canvas ref={canvasRef} id="canvas" className={styles.model} />
      <div className={styles.rangeBar}>
        0
        <input
          type="range"
          min="0"
          max="180"
          step="1"
          value={foldingAngle}
          onChange={(e) => setFoldingAngle(Number(e.target.value))}
        />
        180
      </div>
      <button className={styles.button} onClick={handleDecideBoards}>
        確定
      </button>
    </>
  );
};
