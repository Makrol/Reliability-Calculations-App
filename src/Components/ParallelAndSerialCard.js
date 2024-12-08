import React, { useState, useCallback, useEffect, useRef, Fragment } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import "../App.css";
import CustomNode from "./CustomNode";
import EnterNode from "./EnterNode";
import ExitNode from "./ExitNode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
let id = 0;
const getId = () => `node_${id++}`;
const initialNodes = [
  {
    id: "enter",
    type: "enterNode",
    position: { x: 50, y: 250 },
    data: {
      label: "",
      Ti: "",
      Tni: "",
    },
  },
  {
    id: "exit",
    type: "exitNode",
    position: { x: 150, y: 250 },
    data: {
      label: "",
      Ti: "",
      Tni: "",
    },
  },
];
const customNodes = {
  customNode: (props) => <CustomNode {...props} />,
  enterNode: (props) => <EnterNode {...props} />,
  exitNode: (props) => <ExitNode {...props} />,
};
const ParallelAndSerialCard = () => {
  const diagramRef = useRef();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [parallelNodesGroups, setParallelNodesGroups] = useState([]);
  const [coefficients, setCoefficients] = useState([]);
  const [finalKgn, setFinalKgn] = useState(0);
  const [finalET, setFinalET] = useState(0);
  const [finalETn, setFinalETn] = useState(0);
  const [parallelEnterEnd, setParallelEnterEnd] = useState([]);

  // Dodawanie nowego węzła
  const addNode = () => {
    debugger
    const newNode = {
      id: getId(),
      type: "customNode",
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: "",
        Ti: "",
        Tni: "",
        onChangeTi,
        onChangeTni,
        onChangeLabel,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };
  const calculateFinal = () => {
    setParallelEnterEnd([]);
    findGroup("enter", 0);
    //debugger;
    const result = afunction("enter", 1, false);
    if (!result) return;
    setFinalET(result.et);
    setFinalETn(result.etn);
    setFinalKgn(result.kg);
  };

  const onChangeTi = (event, nodeId) => {
    const { value } = event.target;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, Ti: value } }
          : node
      )
    );
  };
  const onChangeLabel = (event, nodeId) => {
    const { value } = event.target;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: value } }
          : node
      )
    );
  };
  const onChangeTni = (event, nodeId) => {
    const { value } = event.target;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, Tni: value } }
          : node
      )
    );
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const findParallelNodes = () => {
    const parallelNodes = [];
    nodes.forEach((node) => {
      let source = -1;
      let counter = 0;
      const groupNodes = [];
      edges.forEach((edge) => {
        if (edge.source === node.id || edge.targer === node.id) {
          counter++;
          source = edge.source;
          if (edge.source !== node.id) groupNodes.push(edge.source);
          else if (edge.target !== node.id) groupNodes.push(edge.target);
        }
      });
      if (counter > 1) {
        var num = 1;
        groupNodes.forEach((e) => {
          num *= 1 - coefficients.find((kgnE) => kgnE.id === e).kgn;
        });
        parallelNodes.push({
          group: groupNodes,
          kgn: 1 - num,
          enter: source,
          exit: -1,
        });
      }
    });
    return parallelNodes;
  };
  const findGroup = (nodeId, waitFor) => {
    let enter;
    const branches = edges.filter((e) => e.source === nodeId);
    if (branches.length === 1) {
      const joints = edges.filter((e) => e.target === branches[0].target);
      if (joints.length > 1) return joints[0].target;
    } else if (branches.length > 1) {
      waitFor += 1;
      enter = branches[0].source;
    }

    const jointGroup = [];
    branches.forEach((br) => {
      jointGroup.push(findGroup(br.target, waitFor + 1));
    });
    let isJoint = true;
    jointGroup.forEach((j) => {
      if (j !== jointGroup[0]) {
        isJoint = false;

        return nodeId;
      }
    });
    if (isJoint) {
      if (enter !== undefined)
        parallelEnterEnd.push({ enter: enter, end: jointGroup[0] });
      if (waitFor > 0) {
        if (jointGroup[0] === undefined) return findGroup(nodeId, waitFor - 1);
        else return findGroup(jointGroup[0], waitFor - 1);
      }
    }
    return nodeId;
  };
  const claculateCoefficients = () => {
    const returnVal = [];
    nodes.forEach((node) => {
      returnVal.push({
        id: node.id,
        label: node.data.label,
        kgn:
          parseFloat(node.data.Ti) /
          (parseFloat(node.data.Ti) + parseFloat(node.data.Tni)),
        ti: parseFloat(node.data.Ti),
        tni: parseFloat(node.data.Tni),
        Eti: 1 / parseFloat(node.data.Ti),
        Etni:
          (parseFloat(node.data.Ti) + parseFloat(node.data.Tni)) /
          parseFloat(node.data.Ti),
      });
    });
    return returnVal;
  };

  const MySwal = withReactContent(Swal);
  const afunction = (nodeId, stopOn, serialStart) => {
    const cData = coefficients.find((e) => e.id === nodeId);
    if (cData.id !== "enter" && (cData.label === "" || isNaN(cData.kgn))) {
      MySwal.fire({
        html: (
          <p>Wypełnij wszystkie pola w każdym elemencie niezawodnosciowym</p>
        ),
        showConfirmButton: false,
        timer: 1500,
        icon: "warning",
      });
      return;
    }

    const enterNode = parallelEnterEnd.find((p) => p.enter === nodeId);

    //Is a knot the beginning of a fork?
    if (enterNode) {
      //determining the values ​​of the fork elements
      let kgValue = 1;
      let etValue = 1;
      let etnValue = 0;
      const paths = edges.filter((e) => e.source === enterNode.enter);
      paths.forEach((n) => {
        const result = afunction(n.target, enterNode.end);
        kgValue *= 1 - result.kg;
        etnValue += 1 / result.etn;
        etValue *= (result.et + result.etn) / result.etn;
      });

      //paraller values
      let returnKg = 1 - kgValue;
      let returnEtn = 1 / etnValue;
      let returnEt = returnEtn * (-1 + etValue);

      //is the next node the end of the fork?
      if (stopOn === enterNode.end)
        return {
          kg: returnKg,
          et: returnEt,
          etn: returnEtn,
        };
      else {
        //szeregowo
        let result = undefined;

        if (enterNode.end !== "exit") {
          result = afunction(enterNode.end);

          return {
            kg: cData.kgn * (1 - kgValue) * result.kg,
            et: cData.Eti + 1 / (etnValue * (-1 + etValue)) + result.et,
            etn:
              (cData.Eti + 1 / (etnValue * (-1 + etValue)) + result.et) *
              (-1 + cData.Etni * (1 / etnValue) * result.etn),
          };
        }
        if (nodeId === "enter") {
          return {
            kg: returnKg,
            et: returnEt,
            etn: returnEtn,
          };
        } else {
          //debugger;
          const cET = returnEt;
          const cETN = returnEtn;
          returnKg = returnKg * cData.kgn;
          returnEt = 1 / (cData.Eti + 1 / returnEt);
          returnEtn =
            returnEt *
            (-1 + ((cData.ti + cData.tni) / cData.ti) * ((cET + cETN) / cET));
          return {
            kg: returnKg,
            et: returnEt,
            etn: returnEtn,
          };
        }
      }
    } else {
      const edge = edges.find((e) => e.source === nodeId);
      if (!edge?.target) return;
      if (stopOn && edge.target === stopOn) {
        return { kg: cData.kgn, et: cData.ti, etn: cData.tni };
      } else if (edge) {
        //szeregowo
        let result = undefined;
        if (edge.target !== "exit") {
          result = afunction(edge.target, 1, nodeId === "enter" ? true : false);
        }
        if (serialStart) {
          if (nodeId === "enter")
            return {
              kg: result.kg,
              et: result.et,
              etn: result.etn,
            };
          else if (result !== undefined) {
            return {
              kg: result.kg * cData.kgn,
              et: 1 / (result.et + cData.Eti),
              etn:
                (1 / (result.et + cData.Eti)) *
                (-1 + 1 / (result.kg * cData.kgn)),
            };
          }
        } else if (result !== undefined) {
          if (nodeId === "enter")
            return { kg: result.kg, et: result.et, etn: result.etn };
          else
            return {
              kg: result.kg * cData.kgn,
              et: result.et + cData.Eti,
              etn: 1 / (result.kg * cData.kgn),
            };
        }
      }
      return { kg: cData.kgn, et: cData.Eti, etn: 1 / cData.kgn };
    }
  };
  useEffect(() => {
    setParallelNodesGroups(findParallelNodes());
  }, [edges, nodes]);

  useEffect(() => {
    setCoefficients(claculateCoefficients());
  }, [nodes]);

  const saveToPdf = async () => {
    const element = diagramRef.current;

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 1,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("portrait", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgWidth = Math.min(pageWidth, 150);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imageX = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      pdf.addImage(imgData, "PNG", imageX, 10, imgWidth, imgHeight);
      let rows = [];

      let counter = 0;
      coefficients.forEach((element) => {
        if (counter > 1)
          rows.push([
            element.label,
            "T=" + element.ti+"[h]" + ", Tn=" + element.tni+"[h]" + ", Kg=" + element.kgn,
          ]);
        counter++;
      });
      pdf.setFontSize(12);
      pdf.text("Dane elementow struktury", 10, imgHeight + 30);

      autoTable(pdf, {
        startY: imgHeight + 35,
        head: [["Nazwa", "Wartosci"]],
        body: rows,
      });

      const secondTableStartY = pdf.lastAutoTable.finalY + 10;
      pdf.text("Wyniki koncowe", 10, secondTableStartY);

      //debugger;
      autoTable(pdf, {
        startY: secondTableStartY + 5,
        head: [["Kg", "ET", "ETn"]],
        body: [[finalKgn, finalET+"[h]", finalETn+"[h]"]],
      });

      pdf.save("result.pdf");
    } catch (error) {
      console.error("Błąd podczas generowania PDF:", error);
    }
  };

  return (
    <Fragment>
      <div className="leftSection" ref={diagramRef}>
        <ReactFlowProvider>
          <div style={{ position: "absolute", right: 10, top: 10, zIndex: 10 }}>
            <button onClick={addNode}>Dodaj</button>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={customNodes}
            fitView
          >
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <div className="rightSection">
        <div className="container">
          {coefficients.map((v, k) => {
            if (k > 1)
              return (
                <div key={v.id} className="calculationContainer">
                  <div>Nazwa: {v.label}</div>
                  <div>
                    T<sub>{v.id.split("_")[1]}</sub>= {v.ti}
                  </div>
                  <div>
                    T<sub>n{v.id.split("_")[1]}</sub>= {v.tni} {"[h]"}
                  </div>
                  <div>
                    K<sub>g{v.id.split("_")[1]}</sub> = {v.kgn} {"[h]"}
                  </div>
                </div>
              );
          })}
          <div className="container">
            <div className="calculationContainer">
              <div>
                K<sub>g</sub> = {finalKgn}
              </div>
              <div>ET = {finalET} {"[h]"}</div>
              <div>ETn = {finalETn} {"[h]"}</div>
            </div>
            <button onClick={() => calculateFinal()}>Oblicz</button>
            <button onClick={saveToPdf}>Zapisz diagram do PDF</button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ParallelAndSerialCard;
